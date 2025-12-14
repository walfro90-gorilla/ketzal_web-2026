-- 1. Ensure provider_type column exists and modify ENUM
DO $$
BEGIN
    -- Update the enum 'service_type' to include new values if they don't exist
    -- Postgres doesn't support 'IF NOT EXISTS' for ALTER TYPE ADD VALUE easily in a DO block without exception handling
    -- but we can just run it. If it fails it likely exists. 
    -- However, for safety in this script, we'll assume we need to update it.
    
    -- Check if 'hotel' exists, if not add it.
    -- Note: You cannot delete from ENUMs safely without recreation.
    -- We will try to add 'hotel' and 'product'.
    
    BEGIN
        ALTER TYPE public.service_type ADD VALUE 'hotel';
    EXCEPTION WHEN duplicate_object THEN null;
    END;
    
    BEGIN
        ALTER TYPE public.service_type ADD VALUE 'product';
    EXCEPTION WHEN duplicate_object THEN null;
    END;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'provider_type') THEN
        ALTER TABLE public.profiles ADD COLUMN provider_type public.service_type;
    END IF;
END $$;

-- 2. Update the handle_new_user function to include provider_type
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, role, avatar_url, provider_type)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'username',
    COALESCE(new.raw_user_meta_data->>'role', 'traveler')::user_role,
    new.raw_user_meta_data->>'avatar_url',
    -- Safely cast provider_type
    CASE 
      WHEN new.raw_user_meta_data->>'provider_type' IS NULL OR new.raw_user_meta_data->>'provider_type' = '' THEN NULL
      ELSE (new.raw_user_meta_data->>'provider_type')::service_type
    END
  );
  
  -- Create Wallet for New User
  INSERT INTO public.wallets (user_id)
  VALUES (new.id);

  RETURN new;
END;
$$;
