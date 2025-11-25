/**
 * 페이지네이션 테스트를 위한 목데이터 100개 생성 스크립트
 * 
 * 사용법:
 *   npx tsx scripts/generate-test-phones.ts
 * 
 * 또는:
 *   npm run generate:test-phones (package.json에 스크립트 추가 필요)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// .env.local 파일에서 환경 변수 로드
function loadEnvFile() {
  try {
    const envPath = resolve(process.cwd(), '.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        // 따옴표 제거
        const cleanValue = value.replace(/^["']|["']$/g, '');
        process.env[key.trim()] = cleanValue;
      }
    });
  } catch (error) {
    console.warn('⚠️  .env.local 파일을 읽을 수 없습니다. 시스템 환경 변수를 사용합니다.');
  }
}

// 환경 변수 로드
loadEnvFile();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  console.error('NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인해주세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 현재 로그인한 사용자 ID를 가져오거나, 첫 번째 사용자 ID 사용
 */
async function getSellerId(argSellerId?: string | null): Promise<string | null> {
  if (argSellerId) {
    return argSellerId;
  }

  if (process.env.SELLER_ID) {
    return process.env.SELLER_ID;
  }

  // 1. 현재 로그인한 사용자 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.id) {
    return user.id;
  }

  // 2. 로그인하지 않은 경우, auth.users 테이블에서 첫 번째 사용자 가져오기
  // (관리자 권한이 필요할 수 있음)
  console.log('⚠️  로그인된 사용자가 없습니다. 기존 사용자를 찾는 중...');
  
  // Supabase의 auth.users는 직접 조회할 수 없으므로,
  // phones 테이블에서 기존 seller_id를 가져옵니다
  const { data: existingPhones } = await supabase
    .from('phones')
    .select('seller_id')
    .limit(1);

  if (existingPhones && existingPhones.length > 0) {
    const sellerId = existingPhones[0].seller_id;
    console.log(`ℹ️  기존 seller_id를 사용합니다: ${sellerId}`);
    return sellerId;
  }

  return null;
}

// 다양한 모델명 템플릿
const models = [
  { name: 'iPhone', variants: ['14 Pro', '15 Pro', '15 Pro Max', '16', '16 Pro'], brand: 'apple' },
  { name: 'Galaxy', variants: ['S23', 'S23 Ultra', 'S24', 'S24 Ultra', 'Note20'], brand: 'samsung' },
  { name: 'Pixel', variants: ['7', '7 Pro', '8', '8 Pro'], brand: 'google' },
  { name: 'Nothing Phone', variants: ['1', '2'], brand: 'nothing' },
  { name: 'Xperia', variants: ['5', '10', '1'], brand: 'sony' },
];

const storageOptions = ['128GB', '256GB', '512GB', '1TB'];
const conditions = ['S급', 'A급', 'B급', 'C급'];
const saleStates: Array<'available' | 'reserved' | 'sold'> = ['available', 'reserved', 'sold'];
const saleTypes: Array<'instant' | 'reservation'> = ['instant', 'reservation'];
const addresses = [
  '서울시 강남구',
  '서울시 마포구',
  '서울시 서초구',
  '서울시 송파구',
  '서울시 종로구',
  '경기도 성남시',
  '경기도 수원시',
  '인천광역시',
  '부산광역시',
  '대구광역시',
];

const imageUrls = [
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=640&h=480&fit=crop',
  'https://images.unsplash.com/photo-1580898434531-5700dde6756c?w=640&h=480&fit=crop',
  'https://images.unsplash.com/photo-1510557880182-3f8c5fed2fa8?w=640&h=480&fit=crop',
  'https://images.unsplash.com/photo-1451188502541-13943edb6acb?w=640&h=480&fit=crop',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=640&h=480&fit=crop',
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomPrice(): number {
  // 50만원 ~ 200만원 사이 랜덤 가격
  return Math.floor(Math.random() * 1500000) + 500000;
}

function generatePhoneData(index: number, sellerId: string) {
  const model = getRandomElement(models);
  const variant = getRandomElement(model.variants);
  const storage = getRandomElement(storageOptions);
  const condition = getRandomElement(conditions);
  const saleState = getRandomElement(saleStates);
  const saleType = getRandomElement(saleTypes);
  const address = getRandomElement(addresses);
  const price = getRandomPrice();
  
  // created_at을 다르게 설정하여 페이징 테스트에 적합하도록
  // 최신순 정렬을 위해 시간을 역순으로 생성
  const now = new Date();
  const daysAgo = 100 - index; // 100일 전부터 현재까지
  const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

  const modelName = `${model.name} ${variant}`;
  const title = `${modelName} ${storage}`;
  
  return {
    seller_id: sellerId,
    status: 'published' as const,
    sale_state: saleState,
    sale_type: saleType,
    title,
    summary: `${condition} 상태, 생활 스크래치 거의 없음`,
    description: `페이지네이션 테스트용 데이터 #${index + 1}. ${modelName} ${storage} 모델입니다. ${condition} 상태로 판매합니다.`,
    price,
    currency: 'KRW',
    available_from: createdAt.toISOString(),
    available_until: null,
    model_name: modelName,
    storage_capacity: storage,
    device_condition: condition,
    address,
    address_detail: `${Math.floor(Math.random() * 999) + 1}번길 ${Math.floor(Math.random() * 99) + 1}`,
    zipcode: String(Math.floor(Math.random() * 99999)).padStart(5, '0'),
    latitude: 37.5 + Math.random() * 0.1, // 서울 근처 좌표
    longitude: 126.9 + Math.random() * 0.1,
    tags: [model.brand, condition.toLowerCase(), '직거래'],
    categories: [model.brand, 'phone'],
    main_image_url: getRandomElement(imageUrls),
    created_at: createdAt.toISOString(),
  };
}

async function generateTestPhones(count: number = 100, sellerOverride?: string | null) {
  console.log(`🚀 ${count}개의 테스트 데이터 생성 시작...\n`);

  // seller_id 가져오기
  const sellerId = await getSellerId(sellerOverride ?? null);
  
  if (!sellerId) {
    console.error('❌ 사용 가능한 seller_id를 찾을 수 없습니다.');
    console.error('   다음 중 하나를 수행해주세요:');
    console.error('   1. 웹사이트에서 로그인하여 세션을 생성');
    console.error('   2. phones 테이블에 최소 1개 이상의 데이터 존재');
    console.error('   3. 명령줄 인수로 seller_id 전달: npm run generate:test-phones -- [seller-id]');
    process.exit(1);
  }

  console.log(`✓ seller_id 확인: ${sellerId}\n`);

  const phones = Array.from({ length: count }, (_, i) => generatePhoneData(i, sellerId));

  // 배치로 나누어서 insert (Supabase 제한 고려)
  const batchSize = 50;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < phones.length; i += batchSize) {
    const batch = phones.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(phones.length / batchSize);

    console.log(`📦 배치 ${batchNumber}/${totalBatches} 처리 중... (${batch.length}개)`);

    try {
      const { data, error } = await supabase
        .from('phones')
        .insert(batch)
        .select('id');

      if (error) {
        console.error(`❌ 배치 ${batchNumber} 실패:`, error.message);
        errorCount += batch.length;
      } else {
        successCount += data?.length || 0;
        console.log(`✅ 배치 ${batchNumber} 완료: ${data?.length || 0}개 생성됨`);
      }
    } catch (err) {
      console.error(`❌ 배치 ${batchNumber} 예외 발생:`, err);
      errorCount += batch.length;
    }
  }

  console.log('\n📊 생성 결과:');
  console.log(`   ✅ 성공: ${successCount}개`);
  console.log(`   ❌ 실패: ${errorCount}개`);
  console.log(`   📝 총계: ${successCount + errorCount}개\n`);

  if (successCount > 0) {
    console.log('✨ 테스트 데이터 생성 완료!');
    console.log(`   페이지네이션 테스트를 위해 /phones 페이지를 확인해보세요.`);
  }
}

// 스크립트 실행
const rawArg1 = process.argv[2];
const rawArg2 = process.argv[3];

const isNumber = (value?: string) => !!value && /^\d+$/.test(value);

let count = 100;
let sellerIdArg: string | null = null;

if (isNumber(rawArg1)) {
  count = parseInt(rawArg1 as string, 10);
  sellerIdArg = rawArg2 ?? null;
} else {
  sellerIdArg = rawArg1 ?? null;
  if (isNumber(rawArg2)) {
    count = parseInt(rawArg2 as string, 10);
  }
}

if (isNaN(count) || count <= 0) {
  console.error('❌ 잘못된 개수입니다. 숫자를 입력해주세요.');
  process.exit(1);
}

generateTestPhones(count, sellerIdArg)
  .then(() => {
    console.log('\n🎉 스크립트 실행 완료!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 스크립트 실행 중 오류 발생:', error);
    process.exit(1);
  });
