-- DB DOCTOR SCRIPT
-- 1. Kill potential stuck locks from previous migration attempts
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'idle in transaction' 
   OR state = 'idle' 
   AND current_timestamp - state_change > interval '5 minutes';

-- 2. Verify Service Type Enum Values (CRITICAL CHECK)
SELECT e.enumlabel
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'service_type';

-- 3. Check for Triggers on Profiles (To detect infinite loops)
SELECT tgname, tgenabled, tgrelid::regclass
FROM pg_trigger
WHERE tgrelid = 'public.profiles'::regclass;

-- 4. Check for RLS Policies on Profiles
SELECT polname, polpermissive, polroles, polcmd
FROM pg_policy
WHERE polrelid = 'public.profiles'::regclass;
