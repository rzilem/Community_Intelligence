
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, X } from 'lucide-react';
import { updateProfileImage } from '@/services/user-service';
import { toast } from 'sonner';

interface ProfileImageUploadProps {
  currentImageUrl?: string;
  onImageUpdate: (url: string) => Promise<void>;
  userId: string;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  currentImageUrl,
  onImageUpdate,
  userId
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const imageUrl = await updateProfileImage(userId, file);
      await onImageUpdate(imageUrl);
      toast.success('Profile image updated successfully');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Failed to upload image');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const clearPreview = () => {
    setPreviewUrl(null);
  };

  const displayUrl = previewUrl || currentImageUrl;

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={displayUrl} />
          <AvatarFallback>
            <Upload className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>
        
        <div className="space-y-2">
          <Label htmlFor="profile-image" className="text-sm font-medium">
            Profile Image
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              id="profile-image"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('profile-image')?.click()}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Choose Image'}
            </Button>
            
            {previewUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearPreview}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Recommended: Square image, at least 200x200 pixels. Max size: 5MB.
      </p>
    </div>
  );
};

export default ProfileImageUpload;
