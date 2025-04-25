
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserRound, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileImageUploadProps {
  userId: string;
  imageUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  onImageUpdated: () => void;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  userId,
  imageUrl,
  firstName,
  lastName,
  onImageUpdated
}) => {
  const [isUploading, setIsUploading] = useState(false);
  
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
    
    try {
      // In a real implementation, upload the file to storage
      // For now, we'll simulate a successful upload
      setTimeout(() => {
        toast.success('Profile image updated successfully');
        onImageUpdated();
        setIsUploading(false);
      }, 1000);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      setIsUploading(false);
    }
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
        <Avatar className="h-10 w-10 border border-gray-200">
          {imageUrl ? (
            <AvatarImage src={imageUrl} alt="Profile" />
          ) : null}
          <AvatarFallback className={`${getInitials() ? 'bg-primary/10 text-primary' : 'bg-muted'}`}>
            {getInitials() || <UserRound size={20} />}
          </AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Upload className="h-4 w-4 text-white" />
        </div>
      </label>
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
          <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default ProfileImageUpload;
