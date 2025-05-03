
import React, { useState, useEffect } from 'react';
import { Image, Upload, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePropertyImage } from '@/hooks/homeowners/usePropertyImage';
import { FileUploader } from '@/components/ui/file-uploader';
import { toast } from 'sonner';

interface HomePropertyImageProps {
  address: string;
  propertyId: string;
  customImage?: string;
}

export const HomePropertyImage = ({ address, propertyId, customImage }: HomePropertyImageProps) => {
  const [activeTab, setActiveTab] = useState('streetView');
  const [streetViewUrl, setStreetViewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { imageUrl, isLoading: isImageLoading, uploadPropertyImage } = usePropertyImage(propertyId);

  const placeholderImage = "https://images.unsplash.com/photo-1518005020951-eccb494ad742?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=250&q=80";
  
  useEffect(() => {
    if (activeTab === 'streetView') {
      fetchStreetViewImage();
    }
  }, [activeTab, address]);

  const fetchStreetViewImage = () => {
    setIsLoading(true);
    setError(null);
    
    // In production, this would call a geocoding API + Google Street View API
    // For now, we'll use a placeholder
    setTimeout(() => {
      setStreetViewUrl(placeholderImage);
      setIsLoading(false);
    }, 800);
  };

  const handleFileSelected = (file: File) => {
    if (!file) return;
    
    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('Image must be less than 5MB');
      return;
    }
    
    uploadPropertyImage(file);
  };

  const refreshStreetView = () => {
    fetchStreetViewImage();
  };
  
  return (
    <div className="w-[250px] space-y-2">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="streetView" className="text-xs">Street View</TabsTrigger>
          <TabsTrigger value="uploaded" className="text-xs">Uploaded</TabsTrigger>
        </TabsList>
        
        <TabsContent value="streetView" className="space-y-2">
          <div className="relative h-[250px] w-[250px] bg-muted overflow-hidden rounded-md">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                <p className="text-red-500 text-sm">{error}</p>
                <Button variant="outline" size="sm" onClick={refreshStreetView} className="mt-2">
                  Try Again
                </Button>
              </div>
            ) : streetViewUrl ? (
              <img 
                src={streetViewUrl} 
                alt={`Street view of ${address}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Image className="h-10 w-10 text-muted-foreground/50" />
              </div>
            )}
          </div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground truncate max-w-[150px]">
              {address}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshStreetView}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="uploaded" className="space-y-2">
          <div className="h-[250px] w-[250px] bg-muted overflow-hidden rounded-md flex flex-col items-center justify-center">
            {isImageLoading ? (
              <div className="flex items-center justify-center h-full w-full">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : imageUrl || customImage ? (
              <img 
                src={imageUrl || customImage} 
                alt={`${propertyId} property`} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <Image className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <p className="text-xs text-muted-foreground mb-2">No custom image uploaded</p>
                <FileUploader 
                  onFileSelect={handleFileSelected}
                  accept="image/*"
                  label="Upload Property Image"
                />
              </div>
            )}
          </div>
          {(imageUrl || customImage) && (
            <div className="mt-2">
              <FileUploader 
                onFileSelect={handleFileSelected}
                accept="image/*"
                label="Replace Image"
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
