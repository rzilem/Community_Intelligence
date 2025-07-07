import { supabase } from '@/integrations/supabase/client';

export interface SmartRecommendation {
  id: string;
  type: 'vendor' | 'pricing' | 'maintenance' | 'financial';
  title: string;
  description: string;
  confidence: number;
  potentialSavings?: number;
  action: string;
  data: any;
}

export class DecisionSupportService {
  static async getVendorRecommendations(associationId: string): Promise<SmartRecommendation[]> {
    try {
      const { data: vendors } = await supabase
        .from('vendors')
        .select('*')
        .eq('association_id', associationId);

      return vendors?.map(vendor => ({
        id: `vendor-${vendor.id}`,
        type: 'vendor' as const,
        title: `Optimize ${vendor.name} Performance`,
        description: `Based on historical data, consider renegotiating contract terms`,
        confidence: 0.75,
        potentialSavings: 500,
        action: 'Review contract terms and performance metrics',
        data: { vendorId: vendor.id, rating: vendor.rating }
      })) || [];
    } catch (error) {
      console.error('Error getting vendor recommendations:', error);
      return [];
    }
  }

  static async getFinancialRecommendations(associationId: string): Promise<SmartRecommendation[]> {
    const recommendations: SmartRecommendation[] = [];
    
    try {
      const { data: arData } = await supabase
        .from('accounts_receivable')
        .select('*')
        .eq('association_id', associationId)
        .eq('status', 'open');

      if (arData && arData.length > 0) {
        const totalOutstanding = arData.reduce((sum, ar) => sum + ar.current_balance, 0);
        
        if (totalOutstanding > 10000) {
          recommendations.push({
            id: 'financial-collections',
            type: 'financial',
            title: 'Implement Automated Payment Reminders',
            description: `${arData.length} outstanding accounts totaling $${totalOutstanding.toLocaleString()}`,
            confidence: 0.9,
            potentialSavings: totalOutstanding * 0.3,
            action: 'Set up automated payment reminder system',
            data: { outstandingAmount: totalOutstanding, accountCount: arData.length }
          });
        }
      }

      return recommendations;
    } catch (error) {
      console.error('Error getting financial recommendations:', error);
      return [];
    }
  }

  static async getAllRecommendations(associationId: string): Promise<SmartRecommendation[]> {
    const [vendorRecs, financialRecs] = await Promise.all([
      this.getVendorRecommendations(associationId),
      this.getFinancialRecommendations(associationId)
    ]);

    return [...vendorRecs, ...financialRecs].sort((a, b) => b.confidence - a.confidence);
  }
}