-- INSPECTION SCRIPT
-- 1. Read any logs that survived (unlikely if rolled back, but check)
SELECT * FROM public.debug_logs ORDER BY created_at DESC LIMIT 10;

-- 2. Check the Actual Enum Values in Postgres
SELECT t.typname, e.enumlabel
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'service_type';

-- 3. Check the Profiles Table Columns
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'provider_type';
