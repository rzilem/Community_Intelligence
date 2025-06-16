
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { vendorExtendedService } from "@/services/vendor-extended-service";
import { VendorDocumentFormData } from "@/types/vendor-extended-types";
import { Plus, FileText, Download, Eye, Edit, Trash2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { FileUploader } from "@/components/ui/file-uploader";

interface VendorDocumentsTabProps {
  vendorId: string;
}

const VendorDocumentsTab: React.FC<VendorDocumentsTabProps> = ({ vendorId }) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['vendor-documents', vendorId],
    queryFn: () => vendorExtendedService.getVendorDocuments(vendorId),
  });

  const createDocumentMutation = useMutation({
    mutationFn: (data: VendorDocumentFormData) => 
      vendorExtendedService.createVendorDocument(vendorId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-documents', vendorId] });
      setIsAddDialogOpen(false);
      setSelectedFile(null);
      toast({ title: "Document added successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error adding document", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const updateDocumentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<VendorDocumentFormData> }) => 
      vendorExtendedService.updateVendorDocument(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-documents', vendorId] });
      setEditingDocument(null);
      toast({ title: "Document updated successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error updating document", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: (id: string) => vendorExtendedService.deleteVendorDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-documents', vendorId] });
      toast({ title: "Document deleted successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error deleting document", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (!selectedFile && !editingDocument) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }

    const data: VendorDocumentFormData = {
      document_name: formData.get('document_name') as string,
      document_type: formData.get('document_type') as any,
      file_url: selectedFile ? URL.createObjectURL(selectedFile) : editingDocument?.file_url,
      expiry_date: formData.get('expiry_date') as string || undefined,
    };

    if (editingDocument) {
      updateDocumentMutation.mutate({ id: editingDocument.id, data });
    } else {
      createDocumentMutation.mutate(data);
    }
  };

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

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading documents...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Documents</h3>
        <Dialog open={isAddDialogOpen || !!editingDocument} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            setEditingDocument(null);
            setSelectedFile(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDocument ? 'Edit Document' : 'Add Document'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="document_name">Document Name</Label>
                <Input 
                  id="document_name" 
                  name="document_name" 
                  defaultValue={editingDocument?.document_name}
                  required 
                />
              </div>
              <div>
                <Label htmlFor="document_type">Document Type</Label>
                <Select name="document_type" defaultValue={editingDocument?.document_type || 'other'} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="license">License</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="certification">Certification</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="expiry_date">Expiry Date (Optional)</Label>
                <Input 
                  id="expiry_date" 
                  name="expiry_date" 
                  type="date"
                  defaultValue={editingDocument?.expiry_date}
                />
              </div>
              {!editingDocument && (
                <div>
                  <Label>File Upload</Label>
                  <FileUploader
                    onFileSelect={setSelectedFile}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    label="Select document file"
                  />
                </div>
              )}
              <Button type="submit" disabled={createDocumentMutation.isPending || updateDocumentMutation.isPending}>
                {createDocumentMutation.isPending || updateDocumentMutation.isPending 
                  ? (editingDocument ? 'Updating...' : 'Adding...') 
                  : (editingDocument ? 'Update Document' : 'Add Document')
                }
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No documents found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {documents.map((document) => {
            const expiryStatus = getExpiryStatus(document.expiry_date);
            return (
              <Card key={document.id}>
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
                        onClick={() => setEditingDocument(document)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => deleteDocumentMutation.mutate(document.id)}
                        disabled={deleteDocumentMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VendorDocumentsTab;
