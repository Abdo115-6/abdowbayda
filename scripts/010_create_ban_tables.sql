-- Create banned_ips table
CREATE TABLE IF NOT EXISTS public.banned_ips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address INET NOT NULL UNIQUE,
    banned_by UUID REFERENCES auth.users(id),
    banned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create banned_emails table  
CREATE TABLE IF NOT EXISTS public.banned_emails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    banned_by UUID REFERENCES auth.users(id),
    banned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.banned_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banned_emails ENABLE ROW LEVEL SECURITY;

-- Create policies (only admins can manage ban lists)
CREATE POLICY "Only admins can manage banned IPs" ON public.banned_ips
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
    );

CREATE POLICY "Only admins can manage banned emails" ON public.banned_emails
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
    );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_banned_ips_ip ON public.banned_ips(ip_address);
CREATE INDEX IF NOT EXISTS idx_banned_emails_email ON public.banned_emails(email);
CREATE INDEX IF NOT EXISTS idx_banned_ips_banned_at ON public.banned_ips(banned_at DESC);
CREATE INDEX IF NOT EXISTS idx_banned_emails_banned_at ON public.banned_emails(banned_at DESC);
