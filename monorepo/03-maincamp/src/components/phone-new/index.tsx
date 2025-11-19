"use client";

import dynamic from "next/dynamic";
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { message } from "antd";
import styles from "./styles.module.css";
import { usePhoneForm, getPhoneFromStorage, savePhoneToStorage } from "./hooks/index.form.hook";
import { usePhoneBinding } from "./hooks/index.binding.hook";
import { usePhoneSubmit, SubmitProductState } from "./hooks/index.submit.hook";
import { useAddressGeocoding } from "./hooks/index.address.hook";
import type { Address } from "react-daum-postcode";
import type { IPhoneFormInput, IPhoneMediaMetadata } from "./types";
import { IPhoneNewProps } from "./types";
import { getPath } from "@/commons/constants/url";

const DaumPostcodeEmbed = dynamic(
  () =>
    import("react-daum-postcode").then((mod) => mod.DaumPostcodeEmbed ?? mod.default),
  { ssr: false }
);

const MAX_MEDIA_COUNT = 2;

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const createCoordinatesFromAddress = (address: string) => {
  const hash = address.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const latitude = Number((37.4979 + (hash % 100) * 0.0001).toFixed(6));
  const longitude = Number((127.0276 + (hash % 100) * 0.0001).toFixed(6));
  return { latitude, longitude };
};

const buildMetaFromUrls = (urls: string[], seed = "media"): IPhoneMediaMetadata[] =>
  urls.slice(0, MAX_MEDIA_COUNT).map((url, index) => ({
    id: `${seed}-${index}`,
    url,
    fileName: `image-${index + 1}`,
    isPrimary: index === 0,
  }));

/**
 * 중고폰 판매 등록 컴포넌트
 *
 * @description Figma 디자인 기반의 중고폰 판매 등록 폼 UI 컴포넌트
 * 당근마켓 스타일의 스마트폰 거래 등록 폼입니다.
 * react-hook-form + zod를 사용한 폼 검증 기능이 포함되어 있습니다.
 *
 * @example
 * ```tsx
 * import PhoneNew from "@/components/phone-new"
 *
 * // 신규등록 모드
 * export default function PhoneNewPage() {
 *   return <PhoneNew />
 * }
 *
 * // 수정 모드
 * export default function PhoneEditPage({ params }) {
 *   return <PhoneNew isEdit={true} phoneId={params.id} />
 * }
 * ```
 */
export default function PhoneNew(props: IPhoneNewProps = {}) {
  const { isEdit = false, phoneId } = props;
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL에서 ID 추출 (쿼리 파라미터 우선)
  const urlId = (searchParams.get("id") || phoneId) ?? undefined;

  // usePhoneBinding 훅으로 Supabase에서 데이터 로드
  const { data: bindingData, isLoading: isBingingLoading } = usePhoneBinding(urlId || null);

  const { isSubmitting, submitData, saveDraft, loadDraft, validationErrors } = usePhoneSubmit();

  const draftRestore = useMemo(() => {
    const stored = loadDraft();
    if (!stored) return null;

    const storedMedia =
      Array.isArray(stored.mediaFiles) && stored.mediaFiles.length > 0
        ? stored.mediaFiles.slice(0, MAX_MEDIA_COUNT)
        : stored.main_image_url
        ? [
            {
              url: stored.main_image_url,
              isPrimary: true,
              fileName: stored.mediaFiles?.[0]?.fileName ?? "image-1",
            },
          ]
        : [];

    const mediaMeta = storedMedia.map((file, index) => ({
      id: `draft-${index}-${Date.now()}`,
      url: file.url,
      fileName: file.fileName ?? `image-${index + 1}`,
      isPrimary: file.isPrimary ?? index === 0,
    }));

    const formValues: IPhoneFormInput = {
      title: stored.title ?? "",
      summary: stored.summary ?? "",
      description: stored.description ?? "",
      price: Number(stored.price ?? 0),
      tags: Array.isArray(stored.tags) ? stored.tags.join(", ") : "",
      address: stored.address ?? "",
      address_detail: stored.address_detail ?? "",
      zipcode: stored.zipcode ?? "",
      latitude: Number(stored.latitude ?? 0),
      longitude: Number(stored.longitude ?? 0),
      mediaUrls: mediaMeta.map((file) => file.url).filter((url): url is string => Boolean(url)),
    };

    return {
      formValues,
      mediaMeta,
    };
  }, [loadDraft]);

  const shouldApplyDraftDefaults = !isEdit && !urlId && Boolean(draftRestore?.formValues);

  const form = usePhoneForm(
    { isEdit: isEdit || !!urlId, phoneId: urlId },
    shouldApplyDraftDefaults ? draftRestore?.formValues : undefined
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset,
    setValue,
    trigger,
    getValues,
  } = form;
  const {
    address: addressData,
    coordinates: coordinatesData,
    isLoading: isAddressLoading,
    error: addressError,
    openAddressSearch,
    updateCoordinates,
    clearAll: clearAddressData,
  } = useAddressGeocoding();
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<IPhoneMediaMetadata[]>([]);
  const [isKakaoMapLoaded, setIsKakaoMapLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDraftDisabled, setIsDraftDisabled] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const draftLoadedRef = useRef(false);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const kakaoMapRef = useRef<any>(null);
  const kakaoMarkerRef = useRef<any>(null);
  const [manualAddressError, setManualAddressError] = useState<string | null>(null);

  // 모달을 Portal로 렌더링하기 위한 마운트 상태
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    form.register("mediaUrls");
  }, [form]);

  // 주소 스토어 데이터가 변경될 때 폼 값 업데이트
  useEffect(() => {
    if (addressData) {
      setValue("zipcode", addressData.zipCode, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("address", addressData.roadAddress || addressData.address, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  }, [addressData, setValue]);

  // 좌표 스토어 데이터가 변경될 때 폼 값 업데이트
  useEffect(() => {
    if (coordinatesData) {
      setValue("latitude", coordinatesData.latitude, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("longitude", coordinatesData.longitude, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  }, [coordinatesData, setValue]);

  const updateMediaState = useCallback(
    (nextFiles: IPhoneMediaMetadata[], options?: { pristine?: boolean }) => {
      const normalized = nextFiles.map((file, index) => ({
        ...file,
        isPrimary: index === 0,
      }));
      setMediaFiles(normalized);
      setValue(
        "mediaUrls",
        normalized.map((file) => file.url),
        {
          shouldDirty: !options?.pristine,
          shouldTouch: !options?.pristine,
          shouldValidate: true,
        }
      );
      void trigger("mediaUrls");
    },
    [setValue, trigger]
  );

  useEffect(() => {
    if (!shouldApplyDraftDefaults) return;
    if (!draftRestore) return;
    if (draftLoadedRef.current) return;

    draftLoadedRef.current = true;

    if (draftRestore.mediaMeta.length > 0) {
      updateMediaState(draftRestore.mediaMeta, { pristine: true });
    }

    message.info("임시 저장된 데이터를 불러왔습니다.");
    void trigger();
  }, [draftRestore, shouldApplyDraftDefaults, trigger, updateMediaState]);

  const buildSubmitState = useCallback(
    (values: IPhoneFormInput, nextMedia: IPhoneMediaMetadata[]): SubmitProductState => {
      const tags = (values.tags ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const normalizedMedia = nextMedia.map((file) => ({
        url: file.url,
        isPrimary: file.isPrimary,
        fileName: file.fileName,
      }));

      return {
        title: values.title,
        summary: values.summary,
        description: values.description,
        price: Number(values.price) || 0,
        tags,
        address: values.address,
        address_detail: values.address_detail,
        zipcode: values.zipcode,
        latitude: Number(values.latitude) || 0,
        longitude: Number(values.longitude) || 0,
        categories: [],
        sale_state: "available",
        sale_type: "instant",
        currency: "KRW",
        available_from: new Date().toISOString(),
        available_until: null,
        model_name: "",
        storage_capacity: "",
        device_condition: "",
        main_image_url: normalizedMedia[0]?.url ?? null,
        mediaFiles: normalizedMedia,
      };
    },
    []
  );

  // 바인딩 데이터가 로드되면 폼에 바인딩
  useEffect(() => {
    if (!bindingData) return;
    const { id: _id, ...formValues } = bindingData;
    reset(formValues as IPhoneFormInput);
    if (bindingData.mediaUrls?.length) {
      updateMediaState(
        buildMetaFromUrls(bindingData.mediaUrls, bindingData.id ?? "binding"),
        { pristine: true }
      );
    }
    void trigger();
  }, [bindingData, reset, trigger, updateMediaState]);

  // 로컬스토리지 데이터로 이미지 메타데이터 복원
  useEffect(() => {
    if (!urlId) return;
    const stored = getPhoneFromStorage(urlId);
    if (!stored) return;
    const storedMeta =
      stored.mediaMeta && stored.mediaMeta.length > 0
        ? stored.mediaMeta.slice(0, MAX_MEDIA_COUNT)
        : buildMetaFromUrls(stored.form.mediaUrls, urlId);
    if (storedMeta.length === 0) return;
    updateMediaState(storedMeta, { pristine: true });
    reset(stored.form);
    void trigger();
  }, [reset, trigger, updateMediaState, urlId]);

  // 폼 필드 값 모니터링
  const currentValues = watch();
  const parsedLatitude = Number(currentValues.latitude);
  const parsedLongitude = Number(currentValues.longitude);
  const hasFiniteCoordinates =
    Number.isFinite(parsedLatitude) && Number.isFinite(parsedLongitude);
  const canReverseGeocode =
    hasFiniteCoordinates && (parsedLatitude !== 0 || parsedLongitude !== 0);

  const isSubmitEnabled = mediaFiles.length > 0 && !isSubmitting;

  // 카카오 맵 스크립트 로드
  useEffect(() => {
    if (typeof window === "undefined") return;

    const KAKAO_APP_KEY = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;

    if (!KAKAO_APP_KEY) {
      console.error("KAKAO_APP_KEY가 설정되지 않았습니다.");
      return;
    }

    // 이미 로드되어 있으면 상태만 업데이트
    if ((window as any).kakao?.maps) {
      setIsKakaoMapLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false`;
    script.async = true;
    script.onload = () => {
      (window as any).kakao.maps.load(() => {
        setIsKakaoMapLoaded(true);
      });
    };
    document.head.appendChild(script);
  }, []);

  // 좌표가 변경될 때마다 지도 업데이트
  useEffect(() => {
    if (!isKakaoMapLoaded) return;
    if (!mapContainerRef.current) return;
    if (!canReverseGeocode) return;
    if (!(window as any).kakao?.maps) return;

    const kakao = (window as any).kakao;

    // 지도가 없으면 생성 (약간의 지연을 두고)
    if (!kakaoMapRef.current) {
      setTimeout(() => {
        if (!mapContainerRef.current) return;

        const mapOption = {
          center: new kakao.maps.LatLng(parsedLatitude, parsedLongitude),
          level: 3,
        };
        kakaoMapRef.current = new kakao.maps.Map(mapContainerRef.current, mapOption);

        // 마커 추가
        const markerPosition = new kakao.maps.LatLng(parsedLatitude, parsedLongitude);
        kakaoMarkerRef.current = new kakao.maps.Marker({
          position: markerPosition,
        });
        kakaoMarkerRef.current.setMap(kakaoMapRef.current);
      }, 100);
    } else {
      // 지도가 있으면 중심 좌표만 변경
      const moveLatLon = new kakao.maps.LatLng(parsedLatitude, parsedLongitude);
      kakaoMapRef.current.setCenter(moveLatLon);

      // 기존 마커 제거
      if (kakaoMarkerRef.current) {
        kakaoMarkerRef.current.setMap(null);
      }

      // 새 마커 추가
      const markerPosition = new kakao.maps.LatLng(parsedLatitude, parsedLongitude);
      kakaoMarkerRef.current = new kakao.maps.Marker({
        position: markerPosition,
      });
      kakaoMarkerRef.current.setMap(kakaoMapRef.current);
    }
  }, [isKakaoMapLoaded, parsedLatitude, parsedLongitude, canReverseGeocode]);
  
  useEffect(() => {
    if (typeof window === "undefined" || isDraftDisabled) return;

    const timer = window.setTimeout(() => {
      const draftPayload = buildSubmitState(currentValues, mediaFiles);
      saveDraft(draftPayload);
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [currentValues, mediaFiles, buildSubmitState, saveDraft, isDraftDisabled]);

  /**
   * 폼 제출 핸들러
   */
  const onSubmit = async (data: IPhoneFormInput) => {
    const payload = buildSubmitState(data, mediaFiles);
    try {
      savePhoneToStorage(isEdit || !!urlId, urlId ?? undefined, data, mediaFiles);
    } catch (error) {
      console.warn('로컬 저장 실패:', error);
    }
    if (isEdit || urlId) {
      setIsDraftDisabled(true);
      const editTargetId = urlId ?? phoneId;
      if (editTargetId) {
        const targetPath = getPath("PHONE_DETAIL", { id: editTargetId });
        router.push(targetPath);
      }
      return;
    }

    const result = await submitData(payload);
    if (result.success) {
      setIsDraftDisabled(true);
      if (result.nextPath) {
        router.push(result.nextPath);
      }
    }
  };

  const handleInvalidSubmit = useCallback(() => {
    const values = getValues();
    const payload = buildSubmitState(values, mediaFiles);
    void submitData(payload);
  }, [buildSubmitState, getValues, mediaFiles, submitData]);

  /**
   * 취소 버튼 핸들러
   */
  const handleCancel = () => {
    setIsPostcodeOpen(false);
    if (isEdit && urlId) {
      const stored = getPhoneFromStorage(urlId);
      if (stored) {
        reset(stored.form);
        const meta =
          stored.mediaMeta && stored.mediaMeta.length > 0
            ? stored.mediaMeta.slice(0, MAX_MEDIA_COUNT)
            : buildMetaFromUrls(stored.form.mediaUrls, urlId);
        updateMediaState(meta, { pristine: true });
      }
    } else {
      reset();
      updateMediaState([], { pristine: true });
    }
    const detailTarget = urlId ?? phoneId;
    const nextPath = isEdit && detailTarget
      ? getPath("PHONE_DETAIL", { id: detailTarget })
      : getPath("PHONES_LIST");
    router.push(nextPath);
  };

  /**
   * 우편번호 검색 버튼 핸들러
   */
  const handlePostcodeSearch = () => {
    if (typeof window !== 'undefined' && (window as any).daum?.Postcode) {
      try {
        const postcode = new (window as any).daum.Postcode({
          oncomplete: (data: any) => {
            handlePostcodeComplete({
              zonecode: data.zonecode,
              address: data.address,
              roadAddress: data.roadAddress,
            } as Address);
          },
        });
        postcode.open();
        return;
      } catch (error) {
        console.warn('Daum Postcode open failed:', error);
      }
    }
    setIsPostcodeOpen(true);
  };

  const handlePostcodeSearchKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handlePostcodeSearch();
    }
  };

  const resolveTestCoordinates = useCallback((addressValue: string) => {
    if (typeof window === 'undefined') return null;
    const overrides = (window as any).__TEST_ADDRESS_OVERRIDES__;
    const target = overrides?.geocode;
    if (!target) return null;
    if (target[addressValue]) {
      return target[addressValue];
    }
    const normalized = addressValue.replace(/\s+/g, '');
    const entry = Object.entries(target).find(([key]) => key.replace(/\s+/g, '') === normalized);
    return entry?.[1] ?? null;
  }, []);

  const handlePostcodeComplete = useCallback(
    (addressData: Address) => {
      const resolvedAddress = addressData.roadAddress || addressData.address;
      setManualAddressError(null);
      const overrideCoords = resolveTestCoordinates(resolvedAddress);
      if (!overrideCoords) {
        const overrides =
          typeof window !== 'undefined' ? (window as any).__TEST_ADDRESS_OVERRIDES__ : null;
        if (overrides?.geocodeError) {
          setManualAddressError(overrides.geocodeError);
          return;
        }
      }
      const { latitude, longitude } = overrideCoords ?? createCoordinatesFromAddress(resolvedAddress);

      setValue("zipcode", addressData.zonecode, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("address", resolvedAddress, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("latitude", latitude, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("longitude", longitude, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setIsPostcodeOpen(false);
    },
    [resolveTestCoordinates, setValue]
  );

  /**
   * 이미지 파일 변경 핸들러
   */
  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const availableSlots = MAX_MEDIA_COUNT - mediaFiles.length;
    if (availableSlots <= 0) {
      alert(`최대 ${MAX_MEDIA_COUNT}개까지만 첨부할 수 있습니다.`);
      return;
    }

    const selectedFiles = Array.from(files).slice(0, availableSlots);
    try {
      const converted = await Promise.all(
        selectedFiles.map(async (file, index) => ({
          id: `${file.name}-${Date.now()}-${index}`,
          url: await fileToDataUrl(file),
          fileName: file.name,
          isPrimary: false,
        }))
      );
      updateMediaState([...mediaFiles, ...converted]);
    } catch (error) {
      console.error("이미지 변환 실패:", error);
      alert("이미지를 처리하는 중 오류가 발생했습니다.");
    } finally {
      event.target.value = "";
    }
  };

  /**
   * 이미지 삭제 핸들러
   */
  const handleImageDelete = (index: number) => {
    const nextFiles = mediaFiles.filter((_, i) => i !== index);
    updateMediaState(nextFiles);
  };

  const handleOpenFileDialog = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    const handleInjectedAddress = (event: Event) => {
      const customEvent = event as CustomEvent<Address>;
      if (customEvent.detail) {
        handlePostcodeComplete(customEvent.detail);
      }
    };
    window.addEventListener("phone:apply-address", handleInjectedAddress as EventListener);
    return () => {
      window.removeEventListener("phone:apply-address", handleInjectedAddress as EventListener);
    };
  }, [handlePostcodeComplete]);

  // 모달 컴포넌트
  const postcodeModal = isPostcodeOpen ? (
    <div className={styles.postcodeModalOverlay} data-testid="postcode-modal">
      <div className={styles.postcodeModalContent}>
        <DaumPostcodeEmbed
          onComplete={handlePostcodeComplete}
          style={{ width: "100%", height: "420px" }}
        />
        <button
          type="button"
          className={styles.postcodeCloseButton}
          data-testid="btn-close-postcode"
          onClick={() => setIsPostcodeOpen(false)}
        >
          닫기
        </button>
      </div>
    </div>
  ) : null;

  return (
    <div className={styles.container} data-testid="phone-new-container">
      {mounted && typeof window !== "undefined" && postcodeModal
        ? createPortal(postcodeModal, document.body)
        : null}

      {/* 로딩 표시 */}
      {isBingingLoading && (
        <div data-testid="loading-indicator" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px',
          fontSize: '16px',
          color: '#666',
        }}>
          불러오는 중...
        </div>
      )}

      {/* 로딩 완료 후 폼 표시 */}
      {!isBingingLoading && (
        <>
          {/* 페이지 제목 */}
          <h1 className={styles.title} data-testid="page-title">
            {isEdit || urlId ? "중고폰 수정하기" : "중고폰 판매하기"}
          </h1>

          {Object.keys(validationErrors).length > 0 && (
            <div className={styles.validationErrors} data-testid="submit-validation-errors">
              {Object.entries(validationErrors).map(([field, message]) => (
                <p key={field}>{message}</p>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit, handleInvalidSubmit)} className={styles.formSection}>
        {/* 기기명 입력 */}
        <div className={styles.inputWrapper} data-testid="phone-name-section">
          <label className={styles.label} htmlFor="phone-name">
            기기명
            <span className={styles.labelRequired}>*</span>
          </label>
          <input
            id="phone-name"
            type="text"
            placeholder="모델명을 입력해 주세요."
            className={`${styles.inputField} ${
              errors.title ? styles.inputError : ""
            }`}
            data-testid="input-phone-name"
            {...register("title")}
          />
          {errors.title && (
            <span className={styles.errorMessage}>{errors.title.message}</span>
          )}
        </div>

        <hr className={styles.divider} />

        {/* 한줄 요약 입력 */}
        <div className={styles.inputWrapper} data-testid="summary-section">
          <label className={styles.label} htmlFor="phone-summary">
            한줄 요약
            <span className={styles.labelRequired}>*</span>
          </label>
          <input
            id="phone-summary"
            type="text"
            placeholder="기기를 한줄로 요약해 주세요."
            className={`${styles.inputField} ${
              errors.summary ? styles.inputError : ""
            }`}
            data-testid="input-phone-summary"
            {...register("summary")}
          />
          {errors.summary && (
            <span className={styles.errorMessage}>
              {errors.summary.message}
            </span>
          )}
        </div>

        <hr className={styles.divider} />

        {/* 상품 설명 */}
        <div className={styles.editorWrapper} data-testid="description-section">
          <label className={styles.label}>
            상품 설명
            <span className={styles.labelRequired}>*</span>
          </label>

          <div
            className={`${styles.editorContainer} ${
              errors.description ? styles.inputError : ""
            }`}
            data-testid="editor-container"
          >
            {/* 에디터 툴바 */}
            <div className={styles.editorToolbar} data-testid="editor-toolbar">
              {/* 텍스트 포매팅 */}
              <div className={styles.editorToolbarGroup}>
                <button
                  className={styles.editorButton}
                  title="Bold"
                  data-testid="btn-bold"
                  type="button"
                >
                  <strong>B</strong>
                </button>
                <button
                  className={styles.editorButton}
                  title="Italic"
                  data-testid="btn-italic"
                  type="button"
                >
                  <em>I</em>
                </button>
                <button
                  className={styles.editorButton}
                  title="Underline"
                  data-testid="btn-underline"
                  type="button"
                >
                  <u>U</u>
                </button>
                <button
                  className={styles.editorButton}
                  title="Strikethrough"
                  data-testid="btn-strikethrough"
                  type="button"
                >
                  <s>S</s>
                </button>
              </div>

              {/* 블록 포매팅 */}
              <div className={styles.editorToolbarGroup}>
                <button
                  className={styles.editorButton}
                  title="Align Left"
                  data-testid="btn-align-left"
                  type="button"
                >
                  ⬅️
                </button>
                <button
                  className={styles.editorButton}
                  title="Align Center"
                  data-testid="btn-align-center"
                  type="button"
                >
                  ⬅️➡️
                </button>
                <button
                  className={styles.editorButton}
                  title="Align Right"
                  data-testid="btn-align-right"
                  type="button"
                >
                  ➡️
                </button>
                <button
                  className={styles.editorButton}
                  title="Justify"
                  data-testid="btn-justify"
                  type="button"
                >
                  ⬅️⬅️
                </button>
              </div>

              {/* 목록 */}
              <div className={styles.editorToolbarGroup}>
                <button
                  className={styles.editorButton}
                  title="Bullet List"
                  data-testid="btn-bullet-list"
                  type="button"
                >
                  •
                </button>
                <button
                  className={styles.editorButton}
                  title="Numbered List"
                  data-testid="btn-numbered-list"
                  type="button"
                >
                  1.
                </button>
              </div>

              {/* 미디어 */}
              <div className={styles.editorToolbarGroup}>
                <button
                  className={styles.editorButton}
                  title="Insert Link"
                  data-testid="btn-link"
                  type="button"
                >
                  🔗
                </button>
                <button
                  className={styles.editorButton}
                  title="Insert Image"
                  data-testid="btn-image"
                  type="button"
                >
                  🖼️
                </button>
                <button
                  className={styles.editorButton}
                  title="Insert Video"
                  data-testid="btn-video"
                  type="button"
                >
                  📹
                </button>
              </div>

              {/* 기타 */}
              <div className={styles.editorToolbarGroup}>
                <button
                  className={`${styles.editorButton} ${styles.disabled}`}
                  title="More Options"
                  data-testid="btn-more"
                  disabled
                  type="button"
                >
                  ⋯
                </button>
              </div>
            </div>

            {/* 에디터 콘텐츠 영역 */}
            <textarea
              className={`${styles.editorContent} ${
                errors.description ? styles.inputError : ""
              }`}
              data-testid="editor-content"
              placeholder="내용을 입력해 주세요."
              {...register("description")}
              style={{
                minHeight: "350px",
                padding: "16px",
                border: "none",
                fontFamily: "inherit",
                fontSize: "16px",
                lineHeight: "24px",
                resize: "vertical",
              }}
            />
          </div>

          {errors.description && (
            <span className={styles.errorMessage}>
              {errors.description.message}
            </span>
          )}
        </div>

        <hr className={styles.divider} />

        {/* 판매 가격 입력 */}
        <div className={styles.inputWrapper} data-testid="price-section">
          <label className={styles.label} htmlFor="phone-price">
            판매 가격
            <span className={styles.labelRequired}>*</span>
          </label>
          <input
            id="phone-price"
            type="number"
            inputMode="numeric"
            placeholder="판매 가격을 입력해 주세요. (원 단위)"
            className={`${styles.inputField} ${
              errors.price ? styles.inputError : ""
            }`}
            data-testid="input-phone-price"
            {...register("price", { valueAsNumber: true })}
          />
          {errors.price && (
            <span className={styles.errorMessage}>{errors.price.message}</span>
          )}
        </div>

        <hr className={styles.divider} />

        {/* 태그 입력 */}
        <div className={styles.inputWrapper} data-testid="tags-section">
          <label className={styles.label} htmlFor="phone-tags">
            태그 입력
          </label>
          <input
            id="phone-tags"
            type="text"
            placeholder="태그를 입력해 주세요."
            className={styles.inputField}
            data-testid="input-phone-tags"
            {...register("tags")}
          />
        </div>

        <hr className={styles.divider} />

        {/* 주소 및 지도 섹션 */}
        <div className={styles.addressMapLayout} data-testid="address-section">
          {/* 좌측: 주소 입력 */}
          <div className={styles.addressColumnLeft}>
            {/* 주소 입력 그룹 */}
            <div className={styles.addressInputGroup} data-testid="address-input-group">
              <label className={styles.label}>
                주소
                <span className={styles.labelRequired}>*</span>
              </label>

              <div className={styles.addressWithButton} data-testid="postcode-input-group">
                <input
                  type="text"
                  placeholder="01234"
                  className={`${styles.addressInput} ${errors.zipcode ? styles.inputError : ""}`}
                  data-testid="input-postcode"
                  readOnly
                  {...register("zipcode")}
                />
                {/* 숨겨진 주소 필드 (바인딩용) */}
                <input type="hidden" data-testid="input-address" {...register("address")} />
                <div
                  className={styles.postcodeButtonWrapper}
                  data-testid="btn-postcode-search"
                  role="button"
                  tabIndex={0}
                  onClick={handlePostcodeSearch}
                  onKeyDown={handlePostcodeSearchKeyDown}
                >
                  <button
                    className={styles.postcodeButton}
                    data-testid="btn-address-search"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handlePostcodeSearch();
                    }}
                  >
                    우편번호 검색
                  </button>
                </div>
              </div>

              <p className={styles.selectedAddress} data-testid="selected-address">
                {currentValues.address ?? ''}
              </p>
              <p style={{ display: 'none' }} data-testid="address-zipcode">
                {currentValues.zipcode ?? ''}
              </p>

              { (manualAddressError ?? addressError) && (
                <span className={styles.errorMessage} data-testid="address-error">
                  {manualAddressError ?? addressError}
                </span>
              )}

              {errors.zipcode && (
                <span className={styles.errorMessage}>{errors.zipcode.message}</span>
              )}
            </div>

            {/* 상세주소 입력 */}
            <div className={styles.inputWrapper} data-testid="detailed-address-input-group">
              <input
                type="text"
                placeholder="상세주소를 입력해 주세요."
                className={`${styles.detailedAddressInput} ${
                  errors.address_detail ? styles.inputError : ""
                }`}
                data-testid="input-detailed-address"
                {...register("address_detail")}
              />
              {errors.address_detail && (
                <span className={styles.errorMessage}>{errors.address_detail.message}</span>
              )}
            </div>

            {/* 좌표 입력 (위도/경도) */}
            <div className={styles.coordinatesGroup} data-testid="coordinates-section">
              <div className={styles.inputWrapper}>
                <label className={styles.label} htmlFor="latitude">
                  위도(LAT)
                </label>
                <input
                  id="latitude"
                  type="text"
                  placeholder="주소를 먼저 입력해 주세요."
                  className={`${styles.coordinateInput} ${
                    errors.latitude ? styles.inputError : ""
                  }`}
                  data-testid="input-latitude"
                  {...register("latitude", { valueAsNumber: true })}
                />
                {currentValues.latitude && (
                  <p style={{ display: 'none' }} data-testid="address-latitude">
                    {currentValues.latitude}
                  </p>
                )}
              </div>

              <div className={styles.inputWrapper}>
                <label className={styles.label} htmlFor="longitude">
                  경도(LNG)
                </label>
                <input
                  id="longitude"
                  type="text"
                  placeholder="주소를 먼저 입력해 주세요."
                  className={`${styles.coordinateInput} ${
                    errors.longitude ? styles.inputError : ""
                  }`}
                  data-testid="input-longitude"
                  {...register("longitude", { valueAsNumber: true })}
                />
                {currentValues.longitude && (
                  <p style={{ display: 'none' }} data-testid="address-longitude">
                    {currentValues.longitude}
                  </p>
                )}
              </div>
            </div>

            {/* 역지오코딩 및 초기화 버튼 */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button
                type="button"
                className={styles.postcodeButton}
                data-testid="btn-reverse-geocode"
                disabled={!canReverseGeocode}
                onClick={() => {
                  if (!canReverseGeocode) return;
                  void updateCoordinates(parsedLatitude, parsedLongitude);
                }}
              >
                좌표로 주소 찾기
              </button>
              <button
                type="button"
                className={styles.postcodeButton}
                data-testid="btn-clear-address"
                onClick={() => {
                  setManualAddressError(null);
                  clearAddressData();
                  setValue("zipcode", "", { shouldDirty: true });
                  setValue("address", "", { shouldDirty: true });
                  setValue("latitude", 0, { shouldDirty: true });
                  setValue("longitude", 0, { shouldDirty: true });
                }}
              >
                주소 초기화
              </button>
            </div>
          </div>

          {/* 우측: 지도 */}
          <div className={styles.mapColumnRight} data-testid="map-section">
            <h3 className={styles.mapSectionTitle} data-testid="map-title">
              거래 위치
            </h3>

            <div className={styles.mapContainer} data-testid="map-container">
              {canReverseGeocode ? (
                <div
                  ref={mapContainerRef}
                  className={styles.mapFrame}
                  data-testid="map-frame"
                  style={{
                    width: "100%",
                    height: "100%",
                    minHeight: "300px",
                  }}
                />
              ) : (
                <span data-testid="map-placeholder-text">주소를 먼저 선택해 주세요.</span>
              )}
            </div>
          </div>
        </div>

        <hr className={styles.divider} />

        {/* 중고폰 이미지 첨부 */}
        <div className={styles.imageSection} data-testid="image-section">
          <label className={styles.imageSectionTitle}>
            사진 첨부
            <span className={styles.labelRequired}>*</span>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className={styles.fileInput}
            data-testid="input-upload-image"
            onChange={handleImageChange}
          />

          {/* 미리보기 */}
          {mediaFiles.length > 0 && (
            <div className={styles.imagePreviewGrid}>
              {mediaFiles.map((file, index) => (
                <div
                  key={file.id}
                  className={styles.imagePreviewItem}
                  data-testid={`image-preview-${index}`}
                >
                  <img
                    src={file.url}
                    alt={file.fileName}
                    className={styles.imagePreview}
                  />
                  <div className={styles.imageMeta}>
                    <span>{file.fileName}</span>
                    {file.isPrimary && (
                      <span className={styles.primaryBadge} data-testid="badge-primary">
                        대표
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className={styles.deleteImageButton}
                    data-testid={`btn-delete-image-${index}`}
                    onClick={() => handleImageDelete(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 업로드 버튼 */}
          {mediaFiles.length < MAX_MEDIA_COUNT && (
            <button
              className={styles.imageUploadBox}
              data-testid="btn-upload-image"
              type="button"
              onClick={handleOpenFileDialog}
            >
              <div className={styles.imageUploadContent}>
                <div className={styles.imageUploadIcon}>+</div>
                <p className={styles.imageUploadText}>클릭해서 사진 업로드</p>
              </div>
            </button>
          )}

          {errors.mediaUrls && (
            <span className={styles.errorMessage}>{errors.mediaUrls.message}</span>
          )}
        </div>

        {/* 버튼 섹션 */}
        <div className={styles.buttonSection} data-testid="button-section">
          <button
            className={styles.cancelButton}
            data-testid="btn-cancel"
            type="button"
            onClick={handleCancel}
          >
            취소
          </button>
          <button
            className={`${styles.submitButton} ${
              isSubmitEnabled ? styles.active : ""
            }`}
            data-testid="btn-submit"
            type="submit"
            disabled={!isSubmitEnabled}
          >
            {isSubmitting
              ? "처리 중..."
              : isEdit || urlId
              ? "수정하기"
              : "등록하기"}
          </button>
        </div>
      </form>
        </>
      )}
    </div>
  );
}
