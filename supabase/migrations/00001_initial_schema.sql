-- IBKR Frontend Refresh - Initial Database Schema
-- Phase 1: Foundation
-- 
-- This migration creates the core user table for the portfolio management system.
-- Pies and slices are created in a separate migration (00003_pies_slices.sql).

-- Note: Supabase uses gen_random_uuid() instead of uuid_generate_v4()

-- ============================================================================
-- USERS TABLE
-- ============================================================================
-- Links to Supabase Auth users via auth.users(id)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(100),
    ibkr_connected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FUNCTION FOR UPDATED_AT TIMESTAMPS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to users table
CREATE TRIGGER trigger_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY users_policy ON users FOR ALL USING (auth.uid() = id);
