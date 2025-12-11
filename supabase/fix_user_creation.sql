-- FINAL ROBUST FIX FOR USER CREATION (WEB/APP COMPATIBLE)
-- Run this in Supabase SQL Editor

-- 1. CLEANUP: Remove any existing triggers/functions to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TRIGGER IF EXISTS web_on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.web_handle_new_user();

-- 2. ENUM CHECK: Ensure 'user_role' type exists and has correct values
DO $$
BEGIN
    -- Create type if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('admin', 'provider', 'traveler', 'ambassador');
    ELSE
        -- If type exists, ensure it has 'traveler'. 
        -- (Postgres ALTER TYPE ADD VALUE cannot run inside a DO block easily in all versions, 
        -- so we assume if it exists, it's correct from previous scripts. 
        -- If you get an error "invalid input value for enum", drop the type and recreate it manually).
        NULL;
    END IF;
END$$;

-- 3. TABLE FIX: Ensure public.profiles uses the Enum
-- We strip constraints first to avoid dependency errors
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Safe cast to Enum
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE public.user_role 
USING (
  CASE 
    WHEN role::text = 'user' THEN 'traveler'::public.user_role
    WHEN role::text = 'traveler' THEN 'traveler'::public.user_role
    WHEN role::text = 'provider' THEN 'provider'::public.user_role
    WHEN role::text = 'admin' THEN 'admin'::public.user_role
    WHEN role::text = 'ambassador' THEN 'ambassador'::public.user_role
    ELSE 'traveler'::public.user_role
  END
);

ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'traveler'::public.user_role;

-- 4. TRIGGER FUNCTION (With Collision Handling)
CREATE OR REPLACE FUNCTION public.web_handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  metadata_role text;
  final_role public.user_role;
  base_username text;
  final_username text;
  collision_counter integer := 0;
BEGIN
  -- A. Resolve Role
  metadata_role := COALESCE(new.raw_user_meta_data->>'role', 'traveler');
  
  IF metadata_role = 'admin' THEN final_role := 'admin';
  ELSIF metadata_role = 'provider' THEN final_role := 'provider';
  ELSIF metadata_role = 'ambassador' THEN final_role := 'ambassador';
  ELSIF metadata_role = 'traveler' THEN final_role := 'traveler';
  ELSE final_role := 'traveler'; 
  END IF;

  -- B. Resolve Username (Handle Uniqueness)
  -- Get base username from metadata or email
  base_username := COALESCE(
    new.raw_user_meta_data->>'username', 
    split_part(new.email, '@', 1)
  );
  
  -- Clean it (lowercase, remove spaces)
  base_username := lower(regexp_replace(base_username, '\s', '', 'g'));
  final_username := base_username;

  -- Simple loop to find a unique username if taken
  -- (Tries base, then base_1, base_2... up to 5 attempts)
  LOOP
    BEGIN
      INSERT INTO public.profiles (id, username, full_name, role)
      VALUES (
        new.id,
        final_username,
        COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
        final_role
      );
      -- If insert succeeds, break loop
      EXIT; 
    EXCEPTION 
      WHEN unique_violation THEN
        -- If username collision, append random number and retry
        collision_counter := collision_counter + 1;
        IF collision_counter > 5 THEN
            -- Fallback to random string if stuck
            final_username := 'user_' || substr(md5(random()::text), 1, 8);
        ELSE
            final_username := base_username || '_' || (floor(random() * 1000)::text);
        END IF;
        -- Continue loop to try INSERT again
    END;
  END LOOP;

  -- C. Create Wallet
  INSERT INTO public.wallets (user_id, balance)
  VALUES (new.id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Capture any other non-unique error
    RAISE EXCEPTION 'Web Trigger Error: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. CREATE TRIGGER
CREATE TRIGGER web_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.web_handle_new_user();

SELECT 'Super Pro Fix Applied Successfully' as status;
