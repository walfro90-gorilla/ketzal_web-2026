-- Script to fix the user_role enum and profiles table definition

-- 1. Create the enum type if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('traveler', 'provider', 'admin', 'ambassador');
    END IF;
END $$;

-- 2. Alter the profiles table to ensure the role column uses the correct enum type
-- We use a USING clause to cast existing text values to the enum
ALTER TABLE public.profiles 
ALTER COLUMN role DROP DEFAULT; -- Drop default temporarily

ALTER TABLE public.profiles 
ALTER COLUMN role TYPE public.user_role 
USING role::text::public.user_role;

-- 3. Restore the default value
ALTER TABLE public.profiles 
ALTER COLUMN role SET DEFAULT 'traveler'::public.user_role;

-- 4. Verify RLS policies don't block updates (though Admin client bypasses this, it's good practice)
-- Ensure the postgres role has permission to use the type
GRANT USAGE ON TYPE public.user_role TO postgres, anon, authenticated, service_role;
