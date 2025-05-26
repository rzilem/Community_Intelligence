// Provides AI processing statistics for the dashboard
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { association_id } = req.query;

    if (!association_id) {
      return res.status(400).json({ error: 'Association ID required' });
    }

    console.log('Getting AI stats for association:', association_id);

    // Get AI processing statistics
    const { data: stats } = await supabase
      .from('ai_processing_stats')
      .select('*')
      .eq('association_id', association_id)
      .single();

    // Get recent processing activity
    const { data: recentActivity } = await supabase
      .from('ai_processing_queue')
      .select('*')
      .eq('association_id', association_id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get top vendors by processing volume
    const { data: topVendors } = await supabase
      .from('ai_vendor_patterns')
      .select('vendor_name, frequency_count')
      .eq('association_id', association_id)
      .order('frequency_count', { ascending: false })
      .limit(5);

    // Get recent invoices processed by AI
    const { data: recentInvoices } = await supabase
      .from('invoices')
      .select(`
        id,
        vendor_name,
        invoice_number,
        total_amount,
        ai_confidence_score,
        needs_review,
        ai_processed_at,
        status
      `)
      .eq('association_id', association_id)
      .not('ai_processing_status', 'is', null)
      .order('ai_processed_at', { ascending: false })
      .limit(20);

    // Calculate additional metrics
    const totalProcessed = recentInvoices?.length || 0;
    const highConfidenceCount = recentInvoices?.filter(inv => (inv.ai_confidence_score || 0) >= 0.8).length || 0;
    const needsReviewCount = recentInvoices?.filter(inv => inv.needs_review).length || 0;
    
    const avgConfidence = totalProcessed > 0 
      ? recentInvoices!.reduce((sum, inv) => sum + (inv.ai_confidence_score || 0), 0) / totalProcessed
      : 0;

    const autoApprovalRate = totalProcessed > 0 
      ? ((totalProcessed - needsReviewCount) / totalProcessed * 100)
      : 0;

    // Get processing time trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: processingTrends } = await supabase
      .from('ai_processing_results')
      .select('processing_time_ms, created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    res.status(200).json({
      overview: {
        total_processed: totalProcessed,
        high_confidence: highConfidenceCount,
        needs_review: needsReviewCount,
        avg_confidence: Math.round(avgConfidence * 100) / 100,
        auto_approval_rate: Math.round(autoApprovalRate * 100) / 100
      },
      stats: stats || {
        total_invoices: 0,
        ai_processed: 0,
        needs_review: 0,
        avg_confidence: 0,
        high_confidence: 0,
        low_confidence: 0
      },
      recent_activity: recentActivity || [],
      top_vendors: topVendors || [],
      recent_invoices: recentInvoices || [],
      processing_trends: processingTrends || [],
      performance_metrics: {
        avg_processing_time_ms: processingTrends?.length 
          ? processingTrends.reduce((sum, p) => sum + (p.processing_time_ms || 0), 0) / processingTrends.length
          : 0,
        success_rate: recentActivity?.filter(a => a.status === 'completed').length || 0,
        error_rate: recentActivity?.filter(a => a.status === 'failed').length || 0
      }
    });

  } catch (error) {
    console.error('AI stats error:', error);
    res.status(500).json({ 
      error: 'Failed to get AI statistics',
      details: (error as Error).message 
    });
  }
}
