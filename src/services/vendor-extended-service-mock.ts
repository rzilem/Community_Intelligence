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
  average_rating: number;
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
}

class VendorExtendedService extends BaseMockService {
  private mockDocuments: VendorDocument[] = [];
  private mockCertifications: VendorCertification[] = [];
  private mockPerformanceMetrics: VendorPerformanceMetrics[] = [];
  private mockReviews: VendorReview[] = [];

  async getVendorDocuments(vendorId: string): Promise<ServiceResponse<VendorDocument[]>> {
    this.logCall('VendorExtendedService', 'getVendorDocuments', { vendorId });
    await this.simulateDelay();
    
    const documents = this.mockDocuments.filter(doc => doc.vendor_id === vendorId);
    return this.createResponse(documents);
  }

  async getVendorCertifications(vendorId: string): Promise<ServiceResponse<VendorCertification[]>> {
    this.logCall('VendorExtendedService', 'getVendorCertifications', { vendorId });
    await this.simulateDelay();
    
    const certifications = this.mockCertifications.filter(cert => cert.vendor_id === vendorId);
    return this.createResponse(certifications);
  }

  async getVendorPerformanceMetrics(vendorId: string): Promise<ServiceResponse<VendorPerformanceMetrics[]>> {
    this.logCall('VendorExtendedService', 'getVendorPerformanceMetrics', { vendorId });
    await this.simulateDelay();
    
    const metrics = this.mockPerformanceMetrics.filter(metric => metric.vendor_id === vendorId);
    return this.createResponse(metrics);
  }

  async getVendorReviews(vendorId: string): Promise<ServiceResponse<VendorReview[]>> {
    this.logCall('VendorExtendedService', 'getVendorReviews', { vendorId });
    await this.simulateDelay();
    
    const reviews = this.mockReviews.filter(review => review.vendor_id === vendorId);
    return this.createResponse(reviews);
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

  async getVendorAvailability(vendorId: string): Promise<ServiceResponse<any[]>> {
    return this.createResponse([]);
  }

  async updateVendorAvailability(vendorId: string, data: any): Promise<ServiceResponse<any[]>> {
    return this.createResponse([]);
  }

  async getVendorEmergencyContacts(vendorId: string): Promise<ServiceResponse<any[]>> {
    return this.createResponse([]);
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
  const response = await vendorExtendedService.getVendorDocuments(vendorId);
  return response.data!;
};

export const getVendorCertifications = async (vendorId: string): Promise<VendorCertification[]> => {
  const response = await vendorExtendedService.getVendorCertifications(vendorId);
  return response.data!;
};

export const getVendorPerformanceMetrics = async (vendorId: string): Promise<VendorPerformanceMetrics[]> => {
  const response = await vendorExtendedService.getVendorPerformanceMetrics(vendorId);
  return response.data!;
};

export const getVendorReviews = async (vendorId: string): Promise<VendorReview[]> => {
  const response = await vendorExtendedService.getVendorReviews(vendorId);
  return response.data!;
};