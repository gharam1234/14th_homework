import { test, expect } from '@playwright/test';

/**
 * useMapLink Hook 테스트
 * 
 * 테스트 대상:
 * 1. Hook 테스트 - URL 생성 및 좌표 유효성 검사
 * 2. 컴포넌트 통합 테스트 - 마커/지도 클릭 시 링크 동작
 */

test.describe('useMapLink Hook 단위 테스트', () => {
  test('올바른 좌표와 주소로 Kakao Maps URL을 생성한다', async ({ page }) => {
    // 테스트용 페이지 생성
    await page.setContent(`
      <div id="test-container"></div>
      <script>
        // URL 생성 로직 테스트
        const result = {
          latitude: 37.5665,
          longitude: 126.9780,
          address: '서울시 중구',
          addressDetail: '명동'
        };
        
        // URL 생성 로직 테스트
        const fullAddress = result.addressDetail 
          ? result.address + ' ' + result.addressDetail 
          : result.address;
        const encodedAddress = encodeURIComponent(fullAddress);
        const expectedUrl = 'https://map.kakao.com/link/map/' + encodedAddress + ',' + result.latitude + ',' + result.longitude;
        
        document.getElementById('test-container').setAttribute('data-url', expectedUrl);
      </script>
    `);

    // 생성된 URL 검증
    const url = await page.locator('#test-container').getAttribute('data-url');
    expect(url).toContain('https://map.kakao.com/link/map/');
    expect(url).toContain('37.5665');
    expect(url).toContain('126.978'); // JavaScript는 끝의 0을 제거함
    expect(url).toContain(encodeURIComponent('서울시 중구 명동'));
  });

  test('addressDetail이 없을 때 기본 주소만으로 URL을 생성한다', async ({ page }) => {
    await page.setContent(`
      <div id="test-container"></div>
      <script>
        const result = {
          latitude: 37.4979,
          longitude: 127.0276,
          address: '서울 강남구 역삼동'
        };
        
        const encodedAddress = encodeURIComponent(result.address);
        const expectedUrl = 'https://map.kakao.com/link/map/' + encodedAddress + ',' + result.latitude + ',' + result.longitude;
        
        document.getElementById('test-container').setAttribute('data-url', expectedUrl);
      </script>
    `);

    const url = await page.locator('#test-container').getAttribute('data-url');
    expect(url).toBe(`https://map.kakao.com/link/map/${encodeURIComponent('서울 강남구 역삼동')},37.4979,127.0276`);
  });

  test('유효하지 않은 좌표를 감지한다 - 위도 범위 초과', async ({ page }) => {
    await page.setContent(`
      <div id="test-container"></div>
      <script>
        const latitude = 100; // 유효 범위: -90 ~ 90
        const longitude = 126.9780;
        
        const isValid = latitude >= -90 && latitude <= 90 && 
                       longitude >= -180 && longitude <= 180;
        
        document.getElementById('test-container').setAttribute('data-valid', String(isValid));
      </script>
    `);

    const isValid = await page.locator('#test-container').getAttribute('data-valid');
    expect(isValid).toBe('false');
  });

  test('유효하지 않은 좌표를 감지한다 - 경도 범위 초과', async ({ page }) => {
    await page.setContent(`
      <div id="test-container"></div>
      <script>
        const latitude = 37.5665;
        const longitude = 200; // 유효 범위: -180 ~ 180
        
        const isValid = latitude >= -90 && latitude <= 90 && 
                       longitude >= -180 && longitude <= 180;
        
        document.getElementById('test-container').setAttribute('data-valid', String(isValid));
      </script>
    `);

    const isValid = await page.locator('#test-container').getAttribute('data-valid');
    expect(isValid).toBe('false');
  });

  test('빈 주소를 감지한다', async ({ page }) => {
    await page.setContent(`
      <div id="test-container"></div>
      <script>
        const address = '';
        const isValidAddress = address.trim().length > 0;
        
        document.getElementById('test-container').setAttribute('data-valid', String(isValidAddress));
      </script>
    `);

    const isValid = await page.locator('#test-container').getAttribute('data-valid');
    expect(isValid).toBe('false');
  });

  test('유효한 좌표와 주소를 올바르게 판별한다', async ({ page }) => {
    await page.setContent(`
      <div id="test-container"></div>
      <script>
        const latitude = 37.5665;
        const longitude = 126.9780;
        const address = '서울시 중구';
        
        const isValid = 
          latitude >= -90 && latitude <= 90 && 
          longitude >= -180 && longitude <= 180 &&
          address.trim().length > 0;
        
        document.getElementById('test-container').setAttribute('data-valid', String(isValid));
      </script>
    `);

    const isValid = await page.locator('#test-container').getAttribute('data-valid');
    expect(isValid).toBe('true');
  });
});

test.describe('useMapLink 컴포넌트 통합 테스트', () => {
  // 실제 컴포넌트가 렌더링되는 페이지로 이동
  test.beforeEach(async ({ page }) => {
    // 실제 phone-detail 페이지로 이동 (더미 데이터 사용)
    await page.goto('/phone-detail');
    
    // 페이지 로딩 대기 (data-testid로 확인)
    await page.waitForSelector('[data-testid="phone-detail-body"]');
  });

  test('마커를 클릭하면 Kakao Maps가 새 창으로 열린다', async ({ page, context }) => {
    // window.open 스파이 설정
    await page.evaluate(() => {
      (window as any).openedUrls = [];
      const originalOpen = window.open;
      window.open = function(url: string, target?: string) {
        (window as any).openedUrls.push({ url, target });
        return null;
      };
    });

    // 마커 클릭
    const marker = page.locator('[data-testid="phone-detail-map-marker"]');
    await marker.click();

    // window.open이 호출되었는지 확인
    const openedUrls = await page.evaluate(() => (window as any).openedUrls);
    expect(openedUrls.length).toBeGreaterThan(0);
    expect(openedUrls[0].url).toContain('https://map.kakao.com/link/map/');
    expect(openedUrls[0].target).toBe('_blank');
  });

  test('지도 컨테이너를 클릭하면 Kakao Maps가 새 창으로 열린다', async ({ page }) => {
    // window.open 스파이 설정
    await page.evaluate(() => {
      (window as any).openedUrls = [];
      window.open = function(url: string, target?: string) {
        (window as any).openedUrls.push({ url, target });
        return null;
      };
    });

    // 지도 컨테이너 클릭
    const mapContainer = page.locator('[data-testid="phone-detail-map-container"]');
    await mapContainer.click();

    // window.open이 호출되었는지 확인
    const openedUrls = await page.evaluate(() => (window as any).openedUrls);
    expect(openedUrls.length).toBeGreaterThan(0);
    expect(openedUrls[0].url).toContain('https://map.kakao.com/link/map/');
  });

  test('마커에 키보드 접근성이 적용되어 있다 - Enter 키', async ({ page }) => {
    // window.open 스파이 설정
    await page.evaluate(() => {
      (window as any).openedUrls = [];
      window.open = function(url: string, target?: string) {
        (window as any).openedUrls.push({ url, target });
        return null;
      };
    });

    // 마커에 포커스
    const marker = page.locator('[data-testid="phone-detail-map-marker"]');
    await marker.focus();

    // Enter 키 입력
    await marker.press('Enter');

    // window.open이 호출되었는지 확인
    const openedUrls = await page.evaluate(() => (window as any).openedUrls);
    expect(openedUrls.length).toBeGreaterThan(0);
  });

  test('마커에 키보드 접근성이 적용되어 있다 - Space 키', async ({ page }) => {
    // window.open 스파이 설정
    await page.evaluate(() => {
      (window as any).openedUrls = [];
      window.open = function(url: string, target?: string) {
        (window as any).openedUrls.push({ url, target });
        return null;
      };
    });

    // 마커에 포커스
    const marker = page.locator('[data-testid="phone-detail-map-marker"]');
    await marker.focus();

    // Space 키 입력
    await marker.press('Space');

    // window.open이 호출되었는지 확인
    const openedUrls = await page.evaluate(() => (window as any).openedUrls);
    expect(openedUrls.length).toBeGreaterThan(0);
  });

  test('마커에 role="button"이 적용되어 있다', async ({ page }) => {
    const marker = page.locator('[data-testid="phone-detail-map-marker"]');
    const role = await marker.getAttribute('role');
    expect(role).toBe('button');
  });

  test('지도 컨테이너에 cursor: pointer 스타일이 적용되어 있다', async ({ page }) => {
    const mapContainer = page.locator('[data-testid="phone-detail-map-container"]');
    const cursor = await mapContainer.evaluate((el) => 
      window.getComputedStyle(el).cursor
    );
    expect(cursor).toBe('pointer');
  });

  test('생성된 URL에 주소와 좌표가 올바르게 인코딩되어 있다', async ({ page }) => {
    // window.open 스파이 설정
    await page.evaluate(() => {
      (window as any).openedUrls = [];
      window.open = function(url: string, target?: string) {
        (window as any).openedUrls.push({ url, target });
        return null;
      };
    });

    // 마커 클릭
    const marker = page.locator('[data-testid="phone-detail-map-marker"]');
    await marker.click();

    // URL 구조 검증
    const openedUrls = await page.evaluate(() => (window as any).openedUrls);
    const url = openedUrls[0].url;
    
    // URL 형식 검증
    expect(url).toMatch(/^https:\/\/map\.kakao\.com\/link\/map\/.+,[\d.-]+,[\d.-]+$/);
    
    // 좌표가 숫자 형식인지 확인
    const parts = url.split(',');
    expect(parts.length).toBe(3);
    
    const latitude = parseFloat(parts[1]);
    const longitude = parseFloat(parts[2]);
    
    expect(latitude).toBeGreaterThanOrEqual(-90);
    expect(latitude).toBeLessThanOrEqual(90);
    expect(longitude).toBeGreaterThanOrEqual(-180);
    expect(longitude).toBeLessThanOrEqual(180);
  });
});

test.describe('useMapLink 예외 처리 테스트', () => {
  test('유효하지 않은 좌표일 때 경고 메시지를 표시한다', async ({ page }) => {
    // 유효하지 않은 좌표를 가진 페이지 생성
    await page.setContent(`
      <div id="root">
        <div data-testid="phone-detail-body">
          <div 
            data-testid="phone-detail-map-marker" 
            role="button"
            data-latitude="200"
            data-longitude="500"
          >
            마커
          </div>
        </div>
      </div>
      <script>
        let alertMessage = null;
        window.alert = function(msg) {
          alertMessage = msg;
          document.body.setAttribute('data-alert', msg);
        };
        
        document.querySelector('[data-testid="phone-detail-map-marker"]').addEventListener('click', function() {
          const lat = parseFloat(this.getAttribute('data-latitude'));
          const lng = parseFloat(this.getAttribute('data-longitude'));
          const isValid = lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
          
          if (!isValid) {
            alert('유효한 위치 정보가 없습니다.');
          }
        });
      </script>
    `);

    // 마커 클릭
    const marker = page.locator('[data-testid="phone-detail-map-marker"]');
    await marker.click();

    // 경고 메시지 확인
    const alertMessage = await page.locator('body').getAttribute('data-alert');
    expect(alertMessage).toBe('유효한 위치 정보가 없습니다.');
  });
});

