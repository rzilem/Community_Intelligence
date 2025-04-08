
import React, { useState, useEffect } from 'react';
import { Image, Upload, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

  // For demo purposes, use a placeholder image
  const placeholderImage = "https://images.unsplash.com/photo-1518005020951-eccb494ad742?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80";
  
  // In a real application, you would:
  // 1. Check if a custom uploaded image exists
  // 2. If not, try to fetch from Street View API
  // 3. If that fails, show a placeholder
  
  useEffect(() => {
    if (activeTab === 'streetView') {
      fetchStreetViewImage();
    }
  }, [activeTab, address]);

  const fetchStreetViewImage = () => {
    setIsLoading(true);
    setError(null);
    
    // In a real implementation, you would make an API call to Google Street View API
    // For demonstration, we'll use a timeout to simulate API call and return placeholder
    setTimeout(() => {
      // This simulates an API call to Google Street View
      // In production, you would use something like:
      // const url = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${encodeURIComponent(address)}&key=YOUR_API_KEY`;
      setStreetViewUrl(placeholderImage);
      setIsLoading(false);
    }, 800);
  };

  const handleUploadImage = () => {
    // In a real app, this would trigger a file upload dialog
    alert('In a real application, this would open a file upload dialog');
  };

  const refreshStreetView = () => {
    fetchStreetViewImage();
  };
  
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="streetView">Street View</TabsTrigger>
          <TabsTrigger value="uploaded">Uploaded Image</TabsTrigger>
        </TabsList>
        
        <TabsContent value="streetView" className="space-y-4">
          <div className="relative aspect-video bg-muted overflow-hidden rounded-md">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                <p className="text-red-500">{error}</p>
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
            <p className="text-sm text-muted-foreground">
              {address}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshStreetView}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Note: This is a placeholder image. In a real application, this would use the Google Street View API with your API key.
          </p>
        </TabsContent>
        
        <TabsContent value="uploaded" className="space-y-4">
          <div className="aspect-video bg-muted overflow-hidden rounded-md flex flex-col items-center justify-center">
            {customImage ? (
              <img 
                src={customImage} 
                alt={`${propertyId} property`} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Image className="h-10 w-10 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-4">No custom image has been uploaded yet</p>
                <Button onClick={handleUploadImage}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Property Image
                </Button>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Upload a custom image of this property to replace the street view.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
};
