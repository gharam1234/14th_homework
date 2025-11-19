/**
 * 페이지네이션 테스트용 목데이터 삭제 스크립트
 * 
 * 사용법:
 *   npx tsx scripts/cleanup-test-phones.ts
 * 
 * 또는:
 *   npm run cleanup:test-phones (package.json에 스크립트 추가 필요)
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
 * 테스트 데이터 삭제 함수
 * @param sellerId 삭제할 판매자 ID (기본값: 테스트용 UUID)
 */
async function cleanupTestPhones(sellerId: string = '00000000-0000-0000-0000-000000000000') {
  console.log(`🧹 테스트 데이터 삭제 시작...\n`);
  console.log(`   대상 seller_id: ${sellerId}\n`);

  try {
    // 1. 삭제 대상 개수 확인
    const { count: beforeCount, error: countError } = await supabase
      .from('phones')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', sellerId);

    if (countError) {
      throw countError;
    }

    if (!beforeCount || beforeCount === 0) {
      console.log('ℹ️  삭제할 테스트 데이터가 없습니다.');
      return;
    }

    console.log(`📊 발견된 테스트 데이터: ${beforeCount}개\n`);

    // 2. 삭제 실행
    const { error: deleteError } = await supabase
      .from('phones')
      .delete()
      .eq('seller_id', sellerId);

    if (deleteError) {
      throw deleteError;
    }

    // 3. 삭제 후 개수 확인
    const { count: afterCount } = await supabase
      .from('phones')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', sellerId);

    console.log(`✅ 삭제 완료: ${beforeCount}개 제거됨`);
    console.log(`   남은 테스트 데이터: ${afterCount || 0}개\n`);

    if (afterCount === 0) {
      console.log('✨ 모든 테스트 데이터가 삭제되었습니다!');
    } else {
      console.warn('⚠️  일부 데이터가 남아있습니다. 다시 실행해보세요.');
    }
  } catch (err) {
    console.error('\n❌ 삭제 중 오류 발생:', err);
    process.exit(1);
  }
}

// 스크립트 실행
const sellerId = process.argv[2] || '00000000-0000-0000-0000-000000000000';

cleanupTestPhones(sellerId)
  .then(() => {
    console.log('\n🎉 스크립트 실행 완료!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 스크립트 실행 중 오류 발생:', error);
    process.exit(1);
  });

