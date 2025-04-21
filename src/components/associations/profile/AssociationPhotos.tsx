
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Code, X, PlusCircle, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ApiError from '@/components/ui/api-error';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface AssociationPhotosProps {
  associationId: string;
}

export const AssociationPhotos: React.FC<AssociationPhotosProps> = ({ associationId }) => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const queryClient = useQueryClient();
  
  // Fetch association photos
  const { data: photos, isLoading, error, refetch } = useQuery({
    queryKey: ['association-photos', associationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('association_id', associationId)
        .eq('category', 'photo')
        .order('uploaded_date', { ascending: false });
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!associationId
  });
  
  // Handle photo upload
  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      setUploading(true);
      const uploads = [];
      
      try {
        for (const file of files) {
          // 1. Upload file to storage
          const fileName = `${Date.now()}-${file.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('association-photos')
            .upload(`${associationId}/${fileName}`, file);
            
          if (uploadError) throw uploadError;
          
          // 2. Get public URL
          const { data: urlData } = await supabase.storage
            .from('association-photos')
            .getPublicUrl(`${associationId}/${fileName}`);
            
          // 3. Insert document record
          const { data, error: insertError } = await supabase
            .from('documents')
            .insert({
              association_id: associationId,
              name: file.name,
              url: urlData.publicUrl,
              file_type: file.type,
              category: 'photo',
              file_size: file.size,
              uploaded_by: (await supabase.auth.getUser()).data.user?.id,
              is_public: true
            })
            .select()
            .single();
            
          if (insertError) throw insertError;
          uploads.push(data);
        }
        
        return uploads;
      } finally {
        setUploading(false);
      }
    },
    onSuccess: () => {
      toast.success('Photos uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['association-photos', associationId] });
      setFiles([]);
      setIsUploadOpen(false);
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast.error('Failed to upload photos');
    }
  });
  
  // Handle photo deletion
  const deleteMutation = useMutation({
    mutationFn: async (photoId: string) => {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', photoId);
        
      if (error) throw error;
      return photoId;
    },
    onSuccess: () => {
      toast.success('Photo deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['association-photos', associationId] });
    },
    onError: () => {
      toast.error('Failed to delete photo');
    }
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length > 0) {
      uploadMutation.mutate(files);
    }
  };
  
  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Association Photos & 3D Views
          </h3>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => refetch()}
            >
              View Photos
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setIsUploadOpen(true)}
            >
              Manage Photos
            </Button>
          </div>
        </div>
        
        {error && (
          <ApiError 
            error={error as Error} 
            onRetry={() => refetch()} 
            title="Failed to load photos" 
          />
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="flex gap-4 overflow-x-auto pb-4">
              <Button 
                className="flex items-center gap-2"
                onClick={() => setIsUploadOpen(true)}
              >
                <Upload className="h-4 w-4" />
                Upload Photo
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Add 3D Embed
              </Button>
            </div>
            
            {photos && photos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group rounded-md overflow-hidden border">
                    <img 
                      src={photo.url} 
                      alt={photo.name} 
                      className="w-full h-32 object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteMutation.mutate(photo.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="p-2 text-xs truncate">{photo.name}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border rounded-md bg-muted/20">
                <div className="mb-2">No photos uploaded</div>
                <Button 
                  variant="outline" 
                  onClick={() => setIsUploadOpen(true)}
                  className="flex items-center gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Your First Photo
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
      
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Association Photos</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border-2 border-dashed rounded-md p-6 bg-muted/20">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Select JPG, PNG, or GIF images (max 5MB each)
              </p>
            </div>
            
            {files.length > 0 && (
              <div className="text-sm">
                <p>{files.length} file(s) selected</p>
                <ul className="mt-2 space-y-1">
                  {Array.from(files).map((file, index) => (
                    <li key={index} className="text-xs">
                      {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsUploadOpen(false)}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={files.length === 0 || uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : 'Upload Photos'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
