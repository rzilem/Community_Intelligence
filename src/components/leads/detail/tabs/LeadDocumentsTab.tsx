
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon, FileIcon, ImageIcon, FileTextIcon, FileSpreadsheetIcon, Trash2Icon, DownloadIcon } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Lead, LeadDocument } from '@/types/lead-types';
import { formatFileSize } from '@/lib/format-utils';
import { formatDate } from '@/lib/date-utils';

interface LeadDocumentsTabProps {
  lead?: Lead;
}

const LeadDocumentsTab: React.FC<LeadDocumentsTabProps> = ({ lead }) => {
  const [documents, setDocuments] = useState<LeadDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (lead?.id) {
      fetchDocuments();
    }
  }, [lead?.id]);

  const fetchDocuments = async () => {
    if (!lead?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lead_documents')
        .select('*')
        .eq('lead_id', lead.id)
        .order('uploaded_at', { ascending: false });
        
      if (error) throw error;
      setDocuments(data as LeadDocument[]);
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !lead?.id) {
      return;
    }

    setUploading(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const filePath = `${lead.id}/${Date.now()}_${file.name}`;
        
        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from('lead_documents')
          .upload(filePath, file);
          
        if (uploadError) throw uploadError;
        
        // Get the URL of the uploaded file
        const { data: urlData } = supabase.storage
          .from('lead_documents')
          .getPublicUrl(filePath);
          
        // Store metadata in the database
        const { error: dbError } = await supabase
          .from('lead_documents')
          .insert({
            lead_id: lead.id,
            name: file.name,
            file_path: filePath,
            file_type: file.type,
            file_size: file.size,
            uploaded_by: (await supabase.auth.getUser()).data.user?.id,
          });
          
        if (dbError) throw dbError;
      }
      
      toast.success('Files uploaded successfully');
      fetchDocuments();
    } catch (error: any) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  const handleDownload = async (document: LeadDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('lead_documents')
        .download(document.file_path);
        
      if (error) throw error;
      
      // Create a download link and trigger the download
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      
      // Clean up the URL object
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  const handleDelete = async (document: LeadDocument) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }
    
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('lead_documents')
        .remove([document.file_path]);
        
      if (storageError) throw storageError;
      
      // Delete metadata from database
      const { error: dbError } = await supabase
        .from('lead_documents')
        .delete()
        .eq('id', document.id);
        
      if (dbError) throw dbError;
      
      setDocuments(documents.filter(d => d.id !== document.id));
      toast.success('Document deleted successfully');
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-8 w-8 text-blue-500" />;
    } else if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
      return <FileSpreadsheetIcon className="h-8 w-8 text-green-500" />;
    } else if (fileType.includes('document') || fileType.includes('word')) {
      return <FileTextIcon className="h-8 w-8 text-indigo-500" />;
    } else {
      return <FileIcon className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Documents</h3>
          <div>
            <Button 
              disabled={uploading || !lead?.id} 
              className="relative overflow-hidden"
            >
              {uploading ? 'Uploading...' : (
                <>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Upload Document
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </>
              )}
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-10">
            <div className="animate-pulse text-center space-y-3">
              <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
              <div className="h-4 bg-muted rounded w-2/3 mx-auto"></div>
            </div>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-10 border rounded-md">
            <FileIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No documents have been uploaded for this lead.</p>
            <p className="text-sm text-muted-foreground">Upload documents to keep track of important files.</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {documents.map((document) => (
                <div key={document.id} className="flex items-center border rounded-md p-4">
                  <div className="mr-4">
                    {getFileIcon(document.file_type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium truncate">{document.name}</h4>
                    <div className="flex text-sm text-muted-foreground gap-x-4">
                      <span>{formatFileSize(document.file_size)}</span>
                      <span>Uploaded: {formatDate(document.uploaded_at)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDownload(document)}
                      title="Download"
                    >
                      <DownloadIcon className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(document)}
                      title="Delete"
                    >
                      <Trash2Icon className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default LeadDocumentsTab;
