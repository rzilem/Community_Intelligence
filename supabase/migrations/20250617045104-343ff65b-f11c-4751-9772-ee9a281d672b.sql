
-- Create search indexes for better performance
CREATE INDEX IF NOT EXISTS idx_associations_search ON associations USING GIN(to_tsvector('english', name || ' ' || COALESCE(address, '') || ' ' || COALESCE(city, '')));
CREATE INDEX IF NOT EXISTS idx_homeowner_requests_search ON homeowner_requests USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(tracking_number, '')));
CREATE INDEX IF NOT EXISTS idx_leads_search ON leads USING GIN(to_tsvector('english', COALESCE(first_name, '') || ' ' || COALESCE(last_name, '') || ' ' || COALESCE(email, '') || ' ' || COALESCE(company, '')));
CREATE INDEX IF NOT EXISTS idx_invoices_search ON invoices USING GIN(to_tsvector('english', COALESCE(invoice_number, '') || ' ' || COALESCE(vendor, '') || ' ' || COALESCE(description, '')));

-- Create a unified search view for better performance
CREATE OR REPLACE VIEW global_search_view AS
SELECT 
  id,
  'association' as type,
  name as title,
  COALESCE(address, city) as subtitle,
  '/associations/' || id as path,
  to_tsvector('english', name || ' ' || COALESCE(address, '') || ' ' || COALESCE(city, '')) as search_vector,
  created_at,
  NULL::uuid as association_id
FROM associations
WHERE NOT COALESCE(is_archived, false)

UNION ALL

SELECT 
  id,
  'request' as type,
  COALESCE(title, 'Request #' || RIGHT(id::text, 6)) as title,
  COALESCE(tracking_number, LEFT(description, 50)) as subtitle,
  '/homeowners/requests/' || id as path,
  to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(tracking_number, '')) as search_vector,
  created_at,
  association_id
FROM homeowner_requests

UNION ALL

SELECT 
  id,
  'lead' as type,
  COALESCE(TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')), email, 'Unnamed Lead') as title,
  COALESCE(company, email) as subtitle,
  '/leads/' || id as path,
  to_tsvector('english', COALESCE(first_name, '') || ' ' || COALESCE(last_name, '') || ' ' || COALESCE(email, '') || ' ' || COALESCE(company, '')) as search_vector,
  created_at,
  NULL::uuid as association_id
FROM leads

UNION ALL

SELECT 
  id,
  'invoice' as type,
  COALESCE(invoice_number, 'Invoice #' || RIGHT(id::text, 6)) as title,
  COALESCE(vendor, 'Unknown Vendor') || ' - $' || COALESCE(amount::text, '0') as subtitle,
  '/invoices/' || id as path,
  to_tsvector('english', COALESCE(invoice_number, '') || ' ' || COALESCE(vendor, '') || ' ' || COALESCE(description, '')) as search_vector,
  created_at,
  association_id
FROM invoices;

-- Create function for search with ranking
CREATE OR REPLACE FUNCTION global_search(
  search_query text,
  result_limit integer DEFAULT 20,
  result_offset integer DEFAULT 0,
  search_types text[] DEFAULT ARRAY['association', 'request', 'lead', 'invoice']
)
RETURNS TABLE (
  id uuid,
  type text,
  title text,
  subtitle text,
  path text,
  rank real,
  created_at timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gsv.id,
    gsv.type,
    gsv.title,
    gsv.subtitle,
    gsv.path,
    ts_rank(gsv.search_vector, plainto_tsquery('english', search_query)) as rank,
    gsv.created_at
  FROM global_search_view gsv
  WHERE 
    gsv.search_vector @@ plainto_tsquery('english', search_query)
    AND gsv.type = ANY(search_types)
  ORDER BY 
    ts_rank(gsv.search_vector, plainto_tsquery('english', search_query)) DESC,
    gsv.created_at DESC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
