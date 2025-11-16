'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useFilterStore } from '@/stores/filterStore';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseClient = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
const SEARCH_ERROR_MESSAGE = '검색에 실패하였습니다. 다시 시도해주세요.';

export interface IPhoneCard {
  phoneId?: string | number;
  title: string;
  description: string;
  tags: string;
  price: string;
  sellerLabel: string;
  imageUrl?: string | null;
  likeCount: number;
  modelName: string;
}

interface SupabasePhoneRow {
  id: string | number;
  seller_id: string | null;
  title: string | null;
  summary: string | null;
  price: number | string | null;
  tags: string[] | string | null;
  main_image_url: string | null;
  model_name: string | null;
  sale_state: 'available' | 'reserved' | 'sold' | null;
  available_from: string | null;
  available_until: string | null;
  created_at: string;
}

interface FavoriteReactionRow {
  phone_id: string | number;
}

interface UsePhoneSearchReturn {
  searchResults: IPhoneCard[];
  isLoading: boolean;
  error: string | null;
  handleSearch: () => Promise<void>;
  isSearchEnabled: boolean;
}

const sanitizeKeyword = (keyword: string) => keyword.replace(/[%_]/g, (match) => `\\${match}`);

const formatTags = (rawTags: SupabasePhoneRow['tags']): string => {
  if (Array.isArray(rawTags)) {
    const normalized = rawTags
      .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
      .filter(Boolean)
      .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`));
    return normalized.join(' ');
  }

  if (typeof rawTags === 'string') {
    return rawTags;
  }

  return '';
};

const formatPrice = (rawPrice: SupabasePhoneRow['price']): string => {
  const numeric = typeof rawPrice === 'number' ? rawPrice : Number(rawPrice ?? 0);
  if (!Number.isFinite(numeric)) {
    return '0';
  }
  return new Intl.NumberFormat('ko-KR').format(numeric);
};

const formatSellerLabel = (sellerId: SupabasePhoneRow['seller_id']): string => {
  if (!sellerId) {
    return '판매자 정보 없음';
  }

  const trimmed = sellerId.replace(/-/g, '');
  const visible = trimmed.slice(0, 6);
  return `판매자 ${visible}${trimmed.length > 6 ? '...' : ''}`;
};

export const usePhoneSearch = (): UsePhoneSearchReturn => {
  const [searchResults, setSearchResults] = useState<IPhoneCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const keyword = useFilterStore((state) => state.keyword);

  const trimmedKeyword = keyword.trim();
  const hasMinimumKeyword = trimmedKeyword.length >= 2;
  const isSearchEnabled = hasMinimumKeyword && !isLoading;

  const handleSearch = async (): Promise<void> => {
    const {
      keyword: latestKeyword,
      availableNow: latestAvailableNow,
      dateRange: latestDateRange,
    } = useFilterStore.getState();
    const trimmedKeyword = latestKeyword.trim();

    if (trimmedKeyword.length < 2 || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    if (!supabaseClient) {
      setError(SEARCH_ERROR_MESSAGE);
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    try {
      const sanitizedKeyword = sanitizeKeyword(trimmedKeyword);
      let query = supabaseClient
        .from('phones')
        .select(
          'id, seller_id, title, summary, price, tags, main_image_url, model_name, created_at, available_from, available_until, sale_state'
        )
        .order('created_at', { ascending: false })
        .limit(50);

      if (sanitizedKeyword) {
        query = query.or(`model_name.ilike.%${sanitizedKeyword}%,title.ilike.%${sanitizedKeyword}%`);
      }

      query = query.eq('sale_state', latestAvailableNow ? 'available' : 'reserved');

      if (latestDateRange.startDate) {
        query = query.gte('available_from', latestDateRange.startDate);
      }

      if (latestDateRange.endDate) {
        query = query.lte('available_until', latestDateRange.endDate);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) {
        throw supabaseError;
      }

      if (!data || data.length === 0) {
        setSearchResults([]);
        return;
      }

      const phoneIds = data.map((item) => item.id).filter(Boolean) as Array<string | number>;
      let reactionCounts: Record<string, number> = {};

      if (phoneIds.length > 0) {
        const { data: favorites, error: favoritesError } = await supabaseClient
          .from('phone_reactions')
          .select('phone_id')
          .eq('type', 'favorite')
          .in('phone_id', phoneIds);

        if (!favoritesError && favorites) {
          reactionCounts = favorites.reduce<Record<string, number>>((acc, row: FavoriteReactionRow) => {
            const id = String(row.phone_id);
            acc[id] = (acc[id] ?? 0) + 1;
            return acc;
          }, {});
        }
      }

      const formattedResults: IPhoneCard[] = (data as SupabasePhoneRow[]).map((item) => {
        const id = String(item.id);
        return {
          phoneId: id,
          title: item.title ?? item.model_name ?? '미등록 기기',
          description: item.summary ?? '',
          tags: formatTags(item.tags),
          price: formatPrice(item.price),
          sellerLabel: formatSellerLabel(item.seller_id),
          imageUrl: item.main_image_url,
          likeCount: reactionCounts[id] ?? 0,
          modelName: item.model_name ?? '',
        };
      });

      setSearchResults(formattedResults);
    } catch (searchError) {
      console.error('검색 중 오류 발생:', searchError);
      setError(SEARCH_ERROR_MESSAGE);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    searchResults,
    isLoading,
    error,
    handleSearch,
    isSearchEnabled,
  };
};
