-- OAuth-ready authentication setup for existing users table
-- Run this in your Supabase SQL Editor

-- Add authentication fields to existing users table (OAuth compatible)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS username text;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS password_hash text;

-- OAuth provider fields
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS provider text DEFAULT 'email';

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS provider_id text;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS last_sign_in_at timestamp with time zone;

-- Make username optional (since OAuth users might not have one initially)
-- Make password_hash optional (since OAuth users won't have passwords)

-- Add constraints for OAuth compatibility
ALTER TABLE public.users 
ADD CONSTRAINT IF NOT EXISTS users_email_unique UNIQUE (email);

-- Create a composite unique constraint for provider + provider_id
-- This allows the same email to exist with different providers
ALTER TABLE public.users 
ADD CONSTRAINT IF NOT EXISTS users_provider_unique UNIQUE (provider, provider_id);

-- Username should be unique when it exists, but can be null
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_unique 
ON public.users(username) 
WHERE username IS NOT NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_provider ON public.users(provider);
CREATE INDEX IF NOT EXISTS idx_users_provider_id ON public.users(provider_id);

-- Update existing test user to be compatible with new structure
UPDATE public.users 
SET 
    username = 'testuser',
    email = 'test@example.com',
    provider = 'email',
    provider_id = email,
    email_verified = true
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Create a function to handle user creation/update for OAuth
CREATE OR REPLACE FUNCTION public.handle_oauth_user(
    p_email text,
    p_display_name text,
    p_avatar_url text DEFAULT NULL,
    p_provider text DEFAULT 'email',
    p_provider_id text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id uuid;
BEGIN
    -- Try to find existing user by email and provider
    SELECT id INTO user_id
    FROM public.users
    WHERE email = p_email AND provider = p_provider;
    
    IF user_id IS NULL THEN
        -- Create new user
        INSERT INTO public.users (
            email, 
            display_name, 
            avatar_url, 
            provider, 
            provider_id,
            email_verified,
            last_sign_in_at
        ) VALUES (
            p_email, 
            p_display_name, 
            p_avatar_url, 
            p_provider,
            COALESCE(p_provider_id, p_email),
            true,
            NOW()
        ) RETURNING id INTO user_id;
    ELSE
        -- Update existing user
        UPDATE public.users 
        SET 
            display_name = COALESCE(p_display_name, display_name),
            avatar_url = COALESCE(p_avatar_url, avatar_url),
            last_sign_in_at = NOW()
        WHERE id = user_id;
    END IF;
    
    RETURN user_id;
END;
$$;

-- Verify the updated table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position; 