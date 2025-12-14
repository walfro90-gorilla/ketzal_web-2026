-- SAFE INSPECTION SCRIPT (Read-Only)
-- This will tell us if the 'service_type' enum is missing values or if there are zombie triggers.

-- 1. Check valid values for 'service_type' enum
SELECT e.enumlabel
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'service_type';

-- 2. Check for ANY triggers on the 'profiles' table
SELECT tgname, tgenabled
FROM pg_trigger
WHERE tgrelid = 'public.profiles'::regclass;

-- 3. Check for ANY triggers on 'auth.users' table
SELECT tgname, tgenabled
FROM pg_trigger
WHERE tgrelid = 'auth.users'::regclass;
