// Mock implementation for vendor extended service

import { ServiceResponse } from './mocks/common-types';
import { BaseMockService } from './mocks/base-mock-service';

export interface VendorDocument {
  id: string;
  vendor_id: string;
  document_name: string;
  document_type: string;
  file_url: string;
  file_type: string;
  file_path: string;
  size: number;
  expiration_date?: string;
  is_insurance: boolean;
  uploaded_by: string;
  uploaded_at: string;
  created_at: string;
  updated_at: string;
}

export interface VendorCertification {
  id: string;
  vendor_id: string;
  certification_name: string;
  issuing_authority: string;
  certification_number: string;
  issue_date: string;
  expiry_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface VendorPerformanceMetrics {
  id: string;
  vendor_id: string;
  period_start: string;
  period_end: string;
  total_jobs: number;
  completed_jobs: number;
  cancelled_jobs: number;
  average_rating: number;
  average_completion_days: number;
  customer_satisfaction_score: number;
  on_time_completion_rate: number;
  quality_score: number;
  budget_adherence_rate: number;
  created_at: string;
  updated_at: string;
}

export interface VendorReview {
  id: string;
  vendor_id: string;
  reviewer_name: string;
  rating: number;
  review_text: string;
  review_date: string;
  created_at: string;
  updated_at: string;
  reviewer: string;
  is_verified: boolean;
  job_reference: string;
}

class VendorExtendedService extends BaseMockService {
  private mockDocuments: VendorDocument[] = [];
  private mockCertifications: VendorCertification[] = [];
  private mockPerformanceMetrics: VendorPerformanceMetrics[] = [];
  private mockReviews: VendorReview[] = [];

  // Backward Compatible Methods (return raw data)
  async getVendorDocuments(vendorId: string): Promise<VendorDocument[]> {
    this.logCall('VendorExtendedService', 'getVendorDocuments', { vendorId });
    await this.simulateDelay();
    
    const documents = this.mockDocuments.filter(doc => doc.vendor_id === vendorId);
    return documents;
  }

  async getVendorCertifications(vendorId: string): Promise<VendorCertification[]> {
    this.logCall('VendorExtendedService', 'getVendorCertifications', { vendorId });
    await this.simulateDelay();
    
    const certifications = this.mockCertifications.filter(cert => cert.vendor_id === vendorId);
    return certifications;
  }

  async getVendorPerformanceMetrics(vendorId: string, associationId?: string): Promise<VendorPerformanceMetrics[]> {
    this.logCall('VendorExtendedService', 'getVendorPerformanceMetrics', { vendorId, associationId });
    await this.simulateDelay();
    
    const metrics = this.mockPerformanceMetrics.filter(metric => metric.vendor_id === vendorId);
    return metrics;
  }

  async getVendorReviews(vendorId: string): Promise<VendorReview[]> {
    this.logCall('VendorExtendedService', 'getVendorReviews', { vendorId });
    await this.simulateDelay();
    
    const reviews = this.mockReviews.filter(review => review.vendor_id === vendorId);
    return reviews;
  }

  async uploadVendorDocument(vendorId: string, file: File, documentType: string): Promise<ServiceResponse<VendorDocument>> {
    this.logCall('VendorExtendedService', 'uploadVendorDocument', { vendorId, documentType });
    await this.simulateDelay(500);
    
    const newDocument: VendorDocument = {
      id: `doc-${Date.now()}`,
      vendor_id: vendorId,
      document_name: file.name,
      document_type: documentType,
      file_url: URL.createObjectURL(file),
      file_type: file.type,
      file_path: `/vendor-documents/${vendorId}/${file.name}`,
      size: file.size,
      is_insurance: documentType === 'insurance',
      uploaded_by: 'current-user',
      uploaded_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    this.mockDocuments.push(newDocument);
    return this.createResponse(newDocument);
  }

  async deleteVendorDocument(documentId: string): Promise<ServiceResponse<boolean>> {
    this.logCall('VendorExtendedService', 'deleteVendorDocument', { documentId });
    await this.simulateDelay();
    
    const docIndex = this.mockDocuments.findIndex(doc => doc.id === documentId);
    if (docIndex === -1) {
      return this.createResponse(false, false, 'Document not found');
    }
    
    this.mockDocuments.splice(docIndex, 1);
    return this.createResponse(true);
  }

  // Additional required methods for components
  async getExtendedVendorById(id: string): Promise<any> {
    return { id, documents: [], certifications: [], reviews: [], performance_metrics: [] };
  }

  async createVendorDocument(vendorId: string, data: any): Promise<ServiceResponse<VendorDocument>> {
    return this.uploadVendorDocument(vendorId, data, data.document_type);
  }

  async updateVendorDocument(id: string, data: any): Promise<ServiceResponse<VendorDocument>> {
    return this.createResponse({ id, ...data } as VendorDocument);
  }

  async createVendorCertification(vendorId: string, data: any): Promise<ServiceResponse<VendorCertification>> {
    return this.createResponse({ id: `cert-${Date.now()}`, vendor_id: vendorId, ...data } as VendorCertification);
  }

  async updateVendorCertification(id: string, data: any): Promise<ServiceResponse<VendorCertification>> {
    return this.createResponse({ id, ...data } as VendorCertification);
  }

  async deleteVendorCertification(id: string): Promise<ServiceResponse<boolean>> {
    return this.createResponse(true);
  }

  // Service Response Methods (return ServiceResponse)
  async getVendorAvailabilityWithResponse(vendorId: string): Promise<ServiceResponse<any[]>> {
    return this.createResponse([]);
  }

  async updateVendorAvailabilityWithResponse(vendorId: string, data: any): Promise<ServiceResponse<any[]>> {
    return this.createResponse([]);
  }

  // Backward Compatible Methods (return raw data)
  async getVendorAvailability(vendorId: string): Promise<any[]> {
    const response = await this.getVendorAvailabilityWithResponse(vendorId);
    return response.data || [];
  }

  async updateVendorAvailability(vendorId: string, data: any): Promise<any[]> {
    const response = await this.updateVendorAvailabilityWithResponse(vendorId, data);
    return response.data || [];
  }

  async getVendorEmergencyContacts(vendorId: string): Promise<any[]> {
    return [];
  }

  async createVendorEmergencyContact(vendorId: string, data: any): Promise<ServiceResponse<any>> {
    return this.createResponse({ id: `contact-${Date.now()}`, vendor_id: vendorId, ...data });
  }

  async updateVendorEmergencyContact(id: string, data: any): Promise<ServiceResponse<any>> {
    return this.createResponse({ id, ...data });
  }

  async deleteVendorEmergencyContact(id: string): Promise<ServiceResponse<boolean>> {
    return this.createResponse(true);
  }

  async createVendorReview(vendorId: string, associationId: string, data: any): Promise<ServiceResponse<VendorReview>> {
    return this.createResponse({ id: `review-${Date.now()}`, vendor_id: vendorId, ...data } as VendorReview);
  }
}

const vendorExtendedService = new VendorExtendedService();

// Export service instance
export { vendorExtendedService };

// Export individual functions for backward compatibility
export const getVendorDocuments = async (vendorId: string): Promise<VendorDocument[]> => {
  return await vendorExtendedService.getVendorDocuments(vendorId);
};

export const getVendorCertifications = async (vendorId: string): Promise<VendorCertification[]> => {
  return await vendorExtendedService.getVendorCertifications(vendorId);
};

export const getVendorPerformanceMetrics = async (vendorId: string, associationId?: string): Promise<VendorPerformanceMetrics[]> => {
  return await vendorExtendedService.getVendorPerformanceMetrics(vendorId, associationId);
};

export const getVendorReviews = async (vendorId: string): Promise<VendorReview[]> => {
  return await vendorExtendedService.getVendorReviews(vendorId);
};

export const getVendorEmergencyContacts = async (vendorId: string): Promise<any[]> => {
  return await vendorExtendedService.getVendorEmergencyContacts(vendorId);
};

export const getVendorAvailability = async (vendorId: string): Promise<any[]> => {
  return await vendorExtendedService.getVendorAvailability(vendorId);
};