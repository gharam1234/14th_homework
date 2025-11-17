import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_KEY ?? "";

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    '[supabaseClient] Supabase 환경 변수가 설정되지 않았습니다. URL/KEY 값을 확인해 주세요.',
    { hasUrl: Boolean(supabaseUrl), hasKey: Boolean(supabaseKey) }
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    headers: {
      apikey: supabaseKey,
    },
  },
});
