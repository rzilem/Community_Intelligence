// Mock implementation for vendor application service

import { ServiceResponse } from './mocks/common-types';
import { BaseMockService } from './mocks/base-mock-service';

export interface VendorApplication {
  id: string;
  business_name: string;
  contact_person: string;
  email: string;
  phone: string;
  application_status: string;
  services_offered: string[];
  created_at: string;
  submitted_at: string;
  specialties: string[];
  years_in_business: number;
  license_number: string;
  insurance_provider: string;
  background_check_status: string;
  qualification_score: number;
}

class VendorApplicationService extends BaseMockService {
  private mockVendorApplications: VendorApplication[] = [
    {
      id: 'app-1',
      business_name: 'ABC Landscaping',
      contact_person: 'John Smith',
      email: 'john@abclandscaping.com',
      phone: '555-0123',
      application_status: 'pending',
      services_offered: ['landscaping', 'maintenance'],
      created_at: new Date().toISOString(),
      submitted_at: new Date().toISOString(),
      specialties: ['landscaping', 'maintenance'],
      years_in_business: 5,
      license_number: 'LIC123456',
      insurance_provider: 'State Farm',
      background_check_status: 'completed',
      qualification_score: 85
    },
    {
      id: 'app-2',
      business_name: 'XYZ Plumbing',
      contact_person: 'Jane Doe',
      email: 'jane@xyzplumbing.com', 
      phone: '555-0456',
      application_status: 'approved',
      services_offered: ['plumbing', 'emergency'],
      created_at: new Date().toISOString(),
      submitted_at: new Date().toISOString(),
      specialties: ['plumbing', 'emergency'],
      years_in_business: 8,
      license_number: 'PL789012',
      insurance_provider: 'Allstate',
      background_check_status: 'completed',
      qualification_score: 92
    }
  ];

  async getVendorApplications(): Promise<ServiceResponse<VendorApplication[]>> {
    this.logCall('VendorApplicationService', 'getVendorApplications');
    await this.simulateDelay(200);
    
    return this.createResponse([...this.mockVendorApplications]);
  }

  async getVendorApplicationById(id: string): Promise<ServiceResponse<VendorApplication | null>> {
    this.logCall('VendorApplicationService', 'getVendorApplicationById', { id });
    await this.simulateDelay(200);
    
    const application = this.mockVendorApplications.find(app => app.id === id) || null;
    return this.createResponse(application);
  }

  async createVendorApplication(application: Partial<VendorApplication>): Promise<ServiceResponse<VendorApplication>> {
    this.logCall('VendorApplicationService', 'createVendorApplication', { application });
    await this.simulateDelay(300);
    
    const newApplication: VendorApplication = {
      id: `app-${Date.now()}`,
      business_name: application.business_name || '',
      contact_person: application.contact_person || '',
      email: application.email || '',
      phone: application.phone || '',
      application_status: 'pending',
      services_offered: application.services_offered || [],
      created_at: new Date().toISOString(),
      submitted_at: new Date().toISOString(),
      specialties: application.specialties || [],
      years_in_business: application.years_in_business || 0,
      license_number: application.license_number || '',
      insurance_provider: application.insurance_provider || '',
      background_check_status: application.background_check_status || 'pending',
      qualification_score: application.qualification_score || 0
    };
    
    this.mockVendorApplications.push(newApplication);
    return this.createResponse(newApplication);
  }

  async updateVendorApplicationStatus(id: string, status: string): Promise<ServiceResponse<boolean>> {
    this.logCall('VendorApplicationService', 'updateVendorApplicationStatus', { id, status });
    await this.simulateDelay(200);
    
    const appIndex = this.mockVendorApplications.findIndex(app => app.id === id);
    if (appIndex !== -1) {
      this.mockVendorApplications[appIndex].application_status = status;
      return this.createResponse(true);
    }
    return this.createResponse(false, false, 'Application not found');
  }

  async createApplication(application: Partial<VendorApplication>): Promise<ServiceResponse<VendorApplication>> {
    return this.createVendorApplication(application);
  }

  async updateApplication(id: string, updates: Partial<VendorApplication>): Promise<ServiceResponse<VendorApplication>> {
    this.logCall('VendorApplicationService', 'updateApplication', { id, updates });
    await this.simulateDelay(300);
    
    const appIndex = this.mockVendorApplications.findIndex(app => app.id === id);
    if (appIndex === -1) {
      return this.createResponse(null, false, 'Application not found');
    }

    const updatedApplication = {
      ...this.mockVendorApplications[appIndex],
      ...updates
    };

    this.mockVendorApplications[appIndex] = updatedApplication;
    return this.createResponse(updatedApplication);
  }

  async getApplications(associationId?: string): Promise<VendorApplication[]> {
    const response = await this.getVendorApplications();
    return response.data || [];
  }
}

const vendorApplicationService = new VendorApplicationService();

// Export service instance
export { vendorApplicationService };

// Export individual functions for backward compatibility
export const getVendorApplications = async (): Promise<VendorApplication[]> => {
  const response = await vendorApplicationService.getVendorApplications();
  return response.data!;
};

export const getVendorApplicationById = async (id: string): Promise<VendorApplication | null> => {
  const response = await vendorApplicationService.getVendorApplicationById(id);
  return response.data!;
};

export const createVendorApplication = async (application: Partial<VendorApplication>): Promise<VendorApplication> => {
  const response = await vendorApplicationService.createVendorApplication(application);
  return response.data!;
};

export const updateVendorApplicationStatus = async (id: string, status: string): Promise<boolean> => {
  const response = await vendorApplicationService.updateVendorApplicationStatus(id, status);
  return response.data!;
};