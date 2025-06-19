
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDocuments } from '@/hooks/documents/useDocuments';
import { Document } from '@/types/document-types';
import { formatBytes, formatDate } from '@/utils/format';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar,
  Folder,
  Tag
} from 'lucide-react';

interface PropertyDocumentsProps {
  propertyId: string;
  associationId: string;
}

const PropertyDocuments: React.FC<PropertyDocumentsProps> = ({
  propertyId,
  associationId
}) => {
  const { documents, isLoading } = useDocuments({
    propertyId,
    associationId,
    enabled: true
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Property Documents
          </CardTitle>
          <CardDescription>Loading documents...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Property Documents
          </CardTitle>
          <CardDescription>Documents related to this property</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No documents found for this property</p>
            <p className="text-sm mt-2">Documents will appear here when uploaded</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleDownload = (document: Document) => {
    if (document.url) {
      window.open(document.url, '_blank');
    }
  };

  const handleView = (document: Document) => {
    if (document.url) {
      window.open(document.url, '_blank');
    }
  };

  const getDocumentIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    return '📁';
  };

  const getDocumentTypeColor = (docType: string) => {
    switch (docType?.toLowerCase()) {
      case 'lease': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'insurance': return 'bg-green-100 text-green-800';  
      case 'legal': return 'bg-red-100 text-red-800';
      case 'financial': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Property Documents
        </CardTitle>
        <CardDescription>
          {documents.length} document{documents.length !== 1 ? 's' : ''} found for this property
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.map((document) => (
            <div
              key={document.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="text-2xl">
                  {getDocumentIcon(document.file_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{document.name}</h4>
                    {document.document_type && (
                      <Badge 
                        variant="secondary" 
                        className={getDocumentTypeColor(document.document_type)}
                      >
                        {document.document_type}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(document.uploaded_at)}
                    </span>
                    <span>{formatBytes(document.file_size)}</span>
                    {document.folder_path && (
                      <span className="flex items-center gap-1 truncate">
                        <Folder className="h-3 w-3" />
                        {document.folder_path}
                      </span>
                    )}
                  </div>
                  
                  {document.description && (
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {document.description}
                    </p>
                  )}
                  
                  {document.tags && document.tags.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <Tag className="h-3 w-3 text-muted-foreground" />
                      <div className="flex gap-1">
                        {document.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {document.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{document.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleView(document)}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(document)}
                  className="h-8 w-8 p-0"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyDocuments;
