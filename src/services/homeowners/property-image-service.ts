
import { supabase } from '@/integrations/supabase/client';

export interface PropertyImageData {
  id: string;
  address?: string;
  image_url?: string;
  unit_number?: string;
}

export class PropertyImageService {
  static async getPropertyImage(propertyId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (error) {
        console.error('Error fetching property:', error);
        return null;
      }

      // Return image_url if it exists, otherwise return null
      return (data as any)?.image_url || null;
    } catch (error) {
      console.error('Property image service error:', error);
      return null;
    }
  }

  static async updatePropertyImage(propertyId: string, imageUrl: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ image_url: imageUrl } as any)
        .eq('id', propertyId);

      if (error) {
        console.error('Error updating property image:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Property image update error:', error);
      return false;
    }
  }

  static generatePlaceholderImage(address?: string): string {
    // Generate a placeholder image URL
    const placeholder = address ? encodeURIComponent(address) : 'property';
    return `https://via.placeholder.com/400x300/e2e8f0/64748b?text=${placeholder}`;
  }
}
