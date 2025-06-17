
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload } from 'lucide-react';
import { updateProfileImage } from '@/services/user-service';
import { toast } from 'sonner';

interface CompactProfileImageUploadProps {
  currentImageUrl?: string;
  onImageUpdate: (url: string) => Promise<void>;
  userId: string;
  userInitials: string;
}

const CompactProfileImageUpload: React.FC<CompactProfileImageUploadProps> = ({
  currentImageUrl,
  onImageUpdate,
  userId,
  userInitials
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const imageUrl = await updateProfileImage(userId, file);
      await onImageUpdate(imageUrl);
      toast.success('Profile image updated successfully');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Avatar className="h-8 w-8 cursor-pointer">
        <AvatarImage src={currentImageUrl} />
        <AvatarFallback>{userInitials}</AvatarFallback>
      </Avatar>
      
      {/* Hover overlay */}
      {isHovered && !isUploading && (
        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
          <Camera className="h-3 w-3 text-white" />
        </div>
      )}
      
      {/* Loading overlay */}
      {isUploading && (
        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
          <Upload className="h-3 w-3 text-white animate-pulse" />
        </div>
      )}
      
      {/* Hidden file input */}
      <Input
        id="compact-profile-image"
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={isUploading}
        className="hidden"
      />
      
      {/* Click overlay */}
      <div 
        className="absolute inset-0 cursor-pointer"
        onClick={() => document.getElementById('compact-profile-image')?.click()}
      />
    </div>
  );
};

export default CompactProfileImageUpload;
