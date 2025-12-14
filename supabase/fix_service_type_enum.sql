-- Fix service_type Enum
-- This script ensures the 'service_type' enum exists and has the correct values.
-- Run this in your Supabase SQL Editor.

DO $$
BEGIN
    -- 1. Create the type if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_type') THEN
        CREATE TYPE public.service_type AS ENUM ('tour', 'experience', 'lodging', 'transport');
    END IF;
END$$;

-- 2. Add values if they are missing (Postgres doesn't support IF NOT EXISTS for ADD VALUE in all versions, 
-- so we wrap in a block to ignore errors if it exists, or just try them one by one).
-- Note: You cannot run these inside a DO block easily because ALTER TYPE cannot run inside a transaction block in some Postgres versions.
-- But Supabase usually handles it. If not, run lines individually.

ALTER TYPE public.service_type ADD VALUE IF NOT EXISTS 'tour';
ALTER TYPE public.service_type ADD VALUE IF NOT EXISTS 'experience';
ALTER TYPE public.service_type ADD VALUE IF NOT EXISTS 'lodging';
ALTER TYPE public.service_type ADD VALUE IF NOT EXISTS 'transport';

-- 3. Ensure the column uses this type
-- This handles if the column was somehow TEXT or USER-DEFINED incorrectly.
ALTER TABLE public.services 
ALTER COLUMN service_type TYPE public.service_type 
USING service_type::text::public.service_type;
