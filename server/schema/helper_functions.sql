-- Helper functions to bypass schema cache issues
-- Run this in your Supabase SQL Editor after the main schema

-- Function to check if user exists
CREATE OR REPLACE FUNCTION public.check_existing_user(
    p_email text,
    p_username text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_count integer;
BEGIN
    SELECT COUNT(*) INTO user_count
    FROM public.users
    WHERE email = p_email OR username = p_username;
    
    RETURN user_count;
END;
$$;

-- Function to create email user
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