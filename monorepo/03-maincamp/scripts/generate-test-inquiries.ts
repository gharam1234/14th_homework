/**
 * 특정 phone_id에 대한 문의/답변 목데이터 생성 스크립트
 *
 * 사용법:
 *   npm run generate:test-inquiries -- <phone-id> [seller-id]
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const DEFAULT_PHONE_ID = 'e3f0b3a3-7c2e-4d67-9fd9-bc10d74f6b14';
const DEFAULT_SELLER_ID = '85f42831-5761-4cc9-8186-987653ef915c';

const BUYER_IDS = [
  {
    id: '06c76104-92e6-4c19-a251-7a86452a7400',
    name: '사용자1',
  },
  {
    id: '8a6d41a0-9c04-43a5-b153-f143861e24c3',
    name: '사용자2',
  },
];

/**
 * .env.local 로드
 */
function loadEnvFile() {
  try {
    const envPath = resolve(process.cwd(), '.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const [key, ...valueParts] = trimmed.split('=');
      if (!key || valueParts.length === 0) return;
      const value = valueParts.join('=').trim();
      const cleanValue = value.replace(/^["']|["']$/g, '');
      process.env[key.trim()] = cleanValue;
    });
  } catch (error) {
    console.warn('⚠️  .env.local 파일을 읽을 수 없습니다. 시스템 환경 변수를 사용합니다.');
  }
}

loadEnvFile();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  console.error('NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인해주세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * UUID 도우미
 */
/**
 * phone 레코드 보정
 */
async function ensurePhoneRecord(phoneId: string, sellerId: string) {
  const { data, error } = await supabase
    .from('phones')
    .select('id')
    .eq('id', phoneId)
    .maybeSingle();

  if (error) {
    console.error('❌ phones 조회 실패:', error.message);
    process.exit(1);
  }

  if (data) {
    console.log('✓ 기존 phone 레코드가 존재합니다.');
    return;
  }

  console.log('ℹ️  phone 레코드가 없어 새로 생성합니다.');
  const now = new Date().toISOString();
  const insertPayload = {
    id: phoneId,
    seller_id: sellerId,
    status: 'published',
    sale_state: 'available',
    sale_type: 'instant',
    title: 'Playwright 테스트용 중고폰',
    summary: '테스트 전용 요약',
    description: '테스트 전용 상세 설명입니다.',
    price: 1290000,
    currency: 'KRW',
    available_from: now,
    available_until: null,
    model_name: 'Playwright Phone',
    storage_capacity: '256GB',
    device_condition: 'S급',
    address: '서울특별시 강남구',
    address_detail: '테스트로 12길 34',
    zipcode: '06000',
    latitude: 37.4979,
    longitude: 127.0276,
    tags: ['playwright', 'test'],
    categories: ['phone', 'test'],
    main_image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=640&h=480&fit=crop',
    created_at: now,
    updated_at: now,
  };

  const insertResult = await supabase.from('phones').insert([insertPayload]);
  if (insertResult.error) {
    console.error('❌ phone 레코드 생성 실패:', insertResult.error.message);
    process.exit(1);
  }
  console.log('✓ phone 레코드가 생성되었습니다.');
}

/**
 * phone_inquiries 데이터 생성
 */
function buildInquiryDataset(phoneId: string, sellerId: string) {
  const now = new Date();

  const parent1Id = '11111111-1111-4000-8000-000000000001';
  const parent2Id = '22222222-2222-4000-8000-000000000002';
  const parentSlug1 = 'inquiry-001';
  const parentSlug2 = 'inquiry-002';

  const reply1Id = 'aaaaaaaa-aaaa-4000-8000-000000000001';
  const reply2Id = 'bbbbbbbb-bbbb-4000-8000-000000000002';
  const replySlug1 = 'reply-001';
  const replySlug2 = 'reply-002';

  const parents = [
    {
      id: parent1Id,
      phone_id: phoneId,
      parent_id: null,
      thread_path: parent1Id,
      author_id: BUYER_IDS[0].id,
      link_title: BUYER_IDS[0].name,
      link_url: parentSlug1,
      content: '첫 번째 문의 내용입니다.',
      status: 'active',
      is_answer: false,
      created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      updated_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
    {
      id: parent2Id,
      phone_id: phoneId,
      parent_id: null,
      thread_path: parent2Id,
      author_id: BUYER_IDS[1].id,
      link_title: BUYER_IDS[1].name,
      link_url: parentSlug2,
      content: '두 번째 문의 내용입니다.',
      status: 'active',
      is_answer: false,
      created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
      updated_at: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ];

  const replies = [
    {
      id: reply1Id,
      phone_id: phoneId,
      parent_id: parent1Id,
      thread_path: `${parent1Id}/${reply1Id}`,
      author_id: sellerId,
      link_title: '판매자',
      link_url: replySlug1,
      content: '기존 답변 내용입니다.',
      status: 'active',
      is_answer: true,
      created_at: new Date(now.getTime() - 1000 * 60 * 60 * 12).toISOString(),
      updated_at: new Date(now.getTime() - 1000 * 60 * 60 * 12).toISOString(),
    },
    {
      id: reply2Id,
      phone_id: phoneId,
      parent_id: parent2Id,
      thread_path: `${parent2Id}/${reply2Id}`,
      author_id: sellerId,
      link_title: '판매자',
      link_url: replySlug2,
      content: '두 번째 문의에 대한 판매자 답변입니다.',
      status: 'active',
      is_answer: true,
      created_at: new Date(now.getTime() - 1000 * 60 * 60 * 10).toISOString(),
      updated_at: new Date(now.getTime() - 1000 * 60 * 60 * 10).toISOString(),
    },
  ];

  return [...parents, ...replies];
}

async function generateTestInquiries(phoneId: string, sellerId: string) {
  console.log('🚀 문의/답변 목데이터 생성을 시작합니다.');
  await ensurePhoneRecord(phoneId, sellerId);

  console.log('🧹 기존 문의 데이터를 정리합니다.');
  const deleteResult = await supabase.from('phone_inquiries').delete().eq('phone_id', phoneId);
  if (deleteResult.error) {
    console.error('❌ 기존 데이터 삭제 실패:', deleteResult.error.message);
    process.exit(1);
  }

  const dataset = buildInquiryDataset(phoneId, sellerId);
  console.log(`📦 ${dataset.length}개의 레코드를 생성합니다.`);

  const insertResult = await supabase.from('phone_inquiries').insert(dataset).select('id');
  if (insertResult.error) {
    console.error('❌ 데이터 생성 실패:', insertResult.error.message);
    process.exit(1);
  }

  console.log('✅ 생성 완료:');
  insertResult.data?.forEach((row) => console.log(`   - ${row.id}`));
}

const phoneIdArg = process.argv[2] ?? DEFAULT_PHONE_ID;
const sellerIdArg = process.argv[3] ?? DEFAULT_SELLER_ID;

(async () => {
  await generateTestInquiries(phoneIdArg, sellerIdArg);
  console.log('\n🎉 문의/답변 데이터 생성이 완료되었습니다.');
})();
