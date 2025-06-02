-- Diagnostic script to understand the users table structure
-- Run this in your Supabase SQL Editor to gather information

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

-- 2. Check existing constraints on users table
SELECT 
    constraint_name, 
    constraint_type, 
    column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'users' 
AND tc.table_schema = 'public';

-- 3. Check current users in the table
SELECT id, display_name, created_at FROM public.users LIMIT 10;

-- 4. Check RLS policies on users table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users';

-- 5. Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'users' 
AND schemaname = 'public'; 