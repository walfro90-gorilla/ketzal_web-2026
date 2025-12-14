-- FORCE TRIGGER REPAIR
-- This script guarantees the 'handle_new_user' function is the ONE actually running.

-- 1. Ensure the debug logs table exists (retry)
CREATE TABLE IF NOT EXISTS public.debug_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    event_name text,
    payload jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- 2. Define the Debug-Enabled Function (Same as before, ensuring it's loaded)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  p_type text;
  p_role user_role;
BEGIN
  -- AUDIT: Log entry immediately
  INSERT INTO public.debug_logs (event_name, payload)
  VALUES ('handle_new_user_start', to_jsonb(new.raw_user_meta_data));

  -- 1. Extract Values
  p_type := new.raw_user_meta_data->>'provider_type';
  p_role := COALESCE(new.raw_user_meta_data->>'role', 'traveler')::user_role;

  -- AUDIT: Log extraction
  INSERT INTO public.debug_logs (event_name, payload)
  VALUES ('extracted_values', jsonb_build_object('extracted_type', p_type, 'extracted_role', p_role));

  -- 2. Create Profile
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
  
  -- 3. Create Wallet
  INSERT INTO public.wallets (user_id)
  VALUES (new.id);
  
  -- AUDIT: Success
  INSERT INTO public.debug_logs (event_name, payload)
  VALUES ('success', jsonb_build_object('user_id', new.id));

  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- AUDIT: Catch and Log Errors
  INSERT INTO public.debug_logs (event_name, payload)
  VALUES ('CRITICAL_ERROR', jsonb_build_object('error', SQLERRM, 'detail', SQLSTATE));
  RAISE; 
END;
$$;

-- 3. THE FIX: Explicitly Drop and Re-Attach the Trigger on auth.users
-- This ensures we aren't running some "zombie" trigger.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger freshly linked to OUR function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Verify Link
-- We can't print to console here easily, but if this runs without error, the link is established.
