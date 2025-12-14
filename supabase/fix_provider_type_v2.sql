-- ROBUST FIX FOR PROVIDER TYPE PERSISTENCE

-- 1. Update the 'service_type' ENUM to strictly match the App's options
-- The App uses: 'tour', 'experience', 'hotel', 'lodging', 'transport', 'product'
-- We wrap in a DO block to safely add values if they don't exist.
DO $$
BEGIN
    -- Add 'hotel'
    BEGIN
        ALTER TYPE public.service_type ADD VALUE 'hotel';
    EXCEPTION WHEN duplicate_object THEN null;
    END;

    -- Add 'product'
    BEGIN
        ALTER TYPE public.service_type ADD VALUE 'product';
    EXCEPTION WHEN duplicate_object THEN null;
    END;

    -- Add 'lodging' (just in case it was missing from some envs, though it is standard)
    BEGIN
        ALTER TYPE public.service_type ADD VALUE 'lodging';
    EXCEPTION WHEN duplicate_object THEN null;
    END;
END $$;

-- 2. Ensure 'provider_type' column exists in 'profiles' table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'provider_type') THEN
        ALTER TABLE public.profiles ADD COLUMN provider_type public.service_type;
    END IF;
END $$;


-- 3. Recreate the 'handle_new_user' trigger function with EXPLICIT Logging and Casting
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  p_type text;
  p_role user_role;
BEGIN
  -- Extract raw values
  p_type := new.raw_user_meta_data->>'provider_type';
  p_role := COALESCE(new.raw_user_meta_data->>'role', 'traveler')::user_role;

  -- Create Profile
  INSERT INTO public.profiles (id, full_name, username, role, avatar_url, provider_type)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'username',
    p_role,
    new.raw_user_meta_data->>'avatar_url',
    -- Robust Casting: Nullify empty strings, then cast
    CASE 
      WHEN p_type IS NULL OR p_type = '' THEN NULL
      ELSE p_type::service_type
    END
  );
  
  -- Create Wallet (Essential for every user)
  INSERT INTO public.wallets (user_id)
  VALUES (new.id);

  RETURN new;
END;
$$;
