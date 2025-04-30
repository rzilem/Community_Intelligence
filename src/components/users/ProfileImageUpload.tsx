
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserRound, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { updateProfileImage } from '@/services/user/profile-image-service';

interface ProfileImageUploadProps {
  userId: string;
  imageUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  onImageUpdated: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  userId,
  imageUrl,
  firstName,
  lastName,
  onImageUpdated,
  size = 'md'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);
  
  // Reset image state when imageUrl changes
  useEffect(() => {
    setImageLoaded(false);
    setHasImageError(false);
  }, [imageUrl]);
  
  // Get user initials for avatar fallback
  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    } else if (firstName) {
      return firstName[0].toUpperCase();
    }
    return '';
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    setIsUploading(true);
    setImageLoaded(false);
    
    try {
      // Upload the profile image using our service
      const result = await updateProfileImage(userId, file);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      toast.success('Profile image updated successfully');
      onImageUpdated();
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      setHasImageError(true);
    } finally {
      setIsUploading(false);
    }
  };
  
  // Determine avatar size based on prop
  const getAvatarSize = () => {
    switch (size) {
      case 'sm':
        return 'h-8 w-8';
      case 'lg':
        return 'h-24 w-24';
      case 'md':
      default:
        return 'h-10 w-10';
    }
  };

  // Handle image load success
  const handleImageLoad = () => {
    setImageLoaded(true);
    setHasImageError(false);
  };

  // Handle image load error
  const handleImageError = () => {
    console.log('Profile image failed to load:', imageUrl);
    setHasImageError(true);
    setImageLoaded(false);
  };
  
  return (
    <div className="relative group">
      <input 
        type="file" 
        id={`profile-upload-${userId}`} 
        className="hidden" 
        accept="image/*"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      <label htmlFor={`profile-upload-${userId}`} className="cursor-pointer">
        <Avatar className={`${getAvatarSize()} border border-gray-200`}>
          {imageUrl && !hasImageError ? (
            <AvatarImage 
              src={imageUrl} 
              alt="Profile" 
              onLoad={handleImageLoad}
              onError={handleImageError}
              className={imageLoaded ? 'opacity-100' : 'opacity-0'} 
            />
          ) : null}
          <AvatarFallback 
            className={`${getInitials() ? 'bg-primary/10 text-primary' : 'bg-muted'} ${imageUrl && !hasImageError && !imageLoaded ? 'opacity-100' : imageLoaded ? 'opacity-0' : 'opacity-100'}`}
          >
            {getInitials() || <UserRound size={size === 'lg' ? 32 : size === 'sm' ? 16 : 20} />}
          </AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Upload className={`${size === 'lg' ? 'h-6 w-6' : size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} text-white`} />
        </div>
      </label>
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
          <div className={`${size === 'lg' ? 'h-6 w-6 border-2' : size === 'sm' ? 'h-3 w-3 border' : 'h-4 w-4 border-2'} border-t-transparent border-white rounded-full animate-spin`}></div>
        </div>
      )}
    </div>
  );
};

export default ProfileImageUpload;
