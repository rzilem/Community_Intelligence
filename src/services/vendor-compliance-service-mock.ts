// Mock implementation for vendor compliance service

import { ServiceResponse } from './mocks/common-types';
import { BaseMockService } from './mocks/base-mock-service';

export interface VendorComplianceItem {
  id: string;
  vendor_id: string;
  compliance_type: string;
  item_name: string;
  status: string;
  expiry_date?: string;
  required: boolean;
  renewal_notice_days: number;
  description: string;
  issue_date: string;
  verified_at: string;
  notes: string;
}

class VendorComplianceService extends BaseMockService {
  private mockComplianceItems: VendorComplianceItem[] = [
    {
      id: 'comp-1',
      vendor_id: 'vendor-1',
      compliance_type: 'insurance',
      item_name: 'General Liability Insurance',
      status: 'valid',
      expiry_date: '2025-12-31',
      required: true,
      renewal_notice_days: 30,
      description: 'General liability insurance coverage',
      issue_date: '2024-01-01',
      verified_at: '2024-01-01',
      notes: 'Valid insurance certificate'
    },
    {
      id: 'comp-2',
      vendor_id: 'vendor-1',
      compliance_type: 'license',
      item_name: 'Business License',
      status: 'expired',
      expiry_date: '2024-06-15',
      required: true,
      renewal_notice_days: 60,
      description: 'Business operating license',
      issue_date: '2023-06-15',
      verified_at: '2023-06-15',
      notes: 'License has expired, needs renewal'
    }
  ];

  async getVendorCompliance(vendorId: string): Promise<VendorComplianceItem[]> {
    this.logCall('VendorComplianceService', 'getVendorCompliance', { vendorId });
    await this.simulateDelay(200);
    
    const items = this.mockComplianceItems.filter(item => item.vendor_id === vendorId);
    return items;
  }

  async getComplianceItemById(itemId: string): Promise<ServiceResponse<VendorComplianceItem | null>> {
    this.logCall('VendorComplianceService', 'getComplianceItemById', { itemId });
    await this.simulateDelay(200);
    
    const item = this.mockComplianceItems.find(item => item.id === itemId) || null;
    return this.createResponse(item);
  }

  async updateComplianceStatus(
    itemId: string, 
    status: string, 
    expiryDate?: string
  ): Promise<ServiceResponse<boolean>> {
    this.logCall('VendorComplianceService', 'updateComplianceStatus', { itemId, status, expiryDate });
    await this.simulateDelay(300);
    
    const itemIndex = this.mockComplianceItems.findIndex(item => item.id === itemId);
    if (itemIndex !== -1) {
      this.mockComplianceItems[itemIndex].status = status;
      if (expiryDate) {
        this.mockComplianceItems[itemIndex].expiry_date = expiryDate;
      }
      return this.createResponse(true);
    }
    return this.createResponse(false, false, 'Compliance item not found');
  }

  async getExpiringCompliance(days: number = 30): Promise<ServiceResponse<VendorComplianceItem[]>> {
    this.logCall('VendorComplianceService', 'getExpiringCompliance', { days });
    await this.simulateDelay(200);
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);
    
    const expiringItems = this.mockComplianceItems.filter(item => {
      if (!item.expiry_date) return false;
      const expiryDate = new Date(item.expiry_date);
      return expiryDate <= cutoffDate && item.status === 'valid';
    });
    
    return this.createResponse(expiringItems);
  }

  async createComplianceItem(item: Omit<VendorComplianceItem, 'id'>): Promise<ServiceResponse<VendorComplianceItem>> {
    this.logCall('VendorComplianceService', 'createComplianceItem', { item });
    await this.simulateDelay(300);
    
    const newItem: VendorComplianceItem = {
      id: `comp-${Date.now()}`,
      ...item
    };
    
    this.mockComplianceItems.push(newItem);
    return this.createResponse(newItem);
  }

  async updateComplianceItem(itemId: string, updates: Partial<VendorComplianceItem>): Promise<ServiceResponse<VendorComplianceItem>> {
    this.logCall('VendorComplianceService', 'updateComplianceItem', { itemId, updates });
    await this.simulateDelay(300);
    
    const itemIndex = this.mockComplianceItems.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      return this.createResponse(null, false, 'Compliance item not found');
    }

    const updatedItem = {
      ...this.mockComplianceItems[itemIndex],
      ...updates
    };

    this.mockComplianceItems[itemIndex] = updatedItem;
    return this.createResponse(updatedItem);
  }

  async deleteComplianceItem(itemId: string): Promise<ServiceResponse<boolean>> {
    this.logCall('VendorComplianceService', 'deleteComplianceItem', { itemId });
    await this.simulateDelay(200);
    
    const itemIndex = this.mockComplianceItems.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      return this.createResponse(false, false, 'Compliance item not found');
    }

    this.mockComplianceItems.splice(itemIndex, 1);
    return this.createResponse(true);
  }
}

const vendorComplianceService = new VendorComplianceService();

// Export service instance
export { vendorComplianceService };

// Export individual functions for backward compatibility
export const getVendorCompliance = async (vendorId: string): Promise<VendorComplianceItem[]> => {
  return await vendorComplianceService.getVendorCompliance(vendorId);
};

export const getComplianceItemById = async (itemId: string): Promise<VendorComplianceItem | null> => {
  const response = await vendorComplianceService.getComplianceItemById(itemId);
  return response.data!;
};

export const updateComplianceStatus = async (
  itemId: string, 
  status: string, 
  expiryDate?: string
): Promise<boolean> => {
  const response = await vendorComplianceService.updateComplianceStatus(itemId, status, expiryDate);
  return response.data!;
};

export const getExpiringCompliance = async (days: number = 30): Promise<VendorComplianceItem[]> => {
  const response = await vendorComplianceService.getExpiringCompliance(days);
  return response.data!;
};