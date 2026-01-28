-- IBKR Frontend Refresh - Auth Trigger Migration
-- Phase 2: Authentication
--
-- This migration creates a trigger to automatically create a user record
-- in the public.users table when a new user signs up via Supabase Auth.

-- ============================================================================
-- FUNCTION: Handle New User Signup
-- ============================================================================
-- This function is called when a new user is created in auth.users.
-- It creates a corresponding record in public.users with the same ID.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NULL)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER: On Auth User Created
-- ============================================================================
-- This trigger fires after a new user is inserted into auth.users.
-- It calls handle_new_user() to create the public.users record.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- FUNCTION: Handle User Email Update
-- ============================================================================
-- This function syncs email changes from auth.users to public.users.

CREATE OR REPLACE FUNCTION public.handle_user_email_update()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.email IS DISTINCT FROM OLD.email THEN
        UPDATE public.users
        SET email = NEW.email, updated_at = NOW()
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER: On Auth User Email Updated
-- ============================================================================

DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;

CREATE TRIGGER on_auth_user_email_updated
    AFTER UPDATE OF email ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_user_email_update();

-- ============================================================================
-- FUNCTION: Handle User Deletion
-- ============================================================================
-- Note: The foreign key constraint with ON DELETE CASCADE already handles this,
-- but we add this trigger for any additional cleanup if needed in the future.

CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
    -- The CASCADE constraint handles deletion, but we could add
    -- additional cleanup logic here if needed (e.g., audit logging)
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Grant necessary permissions
-- ============================================================================
-- The trigger functions need to be able to insert/update public.users

GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.users TO supabase_auth_admin;
