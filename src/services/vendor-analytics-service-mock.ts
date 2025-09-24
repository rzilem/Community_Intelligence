// Mock implementation for vendor analytics service

import { ServiceResponse } from './mocks/common-types';
import { BaseMockService } from './mocks/base-mock-service';

export interface VendorAnalytics {
  totalBids: number;
  successfulBids: number;
  successRate: number;
  averageBidAmount: number;
  recentActivity: any[];
  success_rate: number;
  average_response_time: number;
  total_revenue: number;
  customer_satisfaction: number;
  performance_metrics: any[];
  bid_analytics: any[];
}

class VendorAnalyticsService extends BaseMockService {
  async getAnalytics(vendorId?: string): Promise<ServiceResponse<VendorAnalytics>> {
    this.logCall('VendorAnalyticsService', 'getAnalytics', { vendorId });
    await this.simulateDelay(300);
    
    const analytics: VendorAnalytics = {
      totalBids: 15,
      successfulBids: 8,
      successRate: 53.3,
      averageBidAmount: 2500.00,
      success_rate: 53.3,
      average_response_time: 4.5,
      total_revenue: 125000,
      customer_satisfaction: 4.2,
      performance_metrics: [
        {
          id: 'perf-1',
          reporting_period: new Date().toISOString(),
          completed_jobs: 25,
          total_jobs: 30,
          average_rating: 4.3,
          total_revenue: 75000
        }
      ],
      bid_analytics: [
        {
          id: 'bid-1',
          bid_amount: 1800.00,
          response_time_hours: 4,
          was_selected: true,
          feedback_score: 4.5
        },
        {
          id: 'bid-2',
          bid_amount: 3200.00,
          response_time_hours: 6,
          was_selected: false,
          feedback_score: 3.8
        }
      ],
      recentActivity: [
        {
          id: 'bid-1',
          project: 'Landscaping',
          amount: 1800.00,
          status: 'won',
          submittedAt: new Date().toISOString()
        },
        {
          id: 'bid-2', 
          project: 'Pool Maintenance',
          amount: 3200.00,
          status: 'pending',
          submittedAt: new Date().toISOString()
        }
      ]
    };
    
    return this.createResponse(analytics);
  }

  async getVendorAnalyticsSummary(vendorId?: string): Promise<VendorAnalytics> {
    const response = await this.getAnalytics(vendorId);
    return response.data!;
  }

  async getBidsByAssociation(associationId: string): Promise<ServiceResponse<any[]>> {
    this.logCall('VendorAnalyticsService', 'getBidsByAssociation', { associationId });
    await this.simulateDelay(200);
    
    const bids = [
      {
        id: 'bid-1',
        vendorId: 'vendor-1',
        projectType: 'landscaping',
        bidAmount: 1800.00,
        status: 'submitted',
        submittedAt: new Date().toISOString()
      },
      {
        id: 'bid-2',
        vendorId: 'vendor-2', 
        projectType: 'roofing',
        bidAmount: 5500.00,
        status: 'won',
        submittedAt: new Date().toISOString()
      }
    ];
    
    return this.createResponse(bids);
  }
}

const vendorAnalyticsService = new VendorAnalyticsService();

// Export service instance
export { vendorAnalyticsService };

// Export individual functions for backward compatibility
export const getVendorAnalytics = async (vendorId?: string): Promise<VendorAnalytics> => {
  const response = await vendorAnalyticsService.getAnalytics(vendorId);
  return response.data!;
};

export const getBidsByAssociation = async (associationId: string): Promise<any[]> => {
  const response = await vendorAnalyticsService.getBidsByAssociation(associationId);
  return response.data!;
};