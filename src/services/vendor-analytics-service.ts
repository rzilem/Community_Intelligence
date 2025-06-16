
import { supabase } from '@/integrations/supabase/client';
import { VendorPerformanceMetrics, VendorBidAnalytics, VendorAnalyticsData } from '@/types/vendor-advanced-types';

export const vendorAnalyticsService = {
  async getVendorPerformanceMetrics(vendorId: string, period?: string): Promise<VendorPerformanceMetrics[]> {
    // For now, return mock data since the tables don't exist yet
    // This would need to be implemented when the actual database tables are created
    console.log('Getting performance metrics for vendor:', vendorId, 'period:', period);
    return [];
  },

  async createPerformanceMetric(metric: Omit<VendorPerformanceMetrics, 'id' | 'created_at' | 'updated_at'>): Promise<VendorPerformanceMetrics> {
    // Mock implementation - would need actual table
    console.log('Creating performance metric:', metric);
    return {
      ...metric,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  },

  async getVendorBidAnalytics(vendorId: string): Promise<VendorBidAnalytics[]> {
    // Get bid analytics from existing bid_request_vendors table
    const { data, error } = await supabase
      .from('bid_request_vendors')
      .select(`
        *,
        bid_requests!inner(
          id,
          association_id,
          title,
          created_at
        )
      `)
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Transform the data to match VendorBidAnalytics interface
    const bidAnalytics: VendorBidAnalytics[] = (data || []).map(item => ({
      id: item.id,
      vendor_id: vendorId,
      bid_request_id: item.bid_request_id,
      association_id: item.bid_requests?.association_id || '',
      bid_amount: item.quote_amount,
      response_time_hours: item.submitted_at ? 
        Math.round((new Date(item.submitted_at).getTime() - new Date(item.created_at).getTime()) / (1000 * 60 * 60)) : 
        undefined,
      was_selected: item.status === 'selected',
      selection_reason: undefined,
      feedback_score: undefined,
      feedback_comments: undefined,
      created_at: item.created_at
    }));

    return bidAnalytics;
  },

  async createBidAnalytic(analytic: Omit<VendorBidAnalytics, 'id' | 'created_at'>): Promise<VendorBidAnalytics> {
    // Mock implementation - would need actual table
    console.log('Creating bid analytic:', analytic);
    return {
      ...analytic,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };
  },

  async getVendorAnalyticsSummary(vendorId: string): Promise<VendorAnalyticsData> {
    const [performanceMetrics, bidAnalytics] = await Promise.all([
      this.getVendorPerformanceMetrics(vendorId),
      this.getVendorBidAnalytics(vendorId)
    ]);

    // Calculate aggregated metrics
    const totalBids = bidAnalytics.length;
    const successfulBids = bidAnalytics.filter(bid => bid.was_selected).length;
    const success_rate = totalBids > 0 ? (successfulBids / totalBids) * 100 : 0;

    const totalRevenue = performanceMetrics.reduce((sum, metric) => sum + metric.total_revenue, 0);
    
    const avgResponseTime = bidAnalytics.reduce((sum, bid) => {
      return sum + (bid.response_time_hours || 0);
    }, 0) / (bidAnalytics.length || 1);

    const avgSatisfaction = performanceMetrics.reduce((sum, metric) => {
      return sum + (metric.customer_satisfaction_score || 0);
    }, 0) / (performanceMetrics.length || 1);

    return {
      performance_metrics: performanceMetrics,
      bid_analytics: bidAnalytics,
      success_rate,
      average_response_time: avgResponseTime,
      total_revenue: totalRevenue,
      customer_satisfaction: avgSatisfaction
    };
  },

  async getAssociationAnalytics(associationId: string) {
    // Get analytics data from existing tables
    const { data: bidData, error: bidError } = await supabase
      .from('bid_request_vendors')
      .select(`
        *,
        vendors!inner(name),
        bid_requests!inner(association_id)
      `)
      .eq('bid_requests.association_id', associationId);

    if (bidError) throw bidError;

    return {
      performance_data: [], // Mock data since table doesn't exist
      bid_data: bidData || []
    };
  }
};
