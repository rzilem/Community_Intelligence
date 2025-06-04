-- Function to calculate email campaign metrics
CREATE OR REPLACE FUNCTION public.get_campaign_metrics(p_campaign_id UUID)
RETURNS TABLE (
  total_recipients BIGINT,
  sent_count BIGINT,
  open_count BIGINT,
  click_count BIGINT,
  bounce_count BIGINT,
  open_rate NUMERIC,
  click_rate NUMERIC,
  bounce_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) AS total_recipients,
    COUNT(*) FILTER (WHERE status IN ('sent','opened','clicked','bounced')) AS sent_count,
    COUNT(*) FILTER (WHERE opened_date IS NOT NULL) AS open_count,
    COUNT(*) FILTER (WHERE clicked_date IS NOT NULL) AS click_count,
    COUNT(*) FILTER (WHERE status = 'bounced') AS bounce_count,
    COALESCE(ROUND(
      COUNT(*) FILTER (WHERE opened_date IS NOT NULL)::NUMERIC /
      NULLIF(COUNT(*) FILTER (WHERE status IN ('sent','opened','clicked','bounced')),0) * 100, 2), 0) AS open_rate,
    COALESCE(ROUND(
      COUNT(*) FILTER (WHERE clicked_date IS NOT NULL)::NUMERIC /
      NULLIF(COUNT(*) FILTER (WHERE status IN ('sent','opened','clicked','bounced')),0) * 100, 2), 0) AS click_rate,
    COALESCE(ROUND(
      COUNT(*) FILTER (WHERE status = 'bounced')::NUMERIC /
      NULLIF(COUNT(*) FILTER (WHERE status IN ('sent','opened','clicked','bounced')),0) * 100, 2), 0) AS bounce_rate
  FROM campaign_recipients
  WHERE campaign_id = p_campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_campaign_metrics(UUID) TO authenticated;
