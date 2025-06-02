-- Fix UUID default generation for users table
-- Run this in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add default UUID generation to the id column
ALTER TABLE public.users 
ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Update the helper function to not specify id (let it auto-generate)
CREATE OR REPLACE FUNCTION public.create_email_user(
    p_email text,
    p_username text,
    p_display_name text,
    p_password_hash text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_user_id uuid;
BEGIN
    INSERT INTO public.users (
        email,
        username,
        display_name,
        password_hash,
        provider,
        provider_id,
        email_verified,
        last_sign_in_at
    ) VALUES (
        p_email,
        p_username,
        p_display_name,
        p_password_hash,
        'email',
        p_email,
        true,
        NOW()
    ) RETURNING id INTO new_user_id;
    
    RETURN new_user_id;
END;
$$;

-- Test the function
SELECT public.create_email_user(
    'test@function.com',
    'testfunc',
    'Test Function User',
    'dummy_hash'
); 