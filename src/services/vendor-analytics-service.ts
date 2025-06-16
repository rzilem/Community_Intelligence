
import { supabase } from '@/integrations/supabase/client';
import { VendorPerformanceMetrics, VendorBidAnalytics, VendorAnalyticsData } from '@/types/vendor-advanced-types';

export const vendorAnalyticsService = {
  async getVendorPerformanceMetrics(vendorId: string, period?: string): Promise<VendorPerformanceMetrics[]> {
    let query = supabase
      .from('vendor_performance_metrics')
      .select('*')
      .eq('vendor_id', vendorId);

    if (period) {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - (parseInt(period) * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
      query = query.gte('reporting_period', startDate).lte('reporting_period', endDate);
    }

    const { data, error } = await query.order('reporting_period', { ascending: false });

    if (error) throw error;
    return (data || []) as VendorPerformanceMetrics[];
  },

  async createPerformanceMetric(metric: Omit<VendorPerformanceMetrics, 'id' | 'created_at' | 'updated_at'>): Promise<VendorPerformanceMetrics> {
    const { data, error } = await supabase
      .from('vendor_performance_metrics')
      .insert(metric)
      .select()
      .single();

    if (error) throw error;
    return data as VendorPerformanceMetrics;
  },

  async getVendorBidAnalytics(vendorId: string): Promise<VendorBidAnalytics[]> {
    const { data, error } = await supabase
      .from('vendor_bid_analytics')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as VendorBidAnalytics[];
  },

  async createBidAnalytic(analytic: Omit<VendorBidAnalytics, 'id' | 'created_at'>): Promise<VendorBidAnalytics> {
    const { data, error } = await supabase
      .from('vendor_bid_analytics')
      .insert(analytic)
      .select()
      .single();

    if (error) throw error;
    return data as VendorBidAnalytics;
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
    const { data: performanceData, error: perfError } = await supabase
      .from('vendor_performance_metrics')
      .select(`
        *,
        vendors!inner(name, specialties)
      `)
      .eq('association_id', associationId);

    if (perfError) throw perfError;

    const { data: bidData, error: bidError } = await supabase
      .from('vendor_bid_analytics')
      .select(`
        *,
        vendors!inner(name)
      `)
      .eq('association_id', associationId);

    if (bidError) throw bidError;

    return {
      performance_data: performanceData || [],
      bid_data: bidData || []
    };
  }
};
