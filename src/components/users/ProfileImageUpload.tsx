
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";
import { updateProfileImage } from '@/services/user-service';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileImageUploadProps {
  userId: string;
  imageUrl: string | null;
  firstName?: string | null;
  lastName?: string | null;
  onImageUpdated: (newUrl: string) => void;
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
  const { refreshProfile } = useAuth();
  
  // Determine avatar size based on prop
  const avatarSize = {
    'sm': 'h-10 w-10',
    'md': 'h-16 w-16',
    'lg': 'h-24 w-24'
  }[size];
  
  // Get user initials for the avatar fallback
  const getUserInitials = (): string => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    } else if (firstName) {
      return firstName[0].toUpperCase();
    } else {
      return 'U';
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Use the service function to handle the upload
      const result = await updateProfileImage(userId, file);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (result.url) {
        toast.success('Profile image uploaded successfully');
        onImageUpdated(result.url);
        
        // Refresh the profile in the auth context to update the image across the app
        await refreshProfile();
      }
      
    } catch (error: any) {
      toast.error(`Error uploading image: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative inline-block group">
      <Avatar className={`${avatarSize} relative ${isUploading ? 'opacity-50' : ''}`}>
        <AvatarImage src={imageUrl || undefined} alt="Profile" key={imageUrl || 'profile'} />
        <AvatarFallback>{getUserInitials()}</AvatarFallback>
        
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          </div>
        )}
      </Avatar>
      
      <label 
        htmlFor={`profile-upload-${userId}`} 
        className="absolute inset-0 flex items-center justify-center rounded-full cursor-pointer bg-black/0 group-hover:bg-black/30 transition-all"
      >
        <Camera className="h-5 w-5 text-transparent group-hover:text-white transition-all" />
      </label>
      
      <input
        id={`profile-upload-${userId}`}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="sr-only"
      />
    </div>
  );
};

export default ProfileImageUpload;
