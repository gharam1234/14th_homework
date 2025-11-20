import { randomUUID } from 'crypto';
import type { BrowserContext, Route } from '@playwright/test';
import type { SupabasePhoneRecord } from '@/tests/fixtures/supabase';
import {
  decodeSupabaseFilterValue,
  matchCsFilter,
  matchEqFilter,
  matchIlikeFilter,
  matchIsFilter,
} from '@/tests/fixtures/supabase';

const SUPPORTED_TABLES = ['phones', 'phone_inquiries', 'phone_reactions'] as const;
type SupabaseMockTable = typeof SUPPORTED_TABLES[number];

export interface SupabasePhoneReactionRecord {
  id: string;
  phone_id: string;
  user_id: string;
  type: string;
  deleted_at: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface SupabasePhoneInquiryRecord {
  id: string;
  phone_id: string;
  author_id: string;
  content: string;
  status: string;
  parent_id: string | null;
  thread_path: string | null;
  is_answer: boolean;
  seller_id: string | null;
  buyer_id: string | null;
  seller_reply: string | null;
  link_url: string | null;
  link_title: string | null;
  link_description: string | null;
  link_image: string | null;
  created_at: string;
  updated_at: string;
}

type SupabaseMockStore = {
  phones: Map<string, SupabasePhoneRecord>;
  phone_inquiries: Map<string, SupabasePhoneInquiryRecord>;
  phone_reactions: Map<string, SupabasePhoneReactionRecord>;
};

const supabaseMockStore: SupabaseMockStore = {
  phones: new Map(),
  phone_inquiries: new Map(),
  phone_reactions: new Map(),
};

const RESERVED_QUERY_KEYS = new Set([
  'select',
  'order',
  'limit',
  'offset',
  'range',
  'rangeMin',
  'rangeMax',
]);

const SUPABASE_ROUTE_FLAG = Symbol('supabase.mock.route');

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
};

const SINGLE_OBJECT_ACCEPT = 'application/vnd.pgrst.object+json';

interface RequestFormat {
  wantsSingleObject: boolean;
  isMaybeSingle: boolean;
  returnMinimal: boolean;
  preferRepresentation: boolean;
}

const buildRequestFormat = (route: Route): RequestFormat => {
  const headers = route.request().headers();
  const accept = headers?.accept ?? '';
  const prefer = headers?.prefer?.toLowerCase?.() ?? '';

  return {
    wantsSingleObject: accept.includes(SINGLE_OBJECT_ACCEPT),
    isMaybeSingle: prefer.includes('plurality=singular'),
    returnMinimal: prefer.includes('return=minimal'),
    preferRepresentation: prefer.includes('return=representation'),
  };
};

const shouldReturnRepresentation = (format: RequestFormat, url: URL) => {
  if (format.preferRepresentation || format.wantsSingleObject) {
    return true;
  }

  return Boolean(url.searchParams.get('select'));
};

const parseJsonBody = (route: Route) => {
  const raw = route.request().postData();
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const cloneRecord = <T>(record: T): T => JSON.parse(JSON.stringify(record));

export const getSupabaseMockStore = () => supabaseMockStore;

export const resetSupabaseMockStore = () => {
  supabaseMockStore.phones.clear();
  supabaseMockStore.phone_inquiries.clear();
  supabaseMockStore.phone_reactions.clear();
};

export interface CreateMockPhoneOptions extends Partial<SupabasePhoneRecord> {}

export function createMockPhoneRecord(overrides: CreateMockPhoneOptions = {}): SupabasePhoneRecord {
  const now = new Date().toISOString();

  const record: SupabasePhoneRecord = {
    id: overrides.id ?? randomUUID(),
    seller_id: overrides.seller_id ?? 'test-seller-id',
    status: overrides.status ?? 'published',
    sale_state: overrides.sale_state ?? 'available',
    sale_type: overrides.sale_type ?? 'immediate',
    bookmark_count: overrides.bookmark_count ?? 0,
    title: overrides.title ?? 'Test Phone Title',
    summary: overrides.summary ?? 'Test summary',
    description: overrides.description ?? 'Test description for Supabase mock data.',
    price: overrides.price ?? 500000,
    currency: overrides.currency ?? 'KRW',
    available_from: overrides.available_from ?? now,
    available_until: overrides.available_until ?? null,
    model_name: overrides.model_name ?? 'Test Model',
    storage_capacity: overrides.storage_capacity ?? '128GB',
    device_condition: overrides.device_condition ?? 'excellent',
    address: overrides.address ?? 'Test City',
    address_detail: overrides.address_detail ?? '123 Test Street',
    zipcode: overrides.zipcode ?? '12345',
    latitude: overrides.latitude ?? 37.5665,
    longitude: overrides.longitude ?? 126.978,
    tags: Array.isArray(overrides.tags) ? overrides.tags : ['test', 'phone'],
    categories: Array.isArray(overrides.categories) ? overrides.categories : ['smartphone'],
    main_image_url:
      overrides.main_image_url ??
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=640&h=480&fit=crop',
    created_at: overrides.created_at ?? now,
  };

  supabaseMockStore.phones.set(record.id, record);
  return record;
}

export function deleteMockPhoneRecord(id: string) {
  supabaseMockStore.phones.delete(id);
}

export interface CreateMockPhoneInquiryOptions extends Partial<SupabasePhoneInquiryRecord> {}

export function createMockPhoneInquiryRecord(
  overrides: CreateMockPhoneInquiryOptions = {},
): SupabasePhoneInquiryRecord {
  const now = new Date().toISOString();

  const record: SupabasePhoneInquiryRecord = {
    id: overrides.id ?? randomUUID(),
    phone_id: overrides.phone_id ?? 'test-phone-id',
    author_id: overrides.author_id ?? 'test-author-id',
    content: overrides.content ?? '테스트 문의 내용',
    status: overrides.status ?? 'active',
    parent_id:
      overrides.parent_id === undefined
        ? null
        : overrides.parent_id,
    thread_path:
      overrides.thread_path !== undefined
        ? overrides.thread_path
        : overrides.parent_id ?? null,
    is_answer: overrides.is_answer ?? false,
    seller_id: overrides.seller_id ?? null,
    buyer_id: overrides.buyer_id ?? null,
    seller_reply: overrides.seller_reply ?? null,
    link_url: overrides.link_url ?? null,
    link_title: overrides.link_title ?? null,
    link_description: overrides.link_description ?? null,
    link_image: overrides.link_image ?? null,
    created_at: overrides.created_at ?? now,
    updated_at: overrides.updated_at ?? now,
  };

  supabaseMockStore.phone_inquiries.set(record.id, record);
  return record;
}

export function deleteMockPhoneInquiryRecord(id: string) {
  supabaseMockStore.phone_inquiries.delete(id);
}

export interface CreateMockPhoneReactionOptions extends Partial<SupabasePhoneReactionRecord> {}

export function createMockPhoneReactionRecord(
  overrides: CreateMockPhoneReactionOptions = {},
): SupabasePhoneReactionRecord {
  const now = new Date().toISOString();

  const record: SupabasePhoneReactionRecord = {
    id: overrides.id ?? randomUUID(),
    phone_id: overrides.phone_id ?? 'test-phone-id',
    user_id: overrides.user_id ?? 'test-user-id',
    type: overrides.type ?? 'favorite',
    deleted_at:
      overrides.deleted_at === undefined
        ? null
        : overrides.deleted_at,
    metadata:
      overrides.metadata === undefined
        ? null
        : overrides.metadata,
    created_at: overrides.created_at ?? now,
    updated_at: overrides.updated_at ?? now,
  };

  supabaseMockStore.phone_reactions.set(record.id, record);
  return record;
}

export function deleteMockPhoneReactionRecord(id: string) {
  supabaseMockStore.phone_reactions.delete(id);
}

const toNullableString = (value: unknown, fallback: string | null) => {
  if (typeof value === 'string') {
    return value;
  }

  if (value === null) {
    return null;
  }

  return fallback;
};

const normalizePhoneRecord = (
  payload: Partial<SupabasePhoneRecord>,
  existing?: SupabasePhoneRecord,
): SupabasePhoneRecord => {
  const now = new Date().toISOString();
  const createdAt = payload.created_at ?? existing?.created_at ?? now;

  return {
    id: payload.id ?? existing?.id ?? randomUUID(),
    seller_id: payload.seller_id ?? existing?.seller_id ?? 'test-seller-id',
    status: payload.status ?? existing?.status ?? 'published',
    sale_state: payload.sale_state ?? existing?.sale_state ?? 'available',
    sale_type: payload.sale_type ?? existing?.sale_type ?? 'immediate',
    bookmark_count:
      typeof payload.bookmark_count === 'number'
        ? payload.bookmark_count
        : existing?.bookmark_count ?? 0,
    title: payload.title ?? existing?.title ?? 'Test Phone Title',
    summary: payload.summary ?? existing?.summary ?? '',
    description: payload.description ?? existing?.description ?? '',
    price:
      typeof payload.price === 'number'
        ? payload.price
        : existing?.price ?? 0,
    currency: payload.currency ?? existing?.currency ?? 'KRW',
    available_from: payload.available_from ?? existing?.available_from ?? createdAt,
    available_until:
      typeof payload.available_until === 'string' || payload.available_until === null
        ? payload.available_until
        : existing?.available_until ?? null,
    model_name: payload.model_name ?? existing?.model_name ?? '',
    storage_capacity: payload.storage_capacity ?? existing?.storage_capacity ?? '',
    device_condition: payload.device_condition ?? existing?.device_condition ?? '',
    address: payload.address ?? existing?.address ?? '',
    address_detail: payload.address_detail ?? existing?.address_detail ?? '',
    zipcode: payload.zipcode ?? existing?.zipcode ?? '',
    latitude:
      typeof payload.latitude === 'number'
        ? payload.latitude
        : existing?.latitude ?? 0,
    longitude:
      typeof payload.longitude === 'number'
        ? payload.longitude
        : existing?.longitude ?? 0,
    tags: Array.isArray(payload.tags) ? payload.tags : existing?.tags ?? [],
    categories: Array.isArray(payload.categories)
      ? payload.categories
      : existing?.categories ?? [],
    main_image_url: payload.main_image_url ?? existing?.main_image_url ?? '',
    created_at: createdAt,
  };
};

const normalizePhoneInquiryRecord = (
  payload: Partial<SupabasePhoneInquiryRecord>,
  existing?: SupabasePhoneInquiryRecord,
): SupabasePhoneInquiryRecord => {
  const now = new Date().toISOString();
  const createdAt = payload.created_at ?? existing?.created_at ?? now;

  return {
    id: payload.id ?? existing?.id ?? randomUUID(),
    phone_id: payload.phone_id ?? existing?.phone_id ?? 'phone-id',
    author_id: payload.author_id ?? existing?.author_id ?? 'author-id',
    content: payload.content ?? existing?.content ?? '',
    status: payload.status ?? existing?.status ?? 'active',
    parent_id: toNullableString(payload.parent_id, existing?.parent_id ?? null),
    seller_id: toNullableString(payload.seller_id, existing?.seller_id ?? null),
    buyer_id: toNullableString(payload.buyer_id, existing?.buyer_id ?? null),
    seller_reply: toNullableString(payload.seller_reply, existing?.seller_reply ?? null),
    thread_path: toNullableString(payload.thread_path, existing?.thread_path ?? null),
    is_answer:
      typeof payload.is_answer === 'boolean'
        ? payload.is_answer
        : existing?.is_answer ?? false,
    link_url: toNullableString(payload.link_url, existing?.link_url ?? null),
    link_title: toNullableString(payload.link_title, existing?.link_title ?? null),
    link_description: toNullableString(
      payload.link_description,
      existing?.link_description ?? null,
    ),
    link_image: toNullableString(payload.link_image, existing?.link_image ?? null),
    created_at: createdAt,
    updated_at: payload.updated_at ?? now,
  };
};

const normalizePhoneReactionRecord = (
  payload: Partial<SupabasePhoneReactionRecord>,
  existing?: SupabasePhoneReactionRecord,
): SupabasePhoneReactionRecord => {
  const now = new Date().toISOString();

  return {
    id: payload.id ?? existing?.id ?? randomUUID(),
    phone_id: payload.phone_id ?? existing?.phone_id ?? '',
    user_id: payload.user_id ?? existing?.user_id ?? '',
    type: payload.type ?? existing?.type ?? 'favorite',
    deleted_at:
      typeof payload.deleted_at === 'string'
        ? payload.deleted_at
        : payload.deleted_at === null
          ? null
          : existing?.deleted_at ?? null,
    metadata:
      payload.metadata === undefined
        ? existing?.metadata ?? null
        : (payload.metadata as Record<string, unknown> | null),
    created_at: payload.created_at ?? existing?.created_at ?? now,
    updated_at: payload.updated_at ?? now,
  };
};

const normalizeRecord = (
  table: SupabaseMockTable,
  payload: Record<string, unknown>,
  existing?: SupabasePhoneRecord | SupabasePhoneInquiryRecord | SupabasePhoneReactionRecord,
) => {
  switch (table) {
    case 'phones':
      return normalizePhoneRecord(payload as Partial<SupabasePhoneRecord>, existing as SupabasePhoneRecord | undefined);
    case 'phone_inquiries':
      return normalizePhoneInquiryRecord(
        payload as Partial<SupabasePhoneInquiryRecord>,
        existing as SupabasePhoneInquiryRecord | undefined,
      );
    case 'phone_reactions':
      return normalizePhoneReactionRecord(
        payload as Partial<SupabasePhoneReactionRecord>,
        existing as SupabasePhoneReactionRecord | undefined,
      );
    default:
      return payload;
  }
};

const insertRecords = (
  table: SupabaseMockTable,
  rows: Record<string, unknown>[],
) => {
  return rows.map((row) => {
    const normalized = normalizeRecord(table, row);
    const targetStore = supabaseMockStore[table] as Map<string, any>;
    targetStore.set((normalized as { id: string }).id, normalized);
    return cloneRecord(normalized);
  });
};

const updateRecords = (
  table: SupabaseMockTable,
  targetRows: { id: string }[],
  changes: Record<string, unknown>,
) => {
  if (!targetRows.length) {
    return [];
  }

  const targetStore = supabaseMockStore[table] as Map<string, any>;
  return targetRows
    .map((row) => {
      const stored = targetStore.get(row.id);
      if (!stored) {
        return null;
      }

      const normalized = normalizeRecord(table, changes, stored);
      targetStore.set((normalized as { id: string }).id, normalized);
      return cloneRecord(normalized);
    })
    .filter((record): record is Record<string, unknown> => Boolean(record));
};

export async function setupSupabaseRestMock(context: BrowserContext) {
  const contextWithFlag = context as BrowserContext & {
    [SUPABASE_ROUTE_FLAG]?: boolean;
  };

  if (contextWithFlag[SUPABASE_ROUTE_FLAG]) {
    return;
  }

  await context.route('**/rest/v1/*', async (route) => {
    const handled = await handleSupabaseRoute(route);
    if (!handled) {
      await route.fallback();
    }
  });

  contextWithFlag[SUPABASE_ROUTE_FLAG] = true;
}

async function handleSupabaseRoute(route: Route): Promise<boolean> {
  const url = new URL(route.request().url());
  const table = resolveTable(url.pathname);
  if (!table) {
    return false;
  }

  const method = route.request().method().toUpperCase();

  switch (method) {
    case 'GET':
      await handleSelect(route, table, url);
      return true;
    case 'POST':
      await handleInsert(route, table, url);
      return true;
    case 'PATCH':
      await handleUpdate(route, table, url);
      return true;
    case 'DELETE':
      await handleDelete(route, table, url);
      return true;
    default:
      return false;
  }
}

function resolveTable(pathname: string): SupabaseMockTable | null {
  const match = pathname.match(/\/rest\/v1\/([^/?]+)/);
  if (!match) {
    return null;
  }

  const candidate = decodeURIComponent(match[1]) as SupabaseMockTable;
  return SUPPORTED_TABLES.includes(candidate) ? candidate : null;
}

async function handleSelect(route: Route, table: SupabaseMockTable, url: URL) {
  const requestHeaders = route.request().headers();
  const format = buildRequestFormat(route);
  const rangeHeader = requestHeaders?.range ?? null;

  const matchedRecords = filterRecords(table, url.searchParams);
  const sortedRecords = applyOrdering(matchedRecords, url.searchParams.getAll('order'));
  const rangedRecords = applyRange(sortedRecords, url.searchParams, rangeHeader);

  if (format.wantsSingleObject) {
    if (rangedRecords.length === 0) {
      if (format.isMaybeSingle) {
        await route.fulfill({
          status: 200,
          headers: JSON_HEADERS,
          body: 'null',
        });
        return;
      }

      await route.fulfill({
        status: 406,
        headers: JSON_HEADERS,
        body: JSON.stringify(createPostgrestError('PGRST116', 'Results contain 0 rows')),
      });
      return;
    }

    if (rangedRecords.length > 1) {
      await route.fulfill({
        status: 406,
        headers: JSON_HEADERS,
        body: JSON.stringify(createPostgrestError('PGRST117', 'Results contain more than one row')),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify(rangedRecords[0]),
    });
    return;
  }

  const contentRange = buildContentRangeHeader(rangedRecords.length);

  await route.fulfill({
    status: 200,
    headers: {
      ...JSON_HEADERS,
      'content-range': contentRange,
    },
    body: JSON.stringify(rangedRecords),
  });
}

async function handleInsert(route: Route, table: SupabaseMockTable, url: URL) {
  const payload = parseJsonBody(route);
  const rows = payload == null ? [] : (Array.isArray(payload) ? payload : [payload]);
  const format = buildRequestFormat(route);
  const shouldReturn = shouldReturnRepresentation(format, url);

  if (!rows.length) {
    await route.fulfill({ status: 400, headers: JSON_HEADERS, body: JSON.stringify(createPostgrestError('PGRST301', 'Request body must be a json object or array of objects.')) });
    return;
  }

  const insertedRecords = insertRecords(table, rows as Record<string, unknown>[]);

  if (!shouldReturn) {
    await route.fulfill({ status: 201, headers: JSON_HEADERS, body: '' });
    return;
  }

  if (format.wantsSingleObject) {
    if (insertedRecords.length === 0) {
      await route.fulfill({ status: 200, headers: JSON_HEADERS, body: 'null' });
      return;
    }

    if (insertedRecords.length > 1) {
      await route.fulfill({
        status: 406,
        headers: JSON_HEADERS,
        body: JSON.stringify(createPostgrestError('PGRST117', 'Results contain more than one row')),
      });
      return;
    }

    await route.fulfill({ status: 201, headers: JSON_HEADERS, body: JSON.stringify(insertedRecords[0]) });
    return;
  }

  await route.fulfill({ status: 201, headers: JSON_HEADERS, body: JSON.stringify(insertedRecords) });
}

async function handleUpdate(route: Route, table: SupabaseMockTable, url: URL) {
  const payload = parseJsonBody(route);
  const changes = payload == null ? {} : Array.isArray(payload) ? payload[0] ?? {} : payload;
  const format = buildRequestFormat(route);
  const shouldReturn = shouldReturnRepresentation(format, url);

  const matchedRecords = filterRecords(table, url.searchParams);
  const updatedRecords = updateRecords(table, matchedRecords, changes as Record<string, unknown>);

  if (!shouldReturn) {
    await route.fulfill({ status: 204, headers: JSON_HEADERS, body: '' });
    return;
  }

  if (format.wantsSingleObject) {
    if (updatedRecords.length === 0) {
      if (format.isMaybeSingle) {
        await route.fulfill({ status: 200, headers: JSON_HEADERS, body: 'null' });
      } else {
        await route.fulfill({
          status: 406,
          headers: JSON_HEADERS,
          body: JSON.stringify(createPostgrestError('PGRST116', 'Results contain 0 rows')),
        });
      }
      return;
    }

    await route.fulfill({ status: 200, headers: JSON_HEADERS, body: JSON.stringify(updatedRecords[0]) });
    return;
  }

  await route.fulfill({ status: 200, headers: JSON_HEADERS, body: JSON.stringify(updatedRecords) });
}

async function handleDelete(route: Route, table: SupabaseMockTable, url: URL) {
  const format = buildRequestFormat(route);
  const shouldReturn = shouldReturnRepresentation(format, url);

  const matchedRecords = filterRecords(table, url.searchParams);
  const targetStore = supabaseMockStore[table] as Map<string, any>;
  matchedRecords.forEach((record) => {
    targetStore.delete(record.id);
  });

  if (!shouldReturn) {
    await route.fulfill({ status: 204, headers: JSON_HEADERS, body: '' });
    return;
  }

  await route.fulfill({ status: 200, headers: JSON_HEADERS, body: JSON.stringify(matchedRecords.map((record) => cloneRecord(record))) });
}

function filterRecords(table: SupabaseMockTable, params: URLSearchParams) {
  const records = Array.from(supabaseMockStore[table].values()).map((record) => cloneRecord(record));
  return records.filter((record) => matchesRecordFilters(record, params));
}

function matchesRecordFilters(record: Record<string, unknown>, params: URLSearchParams) {
  for (const [key, rawValue] of params.entries()) {
    if (RESERVED_QUERY_KEYS.has(key) || key === 'or') {
      continue;
    }

    if (!applyFilter(record, key, rawValue)) {
      return false;
    }
  }

  const orFilters = params.getAll('or');
  return orFilters.every((rawValue) => matchesOrFilter(record, rawValue));
}

function applyFilter(record: Record<string, unknown>, key: string, rawValue: string) {
  const eqValue = matchEqFilter(rawValue);
  if (eqValue !== null) {
    const columnValue = record[key];
    return compareEq(columnValue, eqValue);
  }

  const csValues = matchCsFilter(rawValue);
  if (csValues) {
    const columnValue = record[key];
    if (!Array.isArray(columnValue)) {
      return false;
    }

    return csValues.every((value) => columnValue.includes(value));
  }

  const isValue = matchIsFilter(rawValue);
  if (isValue !== null) {
    return compareIs(record[key], isValue);
  }

  const ilikeValue = matchIlikeFilter(rawValue);
  if (ilikeValue !== null) {
    return matchesLike(record[key], ilikeValue, true);
  }

  return true;
}

function compareEq(value: unknown, target: string) {
  if (value === null || typeof value === 'undefined') {
    return target === 'null';
  }

  if (typeof value === 'string') {
    return value === target;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value) === target;
  }

  return false;
}

function applyOrdering(records: Record<string, unknown>[], orderParams: string[]) {
  if (!orderParams.length) {
    return records;
  }

  return [...records].sort((a, b) => {
    for (const orderParam of orderParams) {
      const [column, directionToken, nullsToken] = orderParam.split('.');
      if (!column) continue;

      const direction = directionToken === 'desc' ? -1 : 1;
      const nullsLast = nullsToken === 'nullslast';

      const aValue = (a as Record<string, unknown>)[column];
      const bValue = (b as Record<string, unknown>)[column];

      if (aValue == null && bValue == null) {
        continue;
      }

      if (aValue == null) {
        return nullsLast ? 1 : -1;
      }

      if (bValue == null) {
        return nullsLast ? -1 : 1;
      }

      if (aValue === bValue) {
        continue;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return aValue > bValue ? direction : -direction;
      }

      const aString = String(aValue);
      const bString = String(bValue);
      if (aString === bString) {
        continue;
      }

      return aString > bString ? direction : -direction;
    }

    return 0;
  });
}

function applyRange(records: Record<string, unknown>[], params: URLSearchParams, rangeHeader: string | null) {
  const offset = params.get('offset');
  const limit = params.get('limit');

  if (offset || limit) {
    const startIndex = offset ? Number(offset) : 0;
    const limitNumber = limit ? Number(limit) : undefined;
    return limitNumber !== undefined ? records.slice(startIndex, startIndex + limitNumber) : records.slice(startIndex);
  }

  if (rangeHeader) {
    const [startToken, endToken] = rangeHeader.split('-');
    const start = Number(startToken);
    const end = Number(endToken);
    if (!Number.isNaN(start) && !Number.isNaN(end)) {
      return records.slice(start, end + 1);
    }
  }

  return records;
}

function buildContentRangeHeader(length: number) {
  if (length === 0) {
    return '0-0/0';
  }

  return `0-${Math.max(0, length - 1)}/${length}`;
}

function createPostgrestError(code: string, message: string) {
  return {
    code,
    details: null,
    hint: null,
    message,
  };
}

function matchesOrFilter(record: Record<string, unknown>, rawValue: string) {
  const decoded = decodeSupabaseFilterValue(rawValue);
  if (!decoded) {
    return true;
  }

  const trimmed = decoded.trim();
  const normalized = trimmed.startsWith('(') && trimmed.endsWith(')')
    ? trimmed.slice(1, -1)
    : trimmed;

  if (!normalized) {
    return true;
  }

  const clauses = splitOrClauses(normalized);
  if (!clauses.length) {
    return true;
  }

  return clauses.some((clause) => evaluateOrClause(record, clause));
}

function splitOrClauses(value: string) {
  const clauses: string[] = [];
  let buffer = '';
  let depth = 0;

  for (const char of value) {
    if (char === '(') {
      depth += 1;
    } else if (char === ')') {
      depth = Math.max(0, depth - 1);
    }

    if (char === ',' && depth === 0) {
      if (buffer.trim()) {
        clauses.push(buffer.trim());
      }
      buffer = '';
      continue;
    }

    buffer += char;
  }

  if (buffer.trim()) {
    clauses.push(buffer.trim());
  }

  return clauses;
}

function evaluateOrClause(record: Record<string, unknown>, clause: string) {
  const trimmed = clause.trim();
  if (!trimmed) {
    return false;
  }

  const parts = trimmed.split('.');
  if (parts.length < 3) {
    return false;
  }

  const column = parts.shift() as string;
  const operator = parts.shift() as string;
  const value = parts.join('.');
  return applyOperator(record, column, operator, value);
}

function applyOperator(
  record: Record<string, unknown>,
  column: string,
  operator: string,
  value: string,
) {
  const columnValue = record[column];
  switch (operator) {
    case 'eq':
      return compareEq(columnValue, value);
    case 'is':
      return compareIs(columnValue, value);
    case 'ilike':
      return matchesLike(columnValue, value, true);
    case 'like':
      return matchesLike(columnValue, value, false);
    default:
      return true;
  }
}

function compareIs(value: unknown, target: string) {
  if (target === 'null') {
    return value === null;
  }

  if (target === 'true') {
    return value === true;
  }

  if (target === 'false') {
    return value === false;
  }

  return String(value) === target;
}

const LIKE_SPECIAL_CHARS = /[.*+?^${}()|[\]\\]/g;

function escapeLikePattern(value: string) {
  return value.replace(LIKE_SPECIAL_CHARS, '\\$&');
}

function matchesLike(value: unknown, pattern: string, caseInsensitive: boolean) {
  if (typeof value !== 'string') {
    return false;
  }

  const escaped = escapeLikePattern(pattern)
    .replace(/%/g, '.*')
    .replace(/_/g, '.');
  const regex = new RegExp(`^${escaped}$`, caseInsensitive ? 'i' : undefined);
  return regex.test(value);
}
