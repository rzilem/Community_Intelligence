
-- Create function_logs table for persistent edge function logging
CREATE TABLE IF NOT EXISTS public.function_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT NOT NULL,
  function_name TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index on request_id for quicker lookup
CREATE INDEX IF NOT EXISTS idx_function_logs_request_id ON public.function_logs(request_id);

-- Add index on timestamp for time-based queries
CREATE INDEX IF NOT EXISTS idx_function_logs_timestamp ON public.function_logs(timestamp);

-- Add index on function_name for filtering by function
CREATE INDEX IF NOT EXISTS idx_function_logs_function_name ON public.function_logs(function_name);

-- Enable Row Level Security
ALTER TABLE public.function_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to see logs (restrict to admin role in production)
CREATE POLICY "Allow authenticated users to view logs"
  ON public.function_logs FOR SELECT
  TO authenticated
  USING (true);

-- Allow edge functions to insert logs
CREATE POLICY "Allow insertion of logs"
  ON public.function_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create an automatic cleanup function to prevent the table from growing too large
CREATE OR REPLACE FUNCTION cleanup_old_function_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete logs older than 30 days
  DELETE FROM public.function_logs
  WHERE timestamp < NOW() - INTERVAL '30 days';
END;
$$;

-- Create a scheduled job to clean up logs (runs daily)
SELECT cron.schedule(
  'cleanup-function-logs',
  '0 0 * * *', -- Run at midnight every day
  $$
    SELECT cleanup_old_function_logs();
  $$
);

-- Create function to check for PDF upload issues
CREATE OR REPLACE FUNCTION check_for_upload_issues()
RETURNS TABLE (
  issue_count BIGINT,
  most_recent TIMESTAMPTZ,
  example_error TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as issue_count,
    MAX(timestamp) as most_recent,
    (array_agg(message ORDER BY timestamp DESC))[1] as example_error
  FROM function_logs
  WHERE 
    level = 'error' 
    AND function_name = 'invoice-receiver'
    AND (
      message LIKE '%PDF%' 
      OR message LIKE '%upload%' 
      OR metadata->>'error' LIKE '%PDF%'
      OR metadata->>'error' LIKE '%upload%'
    )
    AND timestamp > NOW() - INTERVAL '24 hours';
END;
$$;
