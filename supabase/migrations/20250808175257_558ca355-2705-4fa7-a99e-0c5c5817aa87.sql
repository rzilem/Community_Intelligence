BEGIN;
ALTER VIEW public.vendor_performance SET (security_invoker = true);
ALTER VIEW public.bid_request_summary SET (security_invoker = true);
ALTER VIEW public.vendor_learning_progress SET (security_invoker = true);
ALTER VIEW public.global_search_view SET (security_invoker = true);
ALTER VIEW public.ai_processing_stats SET (security_invoker = true);
COMMIT;