# Phone Detail 테스트 실행 방법

플레이라이트 테스트는 실제 Supabase `phones` 테이블에 존재하는 UUID를 사용해야 합니다. 다음 절차로 `VALID_PHONE_ID`를 설정하세요.

1. Supabase 대시보드에서 `phones` 테이블을 열고 테스트에 사용할 중고폰 레코드의 `id`(UUID)를 복사합니다.
2. 아래 세 파일에 선언된 `VALID_PHONE_ID` 상수를 모두 동일한 UUID로 교체합니다.
   - `src/components/phone-detail/tests/page.test.ts`
   - `src/components/phone-detail/tests/image-gallery.spec.ts`
   - `src/components/phone-detail/tests/basic-info.spec.ts`
3. `pnpm playwright test` 등 프로젝트에 정의된 테스트 스크립트를 실행하면 환경 변수 없이 동일한 UUID로 실데이터 검증이 이뤄집니다.
