-- AUDIT LOGGING SETUP
-- run this script to create a debug table and spy on the trigger data

-- 1. Create a log table to capture exactly what the DB receives
CREATE TABLE IF NOT EXISTS public.debug_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    event_name text,
    payload jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- 2. Modify the trigger to log EVERYTHING before trying to process it
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  p_type text;
  p_role user_role;
BEGIN
  -- AUDIT LOGGING: Write the raw input to the logs table
  INSERT INTO public.debug_logs (event_name, payload)
  VALUES ('handle_new_user_start', to_jsonb(new.raw_user_meta_data));

  -- Extract raw values
  p_type := new.raw_user_meta_data->>'provider_type';
  p_role := COALESCE(new.raw_user_meta_data->>'role', 'traveler')::user_role;

  -- Log extracted values
  INSERT INTO public.debug_logs (event_name, payload)
  VALUES ('extracted_values', jsonb_build_object('extracted_type', p_type, 'extracted_role', p_role));


  -- Create Profile
  BEGIN
      INSERT INTO public.profiles (id, full_name, username, role, avatar_url, provider_type)
      VALUES (
        new.id,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'username',
        p_role,
        new.raw_user_meta_data->>'avatar_url',
        -- Robust Casting
        CASE 
          WHEN p_type IS NULL OR p_type = '' THEN NULL
          ELSE p_type::service_type
        END
      );
  EXCEPTION WHEN OTHERS THEN
      -- Log any error during profile creation
      INSERT INTO public.debug_logs (event_name, payload)
      VALUES ('profile_insert_error', jsonb_build_object('error', SQLERRM, 'detail', SQLSTATE));
      RAISE; -- Re-raise error to fail the transaction
  END;
  
  -- Create Wallet
  INSERT INTO public.wallets (user_id)
  VALUES (new.id);
  
  -- Log Success
  INSERT INTO public.debug_logs (event_name, payload)
  VALUES ('success', jsonb_build_object('user_id', new.id));

  RETURN new;
END;
$$;
