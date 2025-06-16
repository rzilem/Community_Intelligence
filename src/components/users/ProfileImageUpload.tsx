
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, Upload } from 'lucide-react';
import { validateFile, sanitizeFilename, ALLOWED_FILE_TYPES } from '@/utils/security-validation';
import { toast } from 'sonner';
import { updateProfileImage } from '@/services/user-service';

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
  const [uploading, setUploading] = useState(false);

  const getInitials = () => {
    const first = firstName?.charAt(0).toUpperCase() || '';
    const last = lastName?.charAt(0).toUpperCase() || '';
    return `${first}${last}` || '?';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-8 w-8 text-xs';
      case 'lg':
        return 'h-16 w-16 text-lg';
      default:
        return 'h-10 w-10 text-sm';
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateFile(file, ALLOWED_FILE_TYPES.images);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setUploading(true);

    try {
      // Sanitize filename
      const sanitizedName = sanitizeFilename(file.name);
      
      // Create a new file with sanitized name
      const sanitizedFile = new File([file], sanitizedName, { type: file.type });

      await updateProfileImage(userId, sanitizedFile);
      toast.success('Profile image updated successfully');
      onImageUpdated();
    } catch (error: any) {
      console.error('Error uploading profile image:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  return (
    <div className="relative group">
      <Avatar className={getSizeClasses()}>
        <AvatarImage src={imageUrl || undefined} alt={`${firstName} ${lastName}`} />
        <AvatarFallback>{getInitials()}</AvatarFallback>
      </Avatar>
      
      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
        <label htmlFor={`profile-upload-${userId}`} className="cursor-pointer">
          <Camera className="h-4 w-4 text-white" />
          <span className="sr-only">Upload profile image</span>
        </label>
      </div>
      
      <Input
        id={`profile-upload-${userId}`}
        type="file"
        accept={ALLOWED_FILE_TYPES.images.join(',')}
        onChange={handleFileSelect}
        disabled={uploading}
        className="hidden"
      />
      
      {uploading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
};

export default ProfileImageUpload;
