
import { useState } from 'react';
import { toast } from 'sonner';

export const useResidentImage = () => {
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  const updateResidentImage = (newUrl: string) => {
    setAvatarUrl(newUrl);
    toast.success('Profile image updated successfully');
  };

  return {
    avatarUrl,
    updateResidentImage
  };
};
