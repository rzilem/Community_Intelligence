// Mock implementation for vendor compliance service

export interface VendorComplianceItem {
  id: string;
  vendor_id: string;
  compliance_type: string;
  item_name: string;
  status: string;
  expiry_date?: string;
  required: boolean;
  renewal_notice_days: number;
}

const mockComplianceItems: VendorComplianceItem[] = [
  {
    id: 'comp-1',
    vendor_id: 'vendor-1',
    compliance_type: 'insurance',
    item_name: 'General Liability Insurance',
    status: 'valid',
    expiry_date: '2025-12-31',
    required: true,
    renewal_notice_days: 30
  },
  {
    id: 'comp-2',
    vendor_id: 'vendor-1',
    compliance_type: 'license',
    item_name: 'Business License',
    status: 'expired',
    expiry_date: '2024-06-15',
    required: true,
    renewal_notice_days: 60
  }
];

export const getVendorCompliance = async (vendorId: string): Promise<VendorComplianceItem[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return mockComplianceItems.filter(item => item.vendor_id === vendorId);
};

export const getComplianceItemById = async (itemId: string): Promise<VendorComplianceItem | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return mockComplianceItems.find(item => item.id === itemId) || null;
};

export const updateComplianceStatus = async (
  itemId: string, 
  status: string, 
  expiryDate?: string
): Promise<boolean> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const itemIndex = mockComplianceItems.findIndex(item => item.id === itemId);
  if (itemIndex !== -1) {
    mockComplianceItems[itemIndex].status = status;
    if (expiryDate) {
      mockComplianceItems[itemIndex].expiry_date = expiryDate;
    }
    return true;
  }
  return false;
};

export const getExpiringCompliance = async (days: number = 30): Promise<VendorComplianceItem[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() + days);
  
  return mockComplianceItems.filter(item => {
    if (!item.expiry_date) return false;
    const expiryDate = new Date(item.expiry_date);
    return expiryDate <= cutoffDate && item.status === 'valid';
  });
};