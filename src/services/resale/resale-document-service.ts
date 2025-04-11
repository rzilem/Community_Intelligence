
import { supabase } from '@/integrations/supabase/client';
import { ResaleDocumentLink, ResalePackage } from '@/types/resale-types';

export const fetchResalePackage = async (id: string): Promise<ResalePackage> => {
  // This is a mock implementation - in a real app, you would fetch from Supabase
  // Mock data for now
  return {
    id,
    association_id: 'assoc-123',
    property_id: 'prop-456',
    requested_by: 'John Smith',
    requested_date: new Date().toISOString(),
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'in_progress',
    total_fee: 300,
    is_rush: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

export const fetchResaleDocumentLinks = async (packageId: string): Promise<ResaleDocumentLink[]> => {
  // In a real implementation, fetch from Supabase with documents joined
  const { data, error } = await supabase
    .from('resale_document_links')
    .select(`
      *,
      document:documents(*)
    `)
    .eq('resale_package_id', packageId);

  if (error) throw error;
  return data || [];
};

export const updateResaleDocumentLinks = async (
  packageId: string,
  links: { documentId: string; isIncluded: boolean }[]
): Promise<void> => {
  // In a real implementation, use Supabase transactions or batch operations
  for (const link of links) {
    // Check if the link already exists
    const { data: existingLink } = await supabase
      .from('resale_document_links')
      .select('*')
      .eq('resale_package_id', packageId)
      .eq('document_id', link.documentId)
      .single();

    if (existingLink) {
      // Update existing link
      await supabase
        .from('resale_document_links')
        .update({ is_included: link.isIncluded })
        .eq('id', existingLink.id);
    } else {
      // Create new link
      await supabase
        .from('resale_document_links')
        .insert({
          resale_package_id: packageId,
          document_id: link.documentId,
          is_included: link.isIncluded,
          document_type: 'other', // Default type
          is_required: false
        });
    }
  }
};
