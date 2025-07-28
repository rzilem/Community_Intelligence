-- Phase 3 Completion: AI-Powered Integrations and Real-time Communication (Simplified)
-- Adding core tables needed for Phase 3 features

-- 1. Integration Configurations Table
CREATE TABLE IF NOT EXISTS public.integration_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'webhook', 'api', 'database')),
  config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Real-time Communication Channels
CREATE TABLE IF NOT EXISTS public.realtime_channels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_name TEXT NOT NULL UNIQUE,
  channel_type TEXT NOT NULL CHECK (channel_type IN ('broadcast', 'presence', 'private')),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Real-time Events
CREATE TABLE IF NOT EXISTS public.realtime_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID REFERENCES public.realtime_channels(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Communication Channels (for multi-channel messaging)
CREATE TABLE IF NOT EXISTS public.communication_channels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'push', 'in_app')),
  config JSONB DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Multi-channel Messages
CREATE TABLE IF NOT EXISTS public.multi_channel_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_template TEXT NOT NULL,
  channels TEXT[] DEFAULT ARRAY['email'],
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realtime_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realtime_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.multi_channel_messages ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (admin access for now)
CREATE POLICY "Admin access to integration_configs" ON public.integration_configs
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin access to realtime_channels" ON public.realtime_channels
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin access to realtime_events" ON public.realtime_events
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin access to communication_channels" ON public.communication_channels
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin access to multi_channel_messages" ON public.multi_channel_messages
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_integration_configs_updated_at') THEN
    CREATE TRIGGER update_integration_configs_updated_at
      BEFORE UPDATE ON public.integration_configs
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_realtime_channels_updated_at') THEN
    CREATE TRIGGER update_realtime_channels_updated_at
      BEFORE UPDATE ON public.realtime_channels
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_communication_channels_updated_at') THEN
    CREATE TRIGGER update_communication_channels_updated_at
      BEFORE UPDATE ON public.communication_channels
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_multi_channel_messages_updated_at') THEN
    CREATE TRIGGER update_multi_channel_messages_updated_at
      BEFORE UPDATE ON public.multi_channel_messages
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_integration_configs_type ON public.integration_configs(type);
CREATE INDEX IF NOT EXISTS idx_integration_configs_active ON public.integration_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_realtime_channels_name ON public.realtime_channels(channel_name);
CREATE INDEX IF NOT EXISTS idx_realtime_events_channel ON public.realtime_events(channel_id);
CREATE INDEX IF NOT EXISTS idx_realtime_events_created ON public.realtime_events(created_at);
CREATE INDEX IF NOT EXISTS idx_communication_channels_type ON public.communication_channels(type);
CREATE INDEX IF NOT EXISTS idx_multi_channel_messages_status ON public.multi_channel_messages(status);
CREATE INDEX IF NOT EXISTS idx_multi_channel_messages_scheduled ON public.multi_channel_messages(scheduled_for);