'use client';

import { useCallback, useState } from 'react';
import { message } from 'antd';
import { validate as uuidValidate } from 'uuid';
import { supabase } from '@/commons/libraries/supabaseClient';

const TABLE_NAME = 'phone_inquiries';
const MAX_CONTENT_LENGTH = 100;

type AuthUser = {
  id: string;
};

const getSupabaseStorageKey = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const projectRef = supabaseUrl?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!projectRef) return null;
  return `sb-${projectRef}-auth-token`;
};

const isValidUuid = (value?: string | null) => {
  if (!value) return false;
  return uuidValidate(value);
};

const getStoredSessionUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  const storageKey = getSupabaseStorageKey();
  if (!storageKey) return null;

  const rawSession =
    window.localStorage.getItem(storageKey) ?? window.sessionStorage?.getItem(storageKey);
  if (!rawSession) return null;

  try {
    const parsed = JSON.parse(rawSession);
    const storedUser = parsed?.currentSession?.user ?? parsed?.user;
    if (storedUser?.id) {
      return { id: storedUser.id };
    }
  } catch (error) {
    console.warn('세션 정보 파싱 실패:', error);
  }

  return null;
};

interface UseInquirySubmitOptions {
  phoneId: string;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export function useInquirySubmit({ phoneId, onSuccess, onError }: UseInquirySubmitOptions) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkAuth = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const sessionUser = session?.user;
      if (isValidUuid(sessionUser?.id)) {
        return { id: sessionUser!.id };
      }
    } catch (error) {
      console.warn('Supabase 세션 조회 실패:', error);
    }

    const stored = getStoredSessionUser();
    console.log('[useInquirySubmit] stored session user', stored);
    if (isValidUuid(stored?.id)) {
      return stored;
    }

    return null;
  }, []);

  const submitInquiry = useCallback(
    async (rawContent: string): Promise<boolean> => {
      console.log('[useInquirySubmit] submit invoked', rawContent);
      if (!phoneId || !isValidUuid(phoneId)) {
        message.error('유효하지 않은 상품입니다.');
        return false;
      }

      if (isSubmitting) {
        return false;
      }

      const content = (rawContent ?? '').trim();

      if (!content) {
        message.error('문의 내용을 입력해주세요.');
        return false;
      }

      if (content.length > MAX_CONTENT_LENGTH) {
        message.error('문의 내용은 100자 이내로 작성해주세요.');
        return false;
      }

      const user = await checkAuth();
      if (!user || !isValidUuid(user.id)) {
        message.warning('로그인이 필요합니다.');
        return false;
      }
      console.log('[useInquirySubmit] validation passed');

      setIsSubmitting(true);

      try {
        const { error } = await supabase.from(TABLE_NAME).insert([
          {
            content,
            phone_id: phoneId,
            author_id: user.id,
            parent_id: null,
            status: 'active',
            is_answer: false,
          },
        ]);

        if (error) {
          throw error;
        }

        console.log('[useInquirySubmit] insert succeeded');
        message.success('문의가 등록되었습니다.');
        onSuccess?.();
        return true;
      } catch (error) {
        console.error('문의 등록 실패:', error);
        message.error('문의 등록에 실패했습니다. 다시 시도해주세요.');
        onError?.(error);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [checkAuth, isSubmitting, onError, onSuccess, phoneId]
  );

  return {
    isSubmitting,
    submitInquiry,
  };
}
