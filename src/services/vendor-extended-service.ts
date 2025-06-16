
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
    try {
      // First, get the basic vendor information
      const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (vendorError) {
        console.error('Error fetching basic vendor:', vendorError);
        throw vendorError;
      }

      if (!vendor) {
        console.log('No vendor found with id:', id);
        return undefined;
      }

      // Try to get extended data, but don't fail if tables don't exist
      const extendedVendor: ExtendedVendor = { ...vendor, status: vendor.status };

      // Try to get documents
      try {
        const { data: documents } = await supabase
          .from('vendor_documents')
          .select('*')
          .eq('vendor_id', id);
        extendedVendor.documents = (documents || []).map(doc => ({
          ...doc,
          document_type: doc.document_type as VendorDocument['document_type']
        }));
      } catch (error) {
        console.warn('Documents table might not exist:', error);
        extendedVendor.documents = [];
      }

      // Try to get certifications
      try {
        const { data: certifications } = await supabase
          .from('vendor_certifications')
          .select('*')
          .eq('vendor_id', id);
        extendedVendor.certifications = (certifications || []).map(cert => ({
          ...cert,
          status: cert.status as VendorCertification['status']
        }));
      } catch (error) {
        console.warn('Certifications table might not exist:', error);
        extendedVendor.certifications = [];
      }

      // Try to get performance metrics
      try {
        const { data: performanceMetrics } = await supabase
          .from('vendor_performance_metrics')
          .select('*')
          .eq('vendor_id', id);
        extendedVendor.performance_metrics = performanceMetrics || [];
      } catch (error) {
        console.warn('Performance metrics table might not exist:', error);
        extendedVendor.performance_metrics = [];
      }

      // Try to get reviews (without the problematic profiles join)
      try {
        const { data: reviews } = await supabase
          .from('vendor_reviews')
          .select('*')
          .eq('vendor_id', id);
        extendedVendor.reviews = (reviews || []).map(review => ({
          ...review,
          reviewer: undefined // Skip the profiles join for now since the relation doesn't exist
        }));
      } catch (error) {
        console.warn('Reviews table might not exist:', error);
        extendedVendor.reviews = [];
      }

      // Try to get availability
      try {
        const { data: availability } = await supabase
          .from('vendor_availability')
          .select('*')
          .eq('vendor_id', id);
        extendedVendor.availability = availability || [];
      } catch (error) {
        console.warn('Availability table might not exist:', error);
        extendedVendor.availability = [];
      }

      // Try to get emergency contacts
      try {
        const { data: emergencyContacts } = await supabase
          .from('vendor_emergency_contacts')
          .select('*')
          .eq('vendor_id', id);
        extendedVendor.emergency_contacts = (emergencyContacts || []).map(contact => ({
          ...contact,
          relationship: contact.relationship as VendorEmergencyContact['relationship']
        }));
      } catch (error) {
        console.warn('Emergency contacts table might not exist:', error);
        extendedVendor.emergency_contacts = [];
      }

      return extendedVendor as ExtendedVendor;

    } catch (error) {
      console.error('Error in getExtendedVendorById:', error);
      throw error;
    }
  },

  // Document management
  getVendorDocuments: async (vendorId: string): Promise<VendorDocument[]> => {
    try {
      const { data, error } = await supabase
        .from('vendor_documents')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(doc => ({
        ...doc,
        document_type: doc.document_type as VendorDocument['document_type']
      }));
    } catch (error) {
      console.warn('Vendor documents table might not exist:', error);
      return [];
    }
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
    return {
      ...data,
      document_type: data.document_type as VendorDocument['document_type']
    };
  },

  updateVendorDocument: async (id: string, documentData: Partial<VendorDocumentFormData>): Promise<VendorDocument> => {
    const { data, error } = await supabase
      .from('vendor_documents')
      .update(documentData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      document_type: data.document_type as VendorDocument['document_type']
    };
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
    try {
      const { data, error } = await supabase
        .from('vendor_certifications')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('expiry_date', { ascending: true });

      if (error) throw error;
      return (data || []).map(cert => ({
        ...cert,
        status: cert.status as VendorCertification['status']
      }));
    } catch (error) {
      console.warn('Vendor certifications table might not exist:', error);
      return [];
    }
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
    return {
      ...data,
      status: data.status as VendorCertification['status']
    };
  },

  updateVendorCertification: async (id: string, certData: Partial<VendorCertificationFormData>): Promise<VendorCertification> => {
    const { data, error } = await supabase
      .from('vendor_certifications')
      .update(certData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      status: data.status as VendorCertification['status']
    };
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
    try {
      const { data, error } = await supabase
        .from('vendor_reviews')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('review_date', { ascending: false });

      if (error) throw error;
      return (data || []).map(review => ({
        ...review,
        reviewer: undefined // Skip the profiles join for now
      }));
    } catch (error) {
      console.warn('Vendor reviews table might not exist:', error);
      return [];
    }
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
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      reviewer: undefined // Skip the profiles join for now
    };
  },

  // Performance metrics
  getVendorPerformanceMetrics: async (vendorId: string, associationId?: string): Promise<VendorPerformanceMetrics[]> => {
    try {
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
    } catch (error) {
      console.warn('Vendor performance metrics table might not exist:', error);
      return [];
    }
  },

  // Emergency contacts
  getVendorEmergencyContacts: async (vendorId: string): Promise<VendorEmergencyContact[]> => {
    try {
      const { data, error } = await supabase
        .from('vendor_emergency_contacts')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('is_primary', { ascending: false });

      if (error) throw error;
      return (data || []).map(contact => ({
        ...contact,
        relationship: contact.relationship as VendorEmergencyContact['relationship']
      }));
    } catch (error) {
      console.warn('Vendor emergency contacts table might not exist:', error);
      return [];
    }
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
    return {
      ...data,
      relationship: data.relationship as VendorEmergencyContact['relationship']
    };
  },

  updateVendorEmergencyContact: async (id: string, contactData: Partial<VendorEmergencyContactFormData>): Promise<VendorEmergencyContact> => {
    const { data, error } = await supabase
      .from('vendor_emergency_contacts')
      .update(contactData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      relationship: data.relationship as VendorEmergencyContact['relationship']
    };
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
    try {
      const { data, error } = await supabase
        .from('vendor_availability')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('day_of_week', { ascending: true });

      if (error) throw error;
      return (data || []) as VendorAvailability[];
    } catch (error) {
      console.warn('Vendor availability table might not exist:', error);
      return [];
    }
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
