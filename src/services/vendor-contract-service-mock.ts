// Mock implementation for vendor contract service

import { ServiceResponse } from './mocks/common-types';
import { BaseMockService } from './mocks/base-mock-service';

export interface VendorContractTemplate {
  id: string;
  association_id: string;
  template_name: string;
  template_type: string;
  contract_terms: string;
  default_duration_months: number;
  auto_renewal: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VendorContract {
  id: string;
  vendor_id: string;
  association_id: string;
  contract_number: string;
  contract_type: string;
  start_date: string;
  end_date: string;
  contract_value: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface VendorContractAmendment {
  id: string;
  contract_id: string;
  amendment_number: number;
  amendment_type: string;
  description: string;
  effective_date: string;
  created_at: string;
}

class VendorContractService extends BaseMockService {
  private mockTemplates: VendorContractTemplate[] = [
    {
      id: 'template-1',
      association_id: 'assoc-1',
      template_name: 'Standard Landscaping Contract',
      template_type: 'service',
      contract_terms: 'Standard terms and conditions for landscaping services',
      default_duration_months: 12,
      auto_renewal: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  private mockContracts: VendorContract[] = [
    {
      id: 'contract-1',
      vendor_id: 'vendor-1',
      association_id: 'assoc-1',
      contract_number: 'CTR-20241224-001',
      contract_type: 'landscaping',
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      contract_value: 25000,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  private mockAmendments: VendorContractAmendment[] = [];

  async getContractTemplates(associationId: string): Promise<ServiceResponse<VendorContractTemplate[]>> {
    this.logCall('VendorContractService', 'getContractTemplates', { associationId });
    await this.simulateDelay();

    const templates = this.mockTemplates.filter(
      t => t.association_id === associationId && t.is_active
    );
    return this.createResponse(templates);
  }

  async createContractTemplate(template: Omit<VendorContractTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceResponse<VendorContractTemplate>> {
    this.logCall('VendorContractService', 'createContractTemplate', { template });
    await this.simulateDelay();

    const newTemplate: VendorContractTemplate = {
      id: `template-${Date.now()}`,
      ...template,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.mockTemplates.push(newTemplate);
    return this.createResponse(newTemplate);
  }

  async updateContractTemplate(id: string, updates: Partial<Omit<VendorContractTemplate, 'id' | 'created_at' | 'updated_at'>>): Promise<ServiceResponse<VendorContractTemplate>> {
    this.logCall('VendorContractService', 'updateContractTemplate', { id, updates });
    await this.simulateDelay();

    const templateIndex = this.mockTemplates.findIndex(t => t.id === id);
    if (templateIndex === -1) {
      return this.createResponse(null, false, 'Template not found');
    }

    const updatedTemplate = {
      ...this.mockTemplates[templateIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    this.mockTemplates[templateIndex] = updatedTemplate;
    return this.createResponse(updatedTemplate);
  }

  async getVendorContracts(vendorId: string): Promise<ServiceResponse<VendorContract[]>> {
    this.logCall('VendorContractService', 'getVendorContracts', { vendorId });
    await this.simulateDelay();

    const contracts = this.mockContracts.filter(c => c.vendor_id === vendorId);
    return this.createResponse(contracts);
  }

  async createVendorContract(contract: Omit<VendorContract, 'id' | 'created_at' | 'updated_at' | 'contract_number'>): Promise<ServiceResponse<VendorContract>> {
    this.logCall('VendorContractService', 'createVendorContract', { contract });
    await this.simulateDelay();

    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const contract_number = `CTR-${timestamp}-${random}`;

    const newContract: VendorContract = {
      id: `contract-${Date.now()}`,
      contract_number,
      ...contract,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.mockContracts.push(newContract);
    return this.createResponse(newContract);
  }

  async updateVendorContract(id: string, updates: Partial<Omit<VendorContract, 'id' | 'created_at' | 'updated_at'>>): Promise<ServiceResponse<VendorContract>> {
    this.logCall('VendorContractService', 'updateVendorContract', { id, updates });
    await this.simulateDelay();

    const contractIndex = this.mockContracts.findIndex(c => c.id === id);
    if (contractIndex === -1) {
      return this.createResponse(null, false, 'Contract not found');
    }

    const updatedContract = {
      ...this.mockContracts[contractIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    this.mockContracts[contractIndex] = updatedContract;
    return this.createResponse(updatedContract);
  }

  async getContractAmendments(contractId: string): Promise<ServiceResponse<VendorContractAmendment[]>> {
    this.logCall('VendorContractService', 'getContractAmendments', { contractId });
    await this.simulateDelay();

    const amendments = this.mockAmendments.filter(a => a.contract_id === contractId);
    return this.createResponse(amendments);
  }

  async createContractAmendment(amendment: Omit<VendorContractAmendment, 'id' | 'created_at' | 'amendment_number'>): Promise<ServiceResponse<VendorContractAmendment>> {
    this.logCall('VendorContractService', 'createContractAmendment', { amendment });
    await this.simulateDelay();

    const existingAmendments = this.mockAmendments.filter(a => a.contract_id === amendment.contract_id);
    const nextAmendmentNumber = existingAmendments.length + 1;

    const newAmendment: VendorContractAmendment = {
      id: `amendment-${Date.now()}`,
      amendment_number: nextAmendmentNumber,
      ...amendment,
      created_at: new Date().toISOString()
    };

    this.mockAmendments.push(newAmendment);
    return this.createResponse(newAmendment);
  }
}

const vendorContractService = new VendorContractService();

// Export as service object matching the original structure
export { vendorContractService };