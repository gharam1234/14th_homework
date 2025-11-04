/**
 * useTokenForm 훅
 *
 * 토큰 폼의 상태 관리 및 검증을 담당하는 커스텀 훅
 * 신규 등록(isEdit=false) 및 수정(isEdit=true) 모드를 지원
 */

import { useEffect, useState } from 'react';
import { useForm, UseFormReturn, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ITokenFormInput, ITokenNewProps } from '../types';

/** Zod 검증 스키마 */
export const tokenFormSchema = z.object({
  title: z
    .string()
    .min(1, { message: '토큰명을 입력해 주세요.' })
    .max(100, { message: '토큰명은 최대 100자입니다.' }),
  summary: z
    .string()
    .min(1, { message: '한줄 요약을 입력해 주세요.' })
    .max(255, { message: '한줄 요약은 최대 255자입니다.' }),
  description: z
    .string()
    .min(1, { message: '상품 설명을 입력해 주세요.' })
    .max(5000, { message: '상품 설명은 최대 5000자입니다.' }),
  price: z
    .string()
    .refine(
      (val) => {
        if (val === '') return false;
        const num = Number(val);
        return !isNaN(num) && num >= 0;
      },
      { message: '판매 가격은 숫자이고, 0 이상이어야 합니다.' }
    ),
  tags: z.string().max(255, { message: '태그는 최대 255자입니다.' }).optional().default(''),
  address: z
    .string()
    .min(1, { message: '주소를 입력해 주세요.' })
    .max(255, { message: '주소는 최대 255자입니다.' }),
  postalCode: z
    .string()
    .min(1, { message: '우편번호를 입력해 주세요.' })
    .regex(/^\d{5}$/, { message: '올바른 우편번호를 입력해 주세요.' }),
  detailedAddress: z
    .string()
    .min(1, { message: '상세주소를 입력해 주세요.' })
    .max(255, { message: '상세주소는 최대 255자입니다.' }),
  latitude: z.string(),
  longitude: z.string(),
  images: z
    .string()
    .array()
    .min(1, { message: '최소 1개 이상의 사진을 첨부해 주세요.' })
    .max(2, { message: '최대 2개까지만 첨부할 수 있습니다.' }),
});

export type TokenFormSchemaType = z.infer<typeof tokenFormSchema>;

/** 기본 폼 값 */
const getDefaultValues = (): ITokenFormInput => ({
  title: '',
  summary: '',
  description: '',
  price: '',
  tags: '',
  address: '',
  postalCode: '',
  detailedAddress: '',
  latitude: '',
  longitude: '',
  images: [],
});

/** 로컬스토리지에서 토큰 데이터 조회 */
const loadTokenFromStorage = (tokenId: string): ITokenFormInput | null => {
  try {
    const key = `token-${tokenId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    const data = JSON.parse(stored);
    return {
      title: data.title || '',
      summary: data.summary || '',
      description: data.description || '',
      price: String(data.price || ''),
      tags: data.tags || '',
      address: data.address || '',
      postalCode: data.postalCode || '',
      detailedAddress: data.detailedAddress || '',
      latitude: String(data.latitude || ''),
      longitude: String(data.longitude || ''),
      images: data.images || [],
    };
  } catch {
    return null;
  }
};

/** useTokenForm 훅 */
export function useTokenForm(props: ITokenNewProps = {}): UseFormReturn<ITokenFormInput> {
  const { isEdit = false, tokenId } = props;
  const [isInitialized, setIsInitialized] = useState(false);

  // 폼 기본값 결정
  const getInitialValues = (): ITokenFormInput => {
    if (isEdit && tokenId) {
      const storedData = loadTokenFromStorage(tokenId);
      if (storedData) return storedData;
    }
    return getDefaultValues();
  };

  const form = useForm<ITokenFormInput>({
    resolver: zodResolver(tokenFormSchema),
    defaultValues: getInitialValues(),
    mode: 'onChange',
  });

  // 수정 모드에서 로컬스토리지 데이터로 폼 초기화
  useEffect(() => {
    if (isEdit && tokenId && !isInitialized) {
      const storedData = loadTokenFromStorage(tokenId);
      if (storedData) {
        form.reset(storedData);
      }
      setIsInitialized(true);
    } else if (!isEdit && !isInitialized) {
      form.reset(getDefaultValues());
      setIsInitialized(true);
    }
  }, [isEdit, tokenId, isInitialized, form]);

  return form;
}

/** 폼 제출 핸들러 생성 함수 */
export function createSubmitHandler(
  isEdit: boolean,
  tokenId?: string
): SubmitHandler<ITokenFormInput> {
  return (data: ITokenFormInput) => {
    try {
      const storageKey = isEdit && tokenId ? `token-${tokenId}` : `token-${Date.now()}`;
      const storageValue = {
        tokenId: isEdit && tokenId ? tokenId : String(Date.now()),
        ...data,
      };

      localStorage.setItem(storageKey, JSON.stringify(storageValue));
      return { success: true, tokenId: storageValue.tokenId };
    } catch (error) {
      console.error('폼 제출 실패:', error);
      return { success: false, error };
    }
  };
}

/** 로컬스토리지 저장 함수 */
export function saveTokenToStorage(
  isEdit: boolean,
  tokenId: string | undefined,
  data: ITokenFormInput
): string {
  try {
    const storageKey = isEdit && tokenId ? `token-${tokenId}` : `token-${Date.now()}`;
    const storageValue = {
      tokenId: isEdit && tokenId ? tokenId : String(Date.now()),
      ...data,
    };

    localStorage.setItem(storageKey, JSON.stringify(storageValue));
    return storageValue.tokenId;
  } catch (error) {
    console.error('로컬스토리지 저장 실패:', error);
    throw error;
  }
}
