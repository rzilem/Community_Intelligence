
import { supabase } from '@/integrations/supabase/client';
import { VendorContract, VendorContractTemplate, VendorContractAmendment } from '@/types/contract-types';

export const vendorContractService = {
  // Contract Templates
  async getContractTemplates(associationId: string): Promise<VendorContractTemplate[]> {
    const { data, error } = await supabase
      .from('vendor_contract_templates')
      .select('*')
      .eq('association_id', associationId)
      .eq('is_active', true)
      .order('template_name');

    if (error) throw error;
    return data || [];
  },

  async createContractTemplate(template: Partial<VendorContractTemplate>): Promise<VendorContractTemplate> {
    const { data, error } = await supabase
      .from('vendor_contract_templates')
      .insert(template)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateContractTemplate(id: string, updates: Partial<VendorContractTemplate>): Promise<VendorContractTemplate> {
    const { data, error } = await supabase
      .from('vendor_contract_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Vendor Contracts
  async getVendorContracts(vendorId: string): Promise<VendorContract[]> {
    const { data, error } = await supabase
      .from('vendor_contracts')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createVendorContract(contract: Partial<VendorContract>): Promise<VendorContract> {
    // Generate contract number if not provided
    if (!contract.contract_number) {
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      contract.contract_number = `CTR-${timestamp}-${random}`;
    }

    const { data, error } = await supabase
      .from('vendor_contracts')
      .insert(contract)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateVendorContract(id: string, updates: Partial<VendorContract>): Promise<VendorContract> {
    const { data, error } = await supabase
      .from('vendor_contracts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Contract Amendments
  async getContractAmendments(contractId: string): Promise<VendorContractAmendment[]> {
    const { data, error } = await supabase
      .from('vendor_contract_amendments')
      .select('*')
      .eq('contract_id', contractId)
      .order('amendment_number');

    if (error) throw error;
    return data || [];
  },

  async createContractAmendment(amendment: Partial<VendorContractAmendment>): Promise<VendorContractAmendment> {
    // Get next amendment number
    const { data: existingAmendments } = await supabase
      .from('vendor_contract_amendments')
      .select('amendment_number')
      .eq('contract_id', amendment.contract_id)
      .order('amendment_number', { ascending: false })
      .limit(1);

    const nextAmendmentNumber = existingAmendments?.[0]?.amendment_number + 1 || 1;

    const { data, error } = await supabase
      .from('vendor_contract_amendments')
      .insert({ ...amendment, amendment_number: nextAmendmentNumber })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
