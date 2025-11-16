CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE public.phones (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    status text NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft','published','archived')),
    sale_state text NOT NULL DEFAULT 'available'
        CHECK (sale_state IN ('available','reserved','sold')),
    sale_type text NOT NULL DEFAULT 'instant'
        CHECK (sale_type IN ('instant','reservation')),
    title text NOT NULL,
    summary text,
    description text,
    price numeric(12,2) CHECK (price >= 0),
    currency text NOT NULL DEFAULT 'KRW',
    available_from timestamptz,
    available_until timestamptz,
    model_name text,
    storage_capacity text,
    device_condition text,
    address text,
    address_detail text,
    zipcode text,
    latitude numeric(9,6) CHECK (latitude BETWEEN -90 AND 90),
    longitude numeric(9,6) CHECK (longitude BETWEEN -180 AND 180),
    tags jsonb NOT NULL DEFAULT '[]'::jsonb,
    categories jsonb NOT NULL DEFAULT '[]'::jsonb,
    main_image_url text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.phone_media (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_id uuid NOT NULL REFERENCES public.phones(id) ON DELETE CASCADE,
    storage_path text,
    url text,
    file_name text,
    file_size bigint CHECK (file_size >= 0),
    mime_type text,
    display_order integer NOT NULL DEFAULT 0,
    is_primary boolean NOT NULL DEFAULT false,
    status text NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending','uploading','success','failed')),
    progress numeric(5,2) NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    error_code text,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_phone_media_phone_id ON public.phone_media(phone_id);

CREATE TABLE public.phone_reactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_id uuid NOT NULL REFERENCES public.phones(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN ('favorite','view','share')),
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);
CREATE INDEX idx_phone_reactions_phone_id ON public.phone_reactions(phone_id);
CREATE INDEX idx_phone_reactions_user_id ON public.phone_reactions(user_id);

CREATE TABLE public.phone_inquiries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_id uuid NOT NULL REFERENCES public.phones(id) ON DELETE CASCADE,
    parent_id uuid REFERENCES public.phone_inquiries(id) ON DELETE CASCADE,
    thread_path text NOT NULL DEFAULT '',
    author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content text NOT NULL CHECK (char_length(content) <= 100),
    link_url text,
    link_title text,
    link_description text,
    link_image text,
    status text NOT NULL DEFAULT 'active'
        CHECK (status IN ('active','edited','deleted')),
    is_answer boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_phone_inquiries_phone_id ON public.phone_inquiries(phone_id);
CREATE INDEX idx_phone_inquiries_parent_id ON public.phone_inquiries(parent_id);

CREATE TABLE public.activity_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_id uuid REFERENCES public.phones(id) ON DELETE SET NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type text NOT NULL,
    context jsonb NOT NULL DEFAULT '{}'::jsonb,
    result text NOT NULL DEFAULT 'success'
        CHECK (result IN ('success','error')),
    retryable boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_activity_logs_event_type ON public.activity_logs(event_type);
CREATE INDEX idx_activity_logs_phone_id ON public.activity_logs(phone_id);
