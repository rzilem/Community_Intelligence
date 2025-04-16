
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Download, Trash2, AlertCircle, FileText, FilePlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Lead, LeadDocument } from '@/types/lead-types';
import { formatFileSize } from '@/lib/format-utils';
import { formatDate } from '@/lib/date-utils';
import { toast } from 'sonner';

interface LeadDocumentsTabProps {
  lead: Lead;
}

const LeadDocumentsTab: React.FC<LeadDocumentsTabProps> = ({ lead }) => {
  const [documents, setDocuments] = useState<LeadDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, [lead.id]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('lead_documents')
        .select('*')
        .eq('lead_id', lead.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = `${lead.id}/${Date.now()}_${file.name}`;

        // Upload file to Storage
        const { error: uploadError } = await supabase.storage
          .from('lead_documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Create record in lead_documents table
        const { error: insertError } = await supabase.from('lead_documents').insert({
          lead_id: lead.id,
          name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          description: '',
        });

        if (insertError) throw insertError;
      }

      toast.success('Document(s) uploaded successfully');
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      setUploadError('Failed to upload document. Please try again.');
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
      // Reset the file input
      e.target.value = '';
    }
  };

  const handleDownload = async (document: LeadDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('lead_documents')
        .download(document.file_path);

      if (error) throw error;

      // Create URL from the blob and initiate download
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.name;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  const handleDelete = async (documentId: string, filePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('lead_documents')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('lead_documents')
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;

      setDocuments(documents.filter(doc => doc.id !== documentId));
      toast.success('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  // Helper to create a document element and append to body
  const createAndAppendElement = (tagName: string) => {
    const element = document.createElement(tagName);
    document.body.appendChild(element);
    return element;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin mr-2">
          <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <span>Loading documents...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Lead Documents</h3>
        <div className="relative">
          <input
            type="file"
            id="document-upload"
            multiple
            className="absolute inset-0 opacity-0 w-full cursor-pointer"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          <Button className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            {isUploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </div>
      </div>

      {uploadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md flex items-start gap-2">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <p>{uploadError}</p>
        </div>
      )}

      {documents.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed rounded-md">
          <FileText className="h-10 w-10 mx-auto text-gray-400 mb-2" />
          <h3 className="text-lg font-medium">No documents</h3>
          <p className="text-gray-500 mt-1">
            Upload documents related to this lead
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => document.getElementById('document-upload')?.click()}
          >
            <FilePlus className="h-4 w-4 mr-2" />
            Upload your first document
          </Button>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {doc.file_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatFileSize(doc.file_size)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(doc.uploaded_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(doc)}
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-900 hover:bg-red-50"
                        onClick={() => handleDelete(doc.id, doc.file_path)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeadDocumentsTab;
