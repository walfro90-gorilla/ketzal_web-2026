-- Fix for "record 'new' has no field 'updated_at'" error

-- 1. Add the missing column to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- 2. Verify and Fix Enum Type (Just in case)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('traveler', 'provider', 'admin', 'ambassador');
    END IF;
END $$;

-- 3. Ensure the moddatetime extension exists (Standard Supabase)
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

-- 4. Re-create the trigger to update updated_at automatically
DROP TRIGGER IF EXISTS handle_updated_at ON public.profiles;

CREATE TRIGGER handle_updated_at 
BEFORE UPDATE ON public.profiles 
FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);
