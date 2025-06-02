-- Setup script for Supabase with authentication system
-- This assumes your users table is linked to Supabase auth

-- Step 1: Add email column if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS email text;

-- Step 2: First, create a user in the auth.users table (this is what Supabase auth does)
-- We'll insert directly into auth.users with the same UUID
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'test@example.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"display_name": "Test User"}',
    false
)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Now insert into public.users (this should work since auth.users exists)
INSERT INTO public.users (id, display_name, email) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440000', 
    'Test User',
    'test@example.com'
)
ON CONFLICT (id) DO UPDATE SET 
    display_name = 'Test User',
    email = 'test@example.com';

-- Step 4: Verify the user was created
SELECT id, display_name, email, created_at FROM public.users 
WHERE id = '550e8400-e29b-41d4-a716-446655440000'; 