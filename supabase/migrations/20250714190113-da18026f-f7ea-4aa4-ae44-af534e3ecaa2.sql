-- Create PWA configurations table
CREATE TABLE public.pwa_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id UUID NOT NULL,
  app_name TEXT NOT NULL,
  app_description TEXT,
  theme_color TEXT DEFAULT '#3b82f6',
  background_color TEXT DEFAULT '#ffffff',
  icon_url TEXT,
  start_url TEXT DEFAULT '/',
  display_mode TEXT DEFAULT 'standalone',
  orientation TEXT DEFAULT 'portrait',
  offline_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  install_prompt_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create push subscriptions table
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  association_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create offline sync queue table
CREATE TABLE public.offline_sync_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  association_id UUID NOT NULL,
  operation_type TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  data JSONB NOT NULL,
  sync_status TEXT DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.pwa_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_sync_queue ENABLE ROW LEVEL SECURITY;

-- PWA configurations policies
CREATE POLICY "Users can view PWA configurations for their associations"
  ON public.pwa_configurations FOR SELECT
  USING (check_user_association(association_id));

CREATE POLICY "Admins can manage PWA configurations"
  ON public.pwa_configurations FOR ALL
  USING (user_has_association_access(association_id, 'admin'));

-- Push subscriptions policies
CREATE POLICY "Users can manage their own push subscriptions"
  ON public.push_subscriptions FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all push subscriptions for their associations"
  ON public.push_subscriptions FOR SELECT
  USING (user_has_association_access(association_id, 'admin'));

-- Offline sync queue policies
CREATE POLICY "Users can manage their own offline sync queue"
  ON public.offline_sync_queue FOR ALL
  USING (user_id = auth.uid());

-- Add indexes for better performance
CREATE INDEX idx_pwa_configurations_association_id ON public.pwa_configurations(association_id);
CREATE INDEX idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX idx_push_subscriptions_association_id ON public.push_subscriptions(association_id);
CREATE INDEX idx_offline_sync_queue_user_id ON public.offline_sync_queue(user_id);
CREATE INDEX idx_offline_sync_queue_sync_status ON public.offline_sync_queue(sync_status);

-- Add triggers for updated_at
CREATE TRIGGER update_pwa_configurations_updated_at
  BEFORE UPDATE ON public.pwa_configurations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_offline_sync_queue_updated_at
  BEFORE UPDATE ON public.offline_sync_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();