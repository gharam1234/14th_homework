/**
 * usePhoneForm 훅
 *
 * 중고폰 폼의 상태 관리 및 검증을 담당하는 커스텀 훅
 * 신규 등록(isEdit=false) 및 수정(isEdit=true) 모드를 지원
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm, UseFormReturn, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IPhoneFormInput, IPhoneMediaMetadata, IPhoneNewProps } from '../types';

const STORAGE_PREFIX = 'phone-';
const MAX_PRICE = 9_999_999_999.99;

const stripStoragePrefix = (value: string) =>
  value.startsWith(STORAGE_PREFIX) ? value.slice(STORAGE_PREFIX.length) : value;

const resolveStorageKey = (value: string) => `${STORAGE_PREFIX}${stripStoragePrefix(value)}`;

const normalizePhoneId = (value?: string | null) => {
  if (!value) return undefined;
  return stripStoragePrefix(String(value));
};

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return 0;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

/** Zod 검증 스키마 */
export const phoneFormSchema = z.object({
  title: z
    .string()
    .min(1, { message: '기기명을 입력해 주세요.' })
    .max(100, { message: '기기명은 최대 100자입니다.' }),
  summary: z
    .string()
    .min(1, { message: '한줄 요약을 입력해 주세요.' })
    .max(255, { message: '한줄 요약은 최대 255자입니다.' }),
  description: z
    .string()
    .min(1, { message: '상품 설명을 입력해 주세요.' })
    .max(5000, { message: '상품 설명은 최대 5000자입니다.' }),
  price: z.preprocess(
    (val) => toNumber(val),
    z
      .number({
        required_error: '판매 가격을 입력해 주세요.',
        invalid_type_error: '판매 가격은 숫자여야 합니다.',
      })
      .min(0, { message: '판매 가격은 0 이상이어야 합니다.' })
      .max(MAX_PRICE, { message: '판매 가격은 100억 미만이어야 합니다.' })
  ),
  tags: z.string().max(255, { message: '태그는 최대 255자입니다.' }).optional().default(''),
  address: z
    .string()
    .min(1, { message: '주소를 입력해 주세요.' })
    .max(255, { message: '주소는 최대 255자입니다.' }),
  zipcode: z
    .string()
    .min(1, { message: '우편번호를 입력해 주세요.' })
    .regex(/^\d{5}$/, { message: '올바른 우편번호를 입력해 주세요.' }),
  address_detail: z
    .string()
    .min(1, { message: '상세주소를 입력해 주세요.' })
    .max(255, { message: '상세주소는 최대 255자입니다.' }),
  latitude: z.preprocess(
    (val) => toNumber(val),
    z.number({ invalid_type_error: '위도를 계산할 수 없습니다.' })
  ),
  longitude: z.preprocess(
    (val) => toNumber(val),
    z.number({ invalid_type_error: '경도를 계산할 수 없습니다.' })
  ),
  mediaUrls: z
    .string()
    .min(1, { message: '사진 URL이 비어 있습니다.' })
    .array()
    .min(1, { message: '최소 1개 이상의 사진을 첨부해 주세요.' })
    .max(2, { message: '최대 2개까지만 첨부할 수 있습니다.' }),
});

export type PhoneFormSchemaType = z.infer<typeof phoneFormSchema>;

/** 기본 폼 값 */
const getDefaultValues = (): IPhoneFormInput => ({
  title: '',
  summary: '',
  description: '',
  price: 0,
  tags: '',
  address: '',
  address_detail: '',
  zipcode: '',
  latitude: 0,
  longitude: 0,
  mediaUrls: [],
});

export interface StoredPhonePayload {
  form: IPhoneFormInput;
  mediaMeta: IPhoneMediaMetadata[];
}

/** 로컬스토리지에서 중고폰 데이터 조회 */
export const getPhoneFromStorage = (phoneId: string): StoredPhonePayload | null => {
  try {
    if (typeof window === 'undefined') return null;
    const storageKey = resolveStorageKey(phoneId);
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;
    const data = JSON.parse(stored);
    const form: IPhoneFormInput = {
      title: data.title || '',
      summary: data.summary || '',
      description: data.description || '',
      price: toNumber(data.price),
      tags: data.tags || '', 
      address: data.address || '',
      address_detail: data.address_detail || data.detailedAddress || '',
      zipcode: data.zipcode || data.postalCode || '',
      latitude: toNumber(data.latitude),
      longitude: toNumber(data.longitude),
      mediaUrls: Array.isArray(data.mediaUrls)
        ? data.mediaUrls
        : Array.isArray(data.images)
        ? data.images
        : [],
    };

    const mediaMeta: IPhoneMediaMetadata[] = Array.isArray(data.mediaMeta)
      ? data.mediaMeta
      : form.mediaUrls.map((url, index) => ({
          id: `${phoneId}-${index}`,
          url,
          fileName: data.mediaMeta?.[index]?.fileName || `image-${index + 1}`,
          isPrimary: index === 0,
        }));

    return { form, mediaMeta };
  } catch {
    return null;
  }
};

/** usePhoneForm 훅 */
export function usePhoneForm(props: IPhoneNewProps = {}): UseFormReturn<IPhoneFormInput> {
  const { isEdit = false, phoneId } = props;
  const [isInitialized, setIsInitialized] = useState(false);
  const initialValues = useMemo(() => getDefaultValues(), []);

  // 폼 기본값 결정
  const getInitialValues = (): IPhoneFormInput => {
    if (isEdit && phoneId) {
      const storedData = getPhoneFromStorage(phoneId);
      if (storedData) return storedData.form;
    }
    return initialValues;
  };

  const form = useForm<IPhoneFormInput>({
    resolver: zodResolver(phoneFormSchema),
    defaultValues: getInitialValues(),
    mode: 'onChange',
  });

  // 수정 모드에서 로컬스토리지 데이터로 폼 초기화
  useEffect(() => {
    if (isEdit && phoneId && !isInitialized) {
      const storedData = getPhoneFromStorage(phoneId);
      if (storedData) {
        form.reset(storedData.form);
      }
      setIsInitialized(true);
    } else if (!isEdit && !isInitialized) {
      form.reset(initialValues);
      setIsInitialized(true);
    }
  }, [isEdit, phoneId, isInitialized, form, initialValues]);

  return form;
}

/** 폼 제출 핸들러 생성 함수 */
export function createSubmitHandler(
  isEdit: boolean,
  phoneId?: string,
  mediaMeta: IPhoneMediaMetadata[] = []
): SubmitHandler<IPhoneFormInput> {
  return (data: IPhoneFormInput) => {
    try {
      const normalizedPhoneId = isEdit && phoneId ? normalizePhoneId(phoneId) : undefined;
      const phoneKey = normalizedPhoneId ?? String(Date.now());
      const storageKey = resolveStorageKey(phoneKey);
      const storageValue = {
        phoneId: phoneKey,
        ...data,
        mediaMeta,
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(storageKey, JSON.stringify(storageValue));
      return { success: true, phoneId: storageValue.phoneId };
    } catch (error) {
      console.error('폼 제출 실패:', error);
      return { success: false, error };
    }
  };
}

/** 로컬스토리지 저장 함수 */
export function savePhoneToStorage(
  isEdit: boolean,
  phoneId: string | undefined,
  data: IPhoneFormInput,
  mediaMeta: IPhoneMediaMetadata[] = []
): string {
  try {
    const normalizedPhoneId = isEdit && phoneId ? normalizePhoneId(phoneId) : undefined;
    const phoneKey = normalizedPhoneId ?? String(Date.now());
    const storageKey = resolveStorageKey(phoneKey);
    const storageValue = {
      phoneId: phoneKey,
      ...data,
      mediaMeta,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(storageKey, JSON.stringify(storageValue));
    return storageValue.phoneId;
  } catch (error) {
    console.error('로컬스토리지 저장 실패:', error);
    throw error;
  }
}
