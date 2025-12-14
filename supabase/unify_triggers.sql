-- UNIFICATION SCRIPT: ONE SOURCE OF TRUTH
-- This script cleans up duplicate triggers and establishes 'public.handle_new_user' as the ONLY handler.

-- 1. DROP ALL conflicting triggers on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS web_on_auth_user_created ON auth.users;

-- 2. Define the Master Function (public.handle_new_user)
-- This function handles EVERYTHING: Web Data, Mobile Data, Wallets, and Provider Types.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  p_type text;
  p_role user_role;
BEGIN
  -- AUDIT: Startup Log (Keep this for now to confirm success)
  INSERT INTO public.debug_logs (event_name, payload)
  VALUES ('unified_handler_start', to_jsonb(new.raw_user_meta_data));

  -- 1. Extract Values (Safe for both Web and Mobile payloads)
  p_type := new.raw_user_meta_data->>'provider_type';
  p_role := COALESCE(new.raw_user_meta_data->>'role', 'traveler')::user_role;

  -- 2. Create Profile
  INSERT INTO public.profiles (id, full_name, username, role, avatar_url, provider_type)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    -- Fallback username if mobile doesn't send it: use email prefix
    COALESCE(new.raw_user_meta_data->>'username', SPLIT_PART(new.email, '@', 1)),
    p_role,
    new.raw_user_meta_data->>'avatar_url',
    -- Smart Cast: "clean" the input so it matches the ENUM
    CASE 
      WHEN p_type IS NULL OR p_type = '' THEN NULL
      ELSE p_type::service_type
    END
  );
  
  -- 3. Create Wallet (Mandatory for everyone)
  INSERT INTO public.wallets (user_id)
  VALUES (new.id);
  
  -- AUDIT: Success
  INSERT INTO public.debug_logs (event_name, payload)
  VALUES ('unified_handler_success', jsonb_build_object('user_id', new.id));

  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- AUDIT: Log Error but RE-RAISE it so the App knows it failed
  INSERT INTO public.debug_logs (event_name, payload)
  VALUES ('unified_handler_error', jsonb_build_object('error', SQLERRM));
  RAISE; 
END;
$$;

-- 3. Create the SINGLE Master Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Clean up any bad ENUMs if needed (Safety check)
DO $$
BEGIN
    BEGIN
        ALTER TYPE public.service_type ADD VALUE 'hotel';
    EXCEPTION WHEN duplicate_object THEN null;
    END;
END $$;
