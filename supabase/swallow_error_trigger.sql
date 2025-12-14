-- SWALLOW AND LOG TRIGGER
-- This version catches errors, logs them to 'debug_logs', and allows the transaction to commit.
-- This ensures we can SEE why it's failing.

-- 1. Ensure logs table
CREATE TABLE IF NOT EXISTS public.debug_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    event_name text,
    payload jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- 2. "Safe Mode" Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  p_type text;
  p_role user_role;
BEGIN
  -- AUDIT: Start
  INSERT INTO public.debug_logs (event_name, payload)
  VALUES ('handle_new_user_start_safe_mode', to_jsonb(new.raw_user_meta_data));

  -- 1. Extract Values
  p_type := new.raw_user_meta_data->>'provider_type';
  p_role := COALESCE(new.raw_user_meta_data->>'role', 'traveler')::user_role;

  -- AUDIT: Extracted
  INSERT INTO public.debug_logs (event_name, payload)
  VALUES ('extracted_values', jsonb_build_object('extracted_type', p_type, 'extracted_role', p_role));

  -- 2. Create Profile (Protected Block)
  BEGIN
      INSERT INTO public.profiles (id, full_name, username, role, avatar_url, provider_type)
      VALUES (
        new.id,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'username',
        p_role,
        new.raw_user_meta_data->>'avatar_url',
        -- Cast Logic
        CASE 
          WHEN p_type IS NULL OR p_type = '' THEN NULL
          ELSE p_type::service_type
        END
      );
  EXCEPTION WHEN OTHERS THEN
      -- AUDIT: Capture Error
      INSERT INTO public.debug_logs (event_name, payload)
      VALUES ('PROFILE_INSERT_FAILED', jsonb_build_object('error', SQLERRM, 'detail', SQLSTATE, 'hint', 'Check enum values?'));
      -- CRITICAL: WE DO NOT RAISE HERE. We let the user be created so we can see the log.
  END;
  
  -- 3. Create Wallet
  BEGIN
      INSERT INTO public.wallets (user_id)
      VALUES (new.id);
  EXCEPTION WHEN OTHERS THEN
       INSERT INTO public.debug_logs (event_name, payload)
       VALUES ('WALLET_INSERT_FAILED', jsonb_build_object('error', SQLERRM));
  END;

  -- AUDIT: Buffer Success (even if profile failed, we reached here)
  INSERT INTO public.debug_logs (event_name, payload)
  VALUES ('trigger_completed', jsonb_build_object('user_id', new.id));

  RETURN new;
END;
$$;

-- 3. Ensure Trigger Linkage
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
