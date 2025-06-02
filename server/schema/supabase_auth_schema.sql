-- OAuth-ready authentication setup for existing users table
-- Run this in your Supabase SQL Editor

-- Add authentication fields to existing users table (OAuth compatible)
-- Using DO blocks to handle IF NOT EXISTS logic

DO $$
BEGIN
    -- Add username column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'username' AND table_schema = 'public') THEN
        ALTER TABLE public.users ADD COLUMN username text;
    END IF;

    -- Add password_hash column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'password_hash' AND table_schema = 'public') THEN
        ALTER TABLE public.users ADD COLUMN password_hash text;
    END IF;

    -- Add provider column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'provider' AND table_schema = 'public') THEN
        ALTER TABLE public.users ADD COLUMN provider text DEFAULT 'email';
    END IF;

    -- Add provider_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'provider_id' AND table_schema = 'public') THEN
        ALTER TABLE public.users ADD COLUMN provider_id text;
    END IF;

    -- Add email_verified column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'email_verified' AND table_schema = 'public') THEN
        ALTER TABLE public.users ADD COLUMN email_verified boolean DEFAULT false;
    END IF;

    -- Add last_sign_in_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'last_sign_in_at' AND table_schema = 'public') THEN
        ALTER TABLE public.users ADD COLUMN last_sign_in_at timestamp with time zone;
    END IF;
END $$;

-- Add constraints for OAuth compatibility
DO $$
BEGIN
    -- Add email unique constraint if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'users_email_unique' AND table_name = 'users' AND table_schema = 'public') THEN
        ALTER TABLE public.users ADD CONSTRAINT users_email_unique UNIQUE (email);
    END IF;

    -- Add provider unique constraint if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'users_provider_unique' AND table_name = 'users' AND table_schema = 'public') THEN
        ALTER TABLE public.users ADD CONSTRAINT users_provider_unique UNIQUE (provider, provider_id);
    END IF;
END $$;

-- Create unique index for username (only when not null)
DROP INDEX IF EXISTS idx_users_username_unique;
CREATE UNIQUE INDEX idx_users_username_unique 
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
    provider = 'email',
    provider_id = email,
    email_verified = true
WHERE id = '550e8400-e29b-41d4-a716-446655440000' AND email = 'test@example.com';

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