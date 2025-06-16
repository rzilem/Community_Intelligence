
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Eye, Download, Edit, Trash2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface DocumentCardProps {
  document: any;
  onEdit: (document: any) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ 
  document, 
  onEdit, 
  onDelete, 
  isDeleting 
}) => {
  const getExpiryStatus = (expiryDate?: string) => {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    if (expiry < today) return { status: 'expired', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
    if (expiry <= thirtyDaysFromNow) return { status: 'expiring', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle };
    return { status: 'valid', color: 'bg-green-100 text-green-800', icon: null };
  };

  const getDocumentTypeColor = (type: string) => {
    const colors = {
      insurance: 'bg-blue-100 text-blue-800',
      license: 'bg-purple-100 text-purple-800',
      contract: 'bg-green-100 text-green-800',
      certification: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  const expiryStatus = getExpiryStatus(document.expiry_date);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-gray-400" />
              <h4 className="font-medium">{document.document_name}</h4>
              <Badge className={getDocumentTypeColor(document.document_type)}>
                {document.document_type}
              </Badge>
              {expiryStatus && (
                <Badge className={expiryStatus.color}>
                  {expiryStatus.icon && <expiryStatus.icon className="h-3 w-3 mr-1" />}
                  {expiryStatus.status === 'expired' ? 'Expired' : 
                   expiryStatus.status === 'expiring' ? 'Expiring Soon' : 'Valid'}
                </Badge>
              )}
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              <p>Uploaded: {format(new Date(document.created_at), 'MMM dd, yyyy')}</p>
              {document.expiry_date && (
                <p>Expires: {format(new Date(document.expiry_date), 'MMM dd, yyyy')}</p>
              )}
              {document.file_size && (
                <p>Size: {Math.round(document.file_size / 1024)} KB</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => window.open(document.file_url, '_blank')}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                const link = document.createElement('a');
                link.href = document.file_url;
                link.download = document.document_name;
                link.click();
              }}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onEdit(document)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => onDelete(document.id)}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentCard;
