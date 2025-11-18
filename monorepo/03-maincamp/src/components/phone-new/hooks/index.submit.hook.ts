'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { message } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { supabase } from '@/commons/libraries/supabaseClient';
import { getPath } from '@/commons/constants/url';

const DRAFT_KEY = 'phone';
const MAX_MEDIA_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_PRICE = 9_999_999_999.99;

export interface SubmitMediaFile {
  url: string;
  isPrimary: boolean;
  fileName?: string;
}

export interface SubmitProductState {
  title: string;
  summary: string;
  description: string;
  price: number;
  tags: string[];
  address: string;
  address_detail: string;
  zipcode: string;
  latitude: number;
  longitude: number;
  categories: string[];
  sale_state: 'available' | 'reserved' | 'sold';
  sale_type: 'instant' | 'reservation';
  currency: string;
  available_from: string;
  available_until: string | null;
  model_name: string;
  storage_capacity: string;
  device_condition: string;
  main_image_url: string | null;
  mediaFiles: SubmitMediaFile[];
}

interface DraftPayload extends SubmitProductState {
  updatedAt: string;
}

type ValidationErrors = Record<string, string>;

const phoneSubmitSchema = z.object({
  title: z
    .string()
    .min(1, { message: '기기명을 입력해 주세요.' })
    .max(100, { message: '기기명은 최대 100자입니다.' }),
  summary: z
    .string()
    .min(1, { message: '한줄 요약을 입력해 주세요.' })
    .max(200, { message: '한줄 요약은 최대 200자입니다.' }),
  description: z
    .string()
    .min(10, { message: '상품 설명은 최소 10자 이상이어야 합니다.' }),
  price: z
    .number({ required_error: '판매 가격을 입력해 주세요.' })
    .gt(0, { message: '판매 가격은 0보다 커야 합니다.' })
    .lte(MAX_PRICE, { message: '판매 가격은 100억 미만이어야 합니다.' }),
  tags: z
    .array(z.string().min(1))
    .max(10, { message: '태그는 최대 10개까지 등록할 수 있습니다.' }),
  address: z.string().min(1, { message: '주소를 입력해 주세요.' }),
  address_detail: z.string().optional(),
  zipcode: z
    .string()
    .min(5, { message: '우편번호는 5자리 이상이어야 합니다.' })
    .regex(/^\d+$/, { message: '우편번호는 숫자만 입력해 주세요.' }),
  latitude: z
    .number({ required_error: '위도를 입력해 주세요.' })
    .gte(-90, { message: '위도는 -90에서 90 사이여야 합니다.' })
    .lte(90, { message: '위도는 -90에서 90 사이여야 합니다.' }),
  longitude: z
    .number({ required_error: '경도를 입력해 주세요.' })
    .gte(-180, { message: '경도는 -180에서 180 사이여야 합니다.' })
    .lte(180, { message: '경도는 -180에서 180 사이여야 합니다.' }),
  categories: z.array(z.string()).optional(),
  sale_state: z.enum(['available', 'reserved', 'sold']),
  sale_type: z.enum(['instant', 'reservation'], {
    errorMap: (_issue, _ctx) => ({ message: '판매 유형을 선택해 주세요.' }),
  }),
  currency: z.string().min(1, { message: '통화 코드를 입력해 주세요.' }),
  available_from: z
    .string()
    .refine((value) => Boolean(Date.parse(value)), {
      message: '거래 시작일이 유효하지 않습니다.',
    }),
  available_until: z.string().nullable().or(z.literal(null)),
  model_name: z.string().optional(),
  storage_capacity: z.string().optional(),
  device_condition: z.string().optional(),
  main_image_url: z.string().nullable(),
  mediaFiles: z
    .array(
      z.object({
        url: z.string().min(1),
        isPrimary: z.boolean(),
        fileName: z.string().optional(),
      })
    )
    .min(1, { message: '사진을 최소 1장 이상 업로드해 주세요.' }),
});

const getSupabaseStorageKey = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const projectRef = supabaseUrl?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!projectRef) return null;
  return `sb-${projectRef}-auth-token`;
};

const getStoredSupabaseUser = () => {
  if (typeof window === 'undefined') return null;
  const storageKey = getSupabaseStorageKey();
  if (!storageKey) return null;

  const rawSession = window.localStorage.getItem(storageKey);
  if (!rawSession) return null;

  try {
    const parsed = JSON.parse(rawSession);
    if (parsed?.currentSession?.user) return parsed.currentSession.user;
    if (parsed?.user) return parsed.user;
  } catch (error) {
    console.warn('Supabase 세션 파싱 실패:', error);
  }
  return null;
};

const resolveSupabaseUserId = async (): Promise<string | null> => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user?.id) {
      return session.user.id;
    }
  } catch (error) {
    console.warn('Supabase 세션 조회 실패:', error);
  }

  const stored = getStoredSupabaseUser();
  return stored?.id ?? null;
};

const parseDataUrl = (dataUrl: string) => {
  const [metadata, encoded] = dataUrl.split(',');
  if (!metadata || !encoded) {
    throw new Error('유효하지 않은 이미지 포맷입니다.');
  }

  const mimeMatch = metadata.match(/data:([^;]+);base64/);
  const mimeType = mimeMatch?.[1] ?? 'application/octet-stream';
  const binary = atob(encoded);
  const length = binary.length;
  const buffer = new Uint8Array(length);

  for (let i = 0; i < length; i += 1) {
    buffer[i] = binary.charCodeAt(i);
  }

  const blob = new Blob([buffer], { type: mimeType });
  return { blob, mimeType };
};

const focusFirstValidationField = (errors: ValidationErrors) => {
  const firstField = Object.keys(errors)[0];
  if (!firstField || typeof document === 'undefined') return;
  const target = document.querySelector<HTMLElement>(`[name="${firstField}"]`);
  target?.focus();
};

const normalizeTags = (values?: string[]) => {
  if (!values) return [];
  return values
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));
};

export function usePhoneSubmit() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const loadDraft = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const stored = window.localStorage.getItem(DRAFT_KEY);
    if (!stored) return null;

    try {
      const parsed: DraftPayload = JSON.parse(stored);
      return {
        title: parsed.title ?? '',
        summary: parsed.summary ?? '',
        description: parsed.description ?? '',
        price: Number(parsed.price ?? 0),
        tags: normalizeTags(parsed.tags),
        address: parsed.address ?? '',
        address_detail: parsed.address_detail ?? '',
        zipcode: parsed.zipcode ?? '',
        latitude: Number(parsed.latitude ?? 0),
        longitude: Number(parsed.longitude ?? 0),
        categories: normalizeTags(parsed.categories),
        sale_state: parsed.sale_state ?? 'available',
        sale_type: parsed.sale_type ?? 'instant',
        currency: parsed.currency ?? 'KRW',
        available_from: parsed.available_from ?? new Date().toISOString(),
        available_until: parsed.available_until ?? null,
        model_name: parsed.model_name ?? '',
        storage_capacity: parsed.storage_capacity ?? '',
        device_condition: parsed.device_condition ?? '',
        main_image_url: parsed.main_image_url ?? null,
        mediaFiles: Array.isArray(parsed.mediaFiles) ? parsed.mediaFiles : [],
      };
    } catch (error) {
      console.warn('임시 저장 파싱 실패:', error);
      return null;
    }
  }, []);

  const saveDraft = useCallback((data: SubmitProductState) => {
    if (typeof window === 'undefined') return;
    try {
      const payload: DraftPayload = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
    } catch (error) {
      console.error('임시 저장 실패:', error);
    }
  }, []);

  const clearDraft = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(DRAFT_KEY);
  }, []);

  const ensureSupabaseUser = useCallback(async (): Promise<string | null> => {
    const userId = await resolveSupabaseUserId();
    if (!userId) {
      message.warning('로그인이 필요합니다.');
      return null;
    }
    return userId;
  }, []);

  const submitData = useCallback(
    async (data: SubmitProductState) => {
      setValidationErrors({});
      const result = phoneSubmitSchema.safeParse({
        ...data,
        categories: data.categories ?? [],
      });

      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        const errors: ValidationErrors = {};

        Object.entries(fieldErrors).forEach(([field, messages]) => {
          if (messages?.length) {
            errors[field] = messages[0];
          }
        });

        setValidationErrors(errors);
        focusFirstValidationField(errors);
        return;
      }

      if (data.mediaFiles.length === 0) {
        const mediaError = { mediaFiles: '사진을 선택해 주세요.' };
        setValidationErrors(mediaError);
        focusFirstValidationField(mediaError);
        return;
      }

      setIsSubmitting(true);

      try {
        const sellerId = await ensureSupabaseUser();
        if (!sellerId) {
          setIsSubmitting(false);
          return;
        }
        const { data: phone, error: phoneError } = await supabase
          .from('phones')
          .insert([
            {
              seller_id: sellerId,
              status: 'draft',
              sale_state: data.sale_state,
              sale_type: data.sale_type,
              title: data.title,
              summary: data.summary,
              description: data.description,
              price: data.price,
              currency: data.currency,
              available_from: data.available_from,
              available_until: data.available_until,
              model_name: data.model_name,
              storage_capacity: data.storage_capacity,
              device_condition: data.device_condition,
              tags: data.tags.length ? data.tags : [],
              categories: data.categories.length ? data.categories : [],
              address: data.address,
              address_detail: data.address_detail,
              zipcode: data.zipcode,
              latitude: data.latitude,
              longitude: data.longitude,
              main_image_url: data.main_image_url,
            },
          ])
          .select('id')
          .single();

        if (phoneError || !phone) {
          throw phoneError ?? new Error('상품 정보 등록에 실패했습니다.');
        }

        const phoneId = phone.id;

        const uploadedUrls: { url: string; isPrimary: boolean }[] = [];

        for (let index = 0; index < data.mediaFiles.length; index += 1) {
          const file = data.mediaFiles[index];
          const { blob, mimeType } = parseDataUrl(file.url);

          if (!ALLOWED_IMAGE_MIME.includes(mimeType)) {
            throw new Error('허용되지 않는 이미지 형식입니다.');
          }

          if (blob.size > MAX_MEDIA_SIZE) {
            throw new Error('이미지 파일은 10MB 이하이어야 합니다.');
          }

          const now = new Date();
          const year = now.getUTCFullYear();
          const month = String(now.getUTCMonth() + 1).padStart(2, '0');
          const day = String(now.getUTCDate()).padStart(2, '0');
          const extension = mimeType.split('/')[1] === 'jpeg' ? 'jpg' : mimeType.split('/')[1];
          const storagePath = `${year}/${month}/${day}/${uuidv4()}.${extension}`;

          const { error: uploadError } = await supabase.storage
            .from('phones-images')
            .upload(storagePath, blob, { cacheControl: '3600', upsert: false });

          if (uploadError) {
            throw uploadError;
          }

          const { data: publicUrlData } = supabase.storage
            .from('phones-images')
            .getPublicUrl(storagePath);

          const publicUrl = publicUrlData.publicUrl;

          await supabase.from('phone_media').insert({
            phone_id: phoneId,
            storage_path: storagePath,
            url: publicUrl,
            file_name: file.fileName ?? storagePath.split('/').pop(),
            file_size: blob.size,
            mime_type: mimeType,
            display_order: index,
            is_primary: Boolean(file.isPrimary),
            status: 'success',
            progress: 100,
          });

          uploadedUrls.push({ url: publicUrl, isPrimary: file.isPrimary });
        }

        if (uploadedUrls.length) {
          const mainImage = uploadedUrls.find((item) => item.isPrimary) ?? uploadedUrls[0];
          if (mainImage?.url) {
            await supabase
              .from('phones')
              .update({ main_image_url: mainImage.url })
              .eq('id', phoneId);
          }
        }

        clearDraft();
        message.success('상품 등록에 성공하였습니다.');
        router.push(getPath('PHONE_DETAIL', { id: phoneId }));
      } catch (error) {
        console.error('상품 등록 실패:', error);
        message.error('상품 등록에 실패하였습니다. 다시 시도해주세요.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [clearDraft, ensureSupabaseUser, router]
  );

  return {
    isSubmitting,
    submitData,
    saveDraft,
    loadDraft,
    clearDraft,
    validationErrors,
  };
}
