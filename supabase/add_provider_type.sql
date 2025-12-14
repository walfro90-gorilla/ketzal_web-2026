-- 1. Add provider_type column to profiles table
-- We use a DO block to avoid errors if the column already exists (though IF NOT EXISTS is standard, ensuring safe execution environment)
DO $$
BEGIN
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
    COALESCE(new.raw_user_meta_data->>'role', 'user')::user_role,
    new.raw_user_meta_data->>'avatar_url',
    -- Safely cast provider_type, handling empty strings as NULL
    CASE 
      WHEN new.raw_user_meta_data->>'provider_type' IS NULL OR new.raw_user_meta_data->>'provider_type' = '' THEN NULL
      ELSE (new.raw_user_meta_data->>'provider_type')::service_type
    END
  );
  RETURN new;
END;
$$;
