// Mock implementation for vendor analytics service

export interface VendorAnalytics {
  totalBids: number;
  successfulBids: number;
  successRate: number;
  averageBidAmount: number;
  recentActivity: any[];
}

export const getVendorAnalytics = async (vendorId: string): Promise<VendorAnalytics> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    totalBids: 15,
    successfulBids: 8,
    successRate: 53.3,
    averageBidAmount: 2500.00,
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
};

export const getBidsByAssociation = async (associationId: string): Promise<any[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return [
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
};