-- Migration: Create pies and slices tables
-- Phase 3: Pie & Slice Structure

-- =============================================================================
-- PIES TABLE
-- =============================================================================
-- Pies represent themed portfolio groups (e.g., "Tech Growth", "Dividend Income")

CREATE TABLE IF NOT EXISTS public.pies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for UI display
    icon VARCHAR(50), -- Optional icon identifier
    target_allocation DECIMAL(5,2) DEFAULT 0 CHECK (target_allocation >= 0 AND target_allocation <= 100),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster user queries
CREATE INDEX IF NOT EXISTS idx_pies_user_id ON public.pies(user_id);
CREATE INDEX IF NOT EXISTS idx_pies_user_active ON public.pies(user_id, is_active);

-- =============================================================================
-- SLICES TABLE
-- =============================================================================
-- Slices represent individual holdings within a pie

CREATE TABLE IF NOT EXISTS public.slices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pie_id UUID NOT NULL REFERENCES public.pies(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL, -- Stock ticker symbol (e.g., "AAPL", "MSFT")
    name VARCHAR(100), -- Company name (e.g., "Apple Inc.")
    target_weight DECIMAL(5,2) NOT NULL CHECK (target_weight > 0 AND target_weight <= 100),
    display_order INTEGER DEFAULT 0,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique symbol per pie
    UNIQUE(pie_id, symbol)
);

-- Index for faster pie queries
CREATE INDEX IF NOT EXISTS idx_slices_pie_id ON public.slices(pie_id);
CREATE INDEX IF NOT EXISTS idx_slices_symbol ON public.slices(symbol);

-- =============================================================================
-- UPDATED_AT TRIGGERS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for pies
DROP TRIGGER IF EXISTS update_pies_updated_at ON public.pies;
CREATE TRIGGER update_pies_updated_at
    BEFORE UPDATE ON public.pies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for slices
DROP TRIGGER IF EXISTS update_slices_updated_at ON public.slices;
CREATE TRIGGER update_slices_updated_at
    BEFORE UPDATE ON public.slices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on pies
ALTER TABLE public.pies ENABLE ROW LEVEL SECURITY;

-- Users can only see their own pies
CREATE POLICY "Users can view own pies"
    ON public.pies FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own pies
CREATE POLICY "Users can insert own pies"
    ON public.pies FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own pies
CREATE POLICY "Users can update own pies"
    ON public.pies FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own pies
CREATE POLICY "Users can delete own pies"
    ON public.pies FOR DELETE
    USING (auth.uid() = user_id);

-- Enable RLS on slices
ALTER TABLE public.slices ENABLE ROW LEVEL SECURITY;

-- Users can only see slices in their own pies
CREATE POLICY "Users can view own slices"
    ON public.slices FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.pies
            WHERE pies.id = slices.pie_id
            AND pies.user_id = auth.uid()
        )
    );

-- Users can insert slices into their own pies
CREATE POLICY "Users can insert own slices"
    ON public.slices FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.pies
            WHERE pies.id = slices.pie_id
            AND pies.user_id = auth.uid()
        )
    );

-- Users can update slices in their own pies
CREATE POLICY "Users can update own slices"
    ON public.slices FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.pies
            WHERE pies.id = slices.pie_id
            AND pies.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.pies
            WHERE pies.id = slices.pie_id
            AND pies.user_id = auth.uid()
        )
    );

-- Users can delete slices from their own pies
CREATE POLICY "Users can delete own slices"
    ON public.slices FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.pies
            WHERE pies.id = slices.pie_id
            AND pies.user_id = auth.uid()
        )
    );

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to get total weight of slices in a pie
CREATE OR REPLACE FUNCTION get_pie_total_weight(p_pie_id UUID)
RETURNS DECIMAL AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(target_weight) FROM public.slices WHERE pie_id = p_pie_id AND is_active = true),
        0
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate slice weights don't exceed 100%
CREATE OR REPLACE FUNCTION validate_slice_weight()
RETURNS TRIGGER AS $$
DECLARE
    current_total DECIMAL;
    new_total DECIMAL;
BEGIN
    -- Get current total weight excluding this slice (for updates)
    SELECT COALESCE(SUM(target_weight), 0)
    INTO current_total
    FROM public.slices
    WHERE pie_id = NEW.pie_id
    AND is_active = true
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID);
    
    new_total := current_total + NEW.target_weight;
    
    IF new_total > 100 THEN
        RAISE EXCEPTION 'Total slice weights cannot exceed 100%%. Current: %%%, New: %%%, Total would be: %%%',
            current_total, NEW.target_weight, new_total;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate slice weights on insert/update
DROP TRIGGER IF EXISTS validate_slice_weight_trigger ON public.slices;
CREATE TRIGGER validate_slice_weight_trigger
    BEFORE INSERT OR UPDATE ON public.slices
    FOR EACH ROW
    EXECUTE FUNCTION validate_slice_weight();
