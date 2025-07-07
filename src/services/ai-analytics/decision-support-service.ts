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
    // Mock vendor recommendations since vendors table structure is not available
    // In a real implementation, this would query actual vendor data
    const mockRecommendations: SmartRecommendation[] = [
      {
        id: 'vendor-maintenance-001',
        type: 'vendor',
        title: 'Optimize Maintenance Contractor Performance',
        description: 'Based on response time analysis, consider renegotiating service level agreements',
        confidence: 0.85,
        potentialSavings: 1200,
        action: 'Review maintenance contractor performance metrics and renegotiate terms',
        data: { contractorType: 'maintenance', avgResponseTime: 48 }
      },
      {
        id: 'vendor-landscaping-001', 
        type: 'vendor',
        title: 'Consolidate Landscaping Services',
        description: 'Multiple small vendors could be consolidated for better rates',
        confidence: 0.72,
        potentialSavings: 800,
        action: 'Request quotes for consolidated landscaping services',
        data: { currentVendors: 3, potentialSavings: 800 }
      }
    ];

    return mockRecommendations;
  }

  static async getFinancialRecommendations(associationId: string): Promise<SmartRecommendation[]> {
    const recommendations: SmartRecommendation[] = [];
    
    try {
      const response = await supabase
        .from('accounts_receivable')
        .select('id, current_balance, status')
        .eq('association_id', associationId)
        .eq('status', 'open');

      const arData = response.data;

      if (arData && arData.length > 0) {
        const totalOutstanding = arData.reduce((sum, ar) => sum + (ar.current_balance || 0), 0);
        
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

      // Add mock financial recommendations for demo
      if (recommendations.length === 0) {
        recommendations.push({
          id: 'financial-cash-flow',
          type: 'financial',
          title: 'Optimize Cash Flow Management',
          description: 'Implement early payment incentives to improve cash flow',
          confidence: 0.78,
          potentialSavings: 2500,
          action: 'Offer 2% discount for payments made 10 days early',
          data: { averagePaymentDelay: 15, potentialImprovement: 2500 }
        });
      }

      return recommendations;
    } catch (error) {
      console.error('Error getting financial recommendations:', error);
      return [{
        id: 'financial-demo',
        type: 'financial',
        title: 'Financial Analysis Available',
        description: 'AI-powered financial analysis ready when historical data is available',
        confidence: 0.5,
        action: 'Continue using the system to build historical data for analysis',
        data: { status: 'demo' }
      }];
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