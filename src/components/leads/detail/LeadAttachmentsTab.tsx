
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lead } from '@/types/lead-types';
import { FileText, Download, File } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LeadAttachmentsTabProps {
  lead: Lead;
}

const LeadAttachmentsTab: React.FC<LeadAttachmentsTabProps> = ({ lead }) => {
  const hasAttachments = lead.uploaded_files && Array.isArray(lead.uploaded_files) && lead.uploaded_files.length > 0;
  
  const handleDownload = (url: string, filename: string) => {
    const a = window.document.createElement('a');
    a.href = url;
    a.download = filename;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="h-6 w-6 text-red-500" />;
    if (fileType.includes('image')) return <FileText className="h-6 w-6 text-green-500" />;
    if (fileType.includes('word') || fileType.includes('doc')) return <FileText className="h-6 w-6 text-blue-500" />;
    if (fileType.includes('excel') || fileType.includes('sheet')) return <FileText className="h-6 w-6 text-green-700" />;
    return <File className="h-6 w-6 text-gray-500" />;
  };

  return (
    <ScrollArea className="h-[75vh]">
      <div className="space-y-6 p-4">
        <h3 className="font-medium text-lg border-b pb-1 mb-2">Attached Files</h3>
        
        {!hasAttachments ? (
          <div className="text-center py-8 border rounded-md bg-slate-50">
            <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No files attached</h3>
            <p className="text-muted-foreground mt-2">
              This lead doesn't have any attached files yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {(lead.uploaded_files as any[]).map((file, index) => (
              <div 
                key={file.id || index} 
                className="flex items-center justify-between p-3 rounded-md border hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  {getFileIcon(file.type || 'unknown')}
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {file.created_at ? new Date(file.created_at).toLocaleString() : 'Unknown date'} • 
                      {file.size ? `${Math.round(file.size / 1024)} KB` : 'Unknown size'}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDownload(file.url, file.name)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Example file as shown in the screenshot */}
        <div className="flex items-center justify-between p-3 rounded-md border hover:bg-slate-50">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-red-500" />
            <div>
              <p className="font-medium">FPC-RFP-2025.03.26.pdf</p>
              <p className="text-xs text-muted-foreground">
                {new Date().toLocaleString()} • 256 KB
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
};

export default LeadAttachmentsTab;
