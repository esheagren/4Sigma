-- Simple diagnostic script to understand the users table
-- Run each query separately in your Supabase SQL Editor

-- 1. Check if users table exists and its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check current users in the table (run this separately)
-- SELECT id, display_name, created_at FROM public.users LIMIT 10;

-- 3. Check if RLS is enabled (run this separately)
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = 'users' AND schemaname = 'public'; 