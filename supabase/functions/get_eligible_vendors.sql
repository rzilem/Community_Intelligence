
CREATE OR REPLACE FUNCTION public.get_eligible_vendors(association_id UUID)
RETURNS SETOF jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This is a temporary implementation that returns mock vendors
  -- Later this should be replaced with actual vendors querying
  RETURN QUERY SELECT jsonb_build_object(
    'id', gen_random_uuid(),
    'name', 'Vendor ' || n,
    'include_in_bids', true,
    'association_id', association_id
  )
  FROM generate_series(1, 5) n;
END;
$$;
