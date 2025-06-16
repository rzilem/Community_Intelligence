
import { supabase } from "@/integrations/supabase/client";
import { 
  VendorDocument, 
  VendorCertification, 
  VendorPerformanceMetrics, 
  VendorReview, 
  VendorAvailability, 
  VendorEmergencyContact,
  ExtendedVendor,
  VendorDocumentFormData,
  VendorCertificationFormData,
  VendorReviewFormData,
  VendorEmergencyContactFormData
} from "@/types/vendor-extended-types";

export const vendorExtendedService = {
  // Get vendor with all related data
  getExtendedVendorById: async (id: string): Promise<ExtendedVendor | undefined> => {
    const { data: vendor, error } = await supabase
      .from('vendors')
      .select(`
        *,
        documents:vendor_documents(*),
        certifications:vendor_certifications(*),
        performance_metrics:vendor_performance_metrics(*),
        reviews:vendor_reviews(*, reviewer:profiles(first_name, last_name, email)),
        availability:vendor_availability(*),
        emergency_contacts:vendor_emergency_contacts(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching extended vendor:', error);
      throw error;
    }

    return vendor as ExtendedVendor;
  },

  // Document management
  getVendorDocuments: async (vendorId: string): Promise<VendorDocument[]> => {
    const { data, error } = await supabase
      .from('vendor_documents')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as VendorDocument[];
  },

  createVendorDocument: async (vendorId: string, documentData: VendorDocumentFormData): Promise<VendorDocument> => {
    const { data, error } = await supabase
      .from('vendor_documents')
      .insert({
        vendor_id: vendorId,
        ...documentData,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return data as VendorDocument;
  },

  updateVendorDocument: async (id: string, documentData: Partial<VendorDocumentFormData>): Promise<VendorDocument> => {
    const { data, error } = await supabase
      .from('vendor_documents')
      .update(documentData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as VendorDocument;
  },

  deleteVendorDocument: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('vendor_documents')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Certification management
  getVendorCertifications: async (vendorId: string): Promise<VendorCertification[]> => {
    const { data, error } = await supabase
      .from('vendor_certifications')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('expiry_date', { ascending: true });

    if (error) throw error;
    return (data || []) as VendorCertification[];
  },

  createVendorCertification: async (vendorId: string, certData: VendorCertificationFormData): Promise<VendorCertification> => {
    const { data, error } = await supabase
      .from('vendor_certifications')
      .insert({
        vendor_id: vendorId,
        ...certData
      })
      .select()
      .single();

    if (error) throw error;
    return data as VendorCertification;
  },

  updateVendorCertification: async (id: string, certData: Partial<VendorCertificationFormData>): Promise<VendorCertification> => {
    const { data, error } = await supabase
      .from('vendor_certifications')
      .update(certData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as VendorCertification;
  },

  deleteVendorCertification: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('vendor_certifications')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Review management
  getVendorReviews: async (vendorId: string): Promise<VendorReview[]> => {
    const { data, error } = await supabase
      .from('vendor_reviews')
      .select(`
        *,
        reviewer:profiles(first_name, last_name, email)
      `)
      .eq('vendor_id', vendorId)
      .order('review_date', { ascending: false });

    if (error) throw error;
    return (data || []) as VendorReview[];
  },

  createVendorReview: async (vendorId: string, associationId: string, reviewData: VendorReviewFormData): Promise<VendorReview> => {
    const { data, error } = await supabase
      .from('vendor_reviews')
      .insert({
        vendor_id: vendorId,
        association_id: associationId,
        reviewer_id: (await supabase.auth.getUser()).data.user?.id,
        ...reviewData
      })
      .select(`
        *,
        reviewer:profiles(first_name, last_name, email)
      `)
      .single();

    if (error) throw error;
    return data as VendorReview;
  },

  // Performance metrics
  getVendorPerformanceMetrics: async (vendorId: string, associationId?: string): Promise<VendorPerformanceMetrics[]> => {
    let query = supabase
      .from('vendor_performance_metrics')
      .select('*')
      .eq('vendor_id', vendorId);

    if (associationId) {
      query = query.eq('association_id', associationId);
    }

    const { data, error } = await query.order('period_start', { ascending: false });

    if (error) throw error;
    return (data || []) as VendorPerformanceMetrics[];
  },

  // Emergency contacts
  getVendorEmergencyContacts: async (vendorId: string): Promise<VendorEmergencyContact[]> => {
    const { data, error } = await supabase
      .from('vendor_emergency_contacts')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('is_primary', { ascending: false });

    if (error) throw error;
    return (data || []) as VendorEmergencyContact[];
  },

  createVendorEmergencyContact: async (vendorId: string, contactData: VendorEmergencyContactFormData): Promise<VendorEmergencyContact> => {
    const { data, error } = await supabase
      .from('vendor_emergency_contacts')
      .insert({
        vendor_id: vendorId,
        ...contactData
      })
      .select()
      .single();

    if (error) throw error;
    return data as VendorEmergencyContact;
  },

  updateVendorEmergencyContact: async (id: string, contactData: Partial<VendorEmergencyContactFormData>): Promise<VendorEmergencyContact> => {
    const { data, error } = await supabase
      .from('vendor_emergency_contacts')
      .update(contactData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as VendorEmergencyContact;
  },

  deleteVendorEmergencyContact: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('vendor_emergency_contacts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Availability management
  getVendorAvailability: async (vendorId: string): Promise<VendorAvailability[]> => {
    const { data, error } = await supabase
      .from('vendor_availability')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('day_of_week', { ascending: true });

    if (error) throw error;
    return (data || []) as VendorAvailability[];
  },

  updateVendorAvailability: async (vendorId: string, availability: Omit<VendorAvailability, 'id' | 'vendor_id' | 'created_at' | 'updated_at'>[]): Promise<VendorAvailability[]> => {
    // First, delete existing availability
    await supabase
      .from('vendor_availability')
      .delete()
      .eq('vendor_id', vendorId);

    // Then insert new availability
    const { data, error } = await supabase
      .from('vendor_availability')
      .insert(
        availability.map(av => ({
          vendor_id: vendorId,
          ...av
        }))
      )
      .select();

    if (error) throw error;
    return (data || []) as VendorAvailability[];
  }
};
