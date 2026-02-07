-- HeimdallAI Database Schema
-- Installed via Supabase CLI migrations

-- Enable pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (extended from Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  organization TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  preferences JSONB DEFAULT '{"timezone": "UTC", "notifications": true}'::jsonb,
  quota JSONB DEFAULT '{"max_scans_per_month": 50, "storage_limit_mb": 1000}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scans table
CREATE TABLE IF NOT EXISTS public.scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target TEXT NOT NULL,
  scan_types TEXT[] NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  configuration JSONB DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  findings_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Findings table
CREATE TABLE IF NOT EXISTS public.findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  affected_asset TEXT NOT NULL,
  cvss_score NUMERIC(3,1),
  cwe_id TEXT,
  evidence JSONB DEFAULT '{}'::jsonb,
  ai_reasoning JSONB DEFAULT '{}'::jsonb,
  remediation JSONB DEFAULT '{}'::jsonb,
  state TEXT DEFAULT 'new' CHECK (state IN ('new', 'confirmed', 'false_positive', 'remediated', 'accepted_risk')),
  discovered_by_agent TEXT NOT NULL,
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID REFERENCES public.scans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('executive', 'technical', 'compliance')),
  file_url TEXT,
  file_size_bytes INTEGER,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent Activity Logs table
CREATE TABLE IF NOT EXISTS public.agent_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'error')),
  details JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  context JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON public.scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_status ON public.scans(status);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON public.scans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_findings_scan_id ON public.findings(scan_id);
CREATE INDEX IF NOT EXISTS idx_findings_severity ON public.findings(severity);
CREATE INDEX IF NOT EXISTS idx_findings_state ON public.findings(state);
CREATE INDEX IF NOT EXISTS idx_findings_severity_state ON public.findings(severity, state);
CREATE INDEX IF NOT EXISTS idx_agent_logs_scan_id ON public.agent_activity_logs(scan_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_timestamp ON public.agent_activity_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);

-- Full-text search index for findings
CREATE INDEX IF NOT EXISTS idx_findings_fulltext ON public.findings 
  USING GIN (to_tsvector('english', title || ' ' || description));

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for scans table
CREATE POLICY "Users can view their own scans" ON public.scans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scans" ON public.scans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scans" ON public.scans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scans" ON public.scans
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for findings table (through scans)
CREATE POLICY "Users can view findings from their scans" ON public.findings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.scans
      WHERE scans.id = findings.scan_id
      AND scans.user_id = auth.uid()
    )
  );

CREATE POLICY "System can create findings" ON public.findings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update findings from their scans" ON public.findings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.scans
      WHERE scans.id = findings.scan_id
      AND scans.user_id = auth.uid()
    )
  );

-- RLS Policies for reports table
CREATE POLICY "Users can view their own reports" ON public.reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for agent_activity_logs (through scans)
CREATE POLICY "Users can view logs from their scans" ON public.agent_activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.scans
      WHERE scans.id = agent_activity_logs.scan_id
      AND scans.user_id = auth.uid()
    )
  );

CREATE POLICY "System can create logs" ON public.agent_activity_logs
  FOR INSERT WITH CHECK (true);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view their own messages" ON public.chat_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own messages" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scans_updated_at BEFORE UPDATE ON public.scans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_findings_updated_at BEFORE UPDATE ON public.findings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update findings count on scan
CREATE OR REPLACE FUNCTION update_scan_findings_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.scans
  SET findings_count = (
    SELECT COUNT(*) FROM public.findings WHERE scan_id = NEW.scan_id
  )
  WHERE id = NEW.scan_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update findings count
CREATE TRIGGER update_findings_count_trigger
  AFTER INSERT ON public.findings
  FOR EACH ROW EXECUTE FUNCTION update_scan_findings_count();
