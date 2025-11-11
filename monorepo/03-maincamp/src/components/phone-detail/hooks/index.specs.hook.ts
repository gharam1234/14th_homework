'use client';

import { useMemo } from 'react';
import { PhoneWithSeller } from '../types';

/**
 * 스펙 행의 메타데이터 타입
 */
export interface SpecRow {
  label: string;
  displayText: string;
  supplementText?: string;
  progress?: {
    percentage: number;
    colorClass: 'green' | 'yellow' | 'red';
  };
}

/**
 * usePhoneSpecs - 폰의 스펙 정보를 구조화된 행 목록으로 반환하는 훅
 * @param phone - PhoneWithSeller 타입의 폰 데이터
 * @returns 스펙 행 목록 (memoized)
 */
export function usePhoneSpecs(phone?: PhoneWithSeller): SpecRow[] {
  return useMemo(() => {
    if (!phone) {
      return [];
    }

    const specs: SpecRow[] = [];

    // 1. 제조사
    specs.push({
      label: '제조사',
      displayText: phone.manufacturer ?? '정보 없음',
    });

    // 2. 모델명
    specs.push({
      label: '모델명',
      displayText: phone.model_name ?? '정보 없음',
    });

    // 3. 출시년도 (현재 연도와의 차이 표시)
    const currentYear = new Date().getFullYear();
    if (phone.release_year && typeof phone.release_year === 'number') {
      const yearDifference = currentYear - phone.release_year;
      const supplementText = yearDifference > 0 ? `(${yearDifference}년 전)` : '';
      specs.push({
        label: '출시년도',
        displayText: `${phone.release_year}`,
        supplementText,
      });
    } else {
      specs.push({
        label: '출시년도',
        displayText: '정보 없음',
      });
    }

    // 4. RAM
    specs.push({
      label: 'RAM',
      displayText: phone.ram ?? '정보 없음',
    });

    // 5. 저장용량
    specs.push({
      label: '저장용량',
      displayText: phone.storage ?? '정보 없음',
    });

    // 6. 배터리 건강도 (progress bar 포함)
    if (phone.battery_health && typeof phone.battery_health === 'number') {
      let colorClass: 'green' | 'yellow' | 'red' = 'red';
      if (phone.battery_health >= 80) {
        colorClass = 'green';
      } else if (phone.battery_health >= 50) {
        colorClass = 'yellow';
      }

      specs.push({
        label: '배터리 건강도',
        displayText: `${phone.battery_health}%`,
        progress: {
          percentage: phone.battery_health,
          colorClass,
        },
      });
    } else {
      specs.push({
        label: '배터리 건강도',
        displayText: '정보 없음',
      });
    }

    // 7. 색상
    specs.push({
      label: '색상',
      displayText: phone.color ?? '정보 없음',
    });

    return specs;
  }, [phone]);
}
