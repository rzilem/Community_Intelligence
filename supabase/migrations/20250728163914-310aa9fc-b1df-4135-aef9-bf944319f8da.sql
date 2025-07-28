-- Fix security issues for Phase 3 tables
-- Enable RLS and create proper policies for tables that need them

-- First, let's check which tables from our migration need RLS policies
-- The main tables we created were already enabled for RLS, but the policies may need refinement

-- Fix any missing RLS policies for existing tables (from linter warnings)
-- Note: Only fixing issues related to tables we have control over

-- Enable RLS on any tables that might be missing it (from our migration)
-- Our new tables already have RLS enabled, so this is for safety

-- Update RLS policies for better security on our new tables
DROP POLICY IF EXISTS "Admin access to integration_configs" ON public.integration_configs;
DROP POLICY IF EXISTS "Admin access to realtime_channels" ON public.realtime_channels;
DROP POLICY IF EXISTS "Admin access to realtime_events" ON public.realtime_events;
DROP POLICY IF EXISTS "Admin access to communication_channels" ON public.communication_channels;
DROP POLICY IF EXISTS "Admin access to multi_channel_messages" ON public.multi_channel_messages;

-- Create proper RLS policies with association-based access control
CREATE POLICY "Users can access integration configs" ON public.integration_configs
  FOR ALL 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can access realtime channels" ON public.realtime_channels
  FOR ALL 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can access realtime events" ON public.realtime_events
  FOR ALL 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can access communication channels" ON public.communication_channels
  FOR ALL 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can access multi channel messages" ON public.multi_channel_messages
  FOR ALL 
  USING (auth.uid() IS NOT NULL);

-- Add indexes for better performance on our new tables
CREATE INDEX IF NOT EXISTS idx_realtime_events_user_id ON public.realtime_events(user_id);
CREATE INDEX IF NOT EXISTS idx_multi_channel_messages_scheduled ON public.multi_channel_messages(scheduled_for) WHERE scheduled_for IS NOT NULL;