import { supabase } from '@/integrations/supabase/client';

export interface PropertyImageData {
  id: string;
  address?: string;
  image_url?: string;
  unit_number?: string;
}

export async function getPropertyImage(propertyId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('image_url')
      .eq('id', propertyId)
      .single();

    if (error) {
      console.error('Error fetching property:', error);
      return null;
    }

    return (data as any)?.image_url || null;
  } catch (err) {
    console.error('Property image service error:', err);
    return null;
  }
}

export async function updatePropertyImage(
  propertyId: string,
  file: File
): Promise<{ url?: string; error?: string }> {
  try {
    const filePath = `property-images/${propertyId}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading property image:', uploadError);
      return { error: uploadError.message };
    }

    const { data: publicUrlData } = await supabase.storage
      .from('property-images')
      .getPublicUrl(uploadData.path);

    const imageUrl = publicUrlData.publicUrl;

    const { error: updateError } = await supabase
      .from('properties')
      .update({ image_url: imageUrl } as any)
      .eq('id', propertyId);

    if (updateError) {
      console.error('Error updating property image URL:', updateError);
      return { error: updateError.message };
    }

    return { url: imageUrl };
  } catch (err: any) {
    console.error('Property image update error:', err);
    return { error: err.message };
  }
}

export function generatePlaceholderImage(address?: string): string {
  const placeholder = address ? encodeURIComponent(address) : 'property';
  return `https://via.placeholder.com/400x300/e2e8f0/64748b?text=${placeholder}`;
}
