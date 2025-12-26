-- Simple user profile table for Supabase Auth
-- Stores extra profile data: role and avatar
CREATE TABLE IF NOT EXISTS public.user (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'borrower',
    image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_email ON public.user(email);
CREATE INDEX IF NOT EXISTS idx_user_role ON public.user(role);

-- Enable RLS
ALTER TABLE public.user ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.user FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.user FOR INSERT WITH CHECK (auth.uid() = id);

-- Grant permissions
GRANT ALL ON public.user TO authenticated;
GRANT SELECT ON public.user TO anon;
