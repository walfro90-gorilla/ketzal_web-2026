-- INSPECT SUSPICIOUS TRIGGER
-- Retrieve the function name and source code associated with the zombie trigger

SELECT 
    t.tgname as trigger_name, 
    p.proname as function_name, 
    p.prosrc as source_code
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgname = 'web_on_auth_user_created';
