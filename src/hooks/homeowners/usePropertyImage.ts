
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  updatePropertyImage, 
  getPropertyImage 
} from '@/services/homeowners/property-image-service';

export const usePropertyImage = (propertyId: string) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPropertyImage = async () => {
      if (!propertyId) return;
      
      setIsLoading(true);
      try {
        const url = await getPropertyImage(propertyId);
        setImageUrl(url);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching property image:', err);
        setError('Failed to load property image');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPropertyImage();
  }, [propertyId]);

  const uploadPropertyImage = async (file: File) => {
    if (!propertyId) {
      toast.error('Missing property ID for image upload');
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await updatePropertyImage(propertyId, file);
      
      if (result.error) {
        toast.error(`Failed to upload property image: ${result.error}`);
        setError(result.error);
        return;
      }
      
      if (result.url) {
        setImageUrl(result.url);
        toast.success('Property image uploaded successfully');
      }
    } catch (err: any) {
      console.error('Error uploading property image:', err);
      toast.error('Failed to upload property image');
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    imageUrl,
    isLoading,
    error,
    uploadPropertyImage
  };
};
