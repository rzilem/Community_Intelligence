
import { useState } from 'react';
import { toast } from 'sonner';

export const useResidentImage = () => {
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [propertyImageUrl, setPropertyImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateResidentImage = (newUrl: string) => {
    setAvatarUrl(newUrl);
    toast.success('Profile image updated successfully');
  };
  
  const updatePropertyImage = (newUrl: string) => {
    setPropertyImageUrl(newUrl);
    toast.success('Property image updated successfully');
  };

  return {
    avatarUrl,
    propertyImageUrl,
    isLoading,
    updateResidentImage,
    updatePropertyImage
  };
};
