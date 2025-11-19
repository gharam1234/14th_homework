import type { SupabasePhoneRecord } from '@/tests/fixtures/supabase';
import type { AddressData, Coordinates } from '@/components/phone-new/types/address.types';

declare global {
  interface Window {
    __TEST_BYPASS__?: boolean;
    __TEST_DELETE_CONFIG__?: {
      result?: 'success' | 'error';
      delayMs?: number;
      errorMessage?: string;
      redirectPath?: string;
    };
    __TEST_LOCATION_SUPPRESS_OPEN__?: boolean;
    __TEST_LOCATION_LAST_URL__?: string;
    __TEST_PHONE_DETAIL_USE_SUPABASE__?: boolean;
    __TEST_PHONE_DETAIL_OVERRIDES__?: Record<string, SupabasePhoneRecord>;
    __TEST_BINDING_FORCE_ERROR__?: boolean;
    __TEST_PHONE_SUBMIT_USER_ID__?: string | null;
    __TEST_PHONE_SUBMIT__?: {
      result?: 'success' | 'error';
      createdPhoneId?: string;
      errorMessage?: string;
      delayMs?: number;
    };
    __TEST_PHONE_SUBMIT_LAST_PAYLOAD__?: unknown;
    __TEST_ADDRESS_OVERRIDES__?: {
      geocode?: Record<string, Coordinates>;
      reverse?: Record<string, AddressData>;
      geocodeError?: string;
      reverseError?: string;
    };
    __TEST_SUPABASE_USER__?: { id: string };
  }
}

export {};
