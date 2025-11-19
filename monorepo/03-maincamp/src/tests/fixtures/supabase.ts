export interface SupabasePhoneRecord {
  id: string;
  seller_id: string;
  status: 'draft' | 'published';
  sale_state: 'available' | 'reserved' | 'sold';
  sale_type: 'immediate' | 'scheduled';
  title: string;
  summary: string;
  description: string;
  price: number;
  currency: string;
  available_from: string;
  available_until: string | null;
  model_name: string;
  storage_capacity: string;
  device_condition: string;
  address: string;
  address_detail: string;
  zipcode: string;
  latitude: number;
  longitude: number;
  tags: string[];
  categories: string[];
  main_image_url: string | null;
  created_at: string;
}

export interface SupabasePhoneMediaRecord {
  phone_id: string;
  url: string;
  file_name: string;
  is_primary: boolean;
  display_order: number;
}

const buildPhone = (overrides: Partial<SupabasePhoneRecord>): SupabasePhoneRecord => ({
  id: 'listing-001',
  seller_id: 'seller-001',
  status: 'published',
  sale_state: 'available',
  sale_type: 'immediate',
  title: '아이폰 14 Pro 256GB',
  summary: 'A급 상태, 생활 스크래치 거의 없음',
  description: '테스트용 중고폰 데이터입니다. Playwright 전용 더미 설명입니다.',
  price: 1180000,
  currency: 'KRW',
  available_from: '2025-01-01T00:00:00Z',
  available_until: null,
  model_name: 'iPhone 14 Pro',
  storage_capacity: '256GB',
  device_condition: 'A급',
  address: '서울시 마포구 합정동',
  address_detail: '123번길 45',
  zipcode: '04001',
  latitude: 37.5495,
  longitude: 126.9144,
  tags: ['apple', 'a급', '직거래'],
  categories: ['apple', 'phone'],
  main_image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=640&h=480&fit=crop',
  created_at: '2025-01-02T12:00:00Z',
  ...overrides,
});

export const PHONE_RECORDS: SupabasePhoneRecord[] = [
  buildPhone({ id: 'listing-001' }),
  buildPhone({
    id: 'listing-002',
    address: null,
    address_detail: null,
    zipcode: null,
  }),
  buildPhone({
    id: 'listing-003',
    address: '',
    address_detail: '',
    zipcode: '',
  }),
  buildPhone({
    id: 'listing-004',
    address: '서울시 강남구',
    address_detail: null,
    zipcode: null,
  }),
  buildPhone({
    id: 'test-phone-001',
    title: '갤럭시 S24 Ultra 512GB',
    summary: '보호필름 부착, 박스 풀구성',
    model_name: 'Galaxy S24 Ultra',
    storage_capacity: '512GB',
    device_condition: 'S급',
    price: 1390000,
    tags: ['samsung', '삼성', '자급제'],
    categories: ['samsung', 'phone'],
    latitude: 37.4979,
    longitude: 127.0276,
    address: '서울특별시 강남구 테헤란로 123',
    address_detail: '역삼빌딩 10층',
    zipcode: '06236',
    created_at: '2025-01-05T09:00:00Z',
  }),
  buildPhone({
    id: 'test-phone-no-images',
    title: '픽셀 8 Pro 128GB',
    summary: '테스트용 데이터 (이미지 없음)',
    model_name: 'Pixel 8 Pro',
    storage_capacity: '128GB',
    device_condition: 'B급',
    price: 820000,
    tags: ['google', 'pixel'],
    categories: ['google', 'phone'],
    main_image_url: null,
    created_at: '2025-01-06T08:30:00Z',
  }),
  buildPhone({
    id: 'phone-004',
    title: '아이패드 프로 11',
    summary: '태블릿도 거래 가능',
    categories: ['apple', 'tablet'],
    tags: ['tablet'],
    price: 950000,
    created_at: '2025-01-07T11:00:00Z',
  }),
  buildPhone({
    id: 'phone-005',
    title: '맥북 에어 M3',
    summary: '랩탑 카테고리',
    categories: ['apple', 'laptop'],
    tags: ['laptop'],
    price: 1650000,
    created_at: '2025-01-08T10:00:00Z',
  }),
  buildPhone({
    id: 'phone-006',
    title: '갤럭시 워치 7',
    summary: '워치 카테고리',
    categories: ['samsung', 'watch'],
    tags: ['watch'],
    price: 320000,
    created_at: '2025-01-09T10:00:00Z',
  }),
  buildPhone({
    id: 'phone-007',
    title: 'Nothing Phone 2',
    summary: '선정적인 LED 디자인',
    categories: ['nothing', 'phone'],
    tags: ['nothing'],
    price: 680000,
    created_at: '2025-01-10T10:00:00Z',
  }),
  buildPhone({
    id: 'phone-008',
    title: 'Sony Xperia 5',
    summary: '소니 스마트폰',
    categories: ['sony', 'phone'],
    tags: ['sony'],
    price: 590000,
    created_at: '2025-01-11T10:00:00Z',
  }),
];

export const PHONE_MEDIA_RECORDS: SupabasePhoneMediaRecord[] = [
  {
    phone_id: 'listing-001',
    url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=640&h=480&fit=crop',
    file_name: 'listing-001-main.jpg',
    is_primary: true,
    display_order: 1,
  },
  {
    phone_id: 'test-phone-001',
    url: 'https://images.unsplash.com/photo-1580910051074-7b6544d1cd5b?w=640&h=480&fit=crop',
    file_name: 'galaxy-main.jpg',
    is_primary: true,
    display_order: 1,
  },
  {
    phone_id: 'test-phone-001',
    url: 'https://images.unsplash.com/photo-1510557880182-3f8c5fed2fa8?w=640&h=480&fit=crop',
    file_name: 'galaxy-sub.jpg',
    is_primary: false,
    display_order: 2,
  },
  {
    phone_id: 'phone-004',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=640&h=480&fit=crop',
    file_name: 'tablet.jpg',
    is_primary: true,
    display_order: 1,
  },
];

export const decodeSupabaseFilterValue = (raw?: string | null) => {
  if (!raw) return null;
  const trimmed = raw.trim();
  return decodeURIComponent(trimmed);
};

export const matchEqFilter = (raw?: string | null) => {
  if (!raw) return null;
  const decoded = decodeSupabaseFilterValue(raw);
  if (!decoded) return null;
  if (!decoded.startsWith('eq.')) return null;
  return decoded.slice(3);
};

export const matchCsFilter = (raw?: string | null): string[] | null => {
  if (!raw) return null;
  const decoded = decodeSupabaseFilterValue(raw);
  if (!decoded.startsWith('cs.')) return null;
  const json = decoded.slice(3);
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};
