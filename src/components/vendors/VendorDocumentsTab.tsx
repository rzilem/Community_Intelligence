
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { vendorExtendedService } from "@/services/vendor-extended-service";
import { VendorDocumentFormData } from "@/types/vendor-extended-types";
import { Plus, FileText, Download, Calendar, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface VendorDocumentsTabProps {
  vendorId: string;
}

const VendorDocumentsTab: React.FC<VendorDocumentsTabProps> = ({ vendorId }) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
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
    const data: VendorDocumentFormData = {
      document_name: formData.get('document_name') as string,
      document_type: formData.get('document_type') as any,
      file_url: formData.get('file_url') as string,
      expiry_date: formData.get('expiry_date') as string || undefined,
    };
    createDocumentMutation.mutate(data);
  };

  const getDocumentTypeColor = (type: string) => {
    const colors = {
      insurance: 'bg-blue-100 text-blue-800',
      license: 'bg-green-100 text-green-800',
      contract: 'bg-purple-100 text-purple-800',
      certification: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiry <= thirtyDaysFromNow;
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading documents...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Documents</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Document</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="document_name">Document Name</Label>
                <Input id="document_name" name="document_name" required />
              </div>
              <div>
                <Label htmlFor="document_type">Document Type</Label>
                <Select name="document_type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
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
                <Label htmlFor="file_url">File URL</Label>
                <Input id="file_url" name="file_url" type="url" required />
              </div>
              <div>
                <Label htmlFor="expiry_date">Expiry Date (Optional)</Label>
                <Input id="expiry_date" name="expiry_date" type="date" />
              </div>
              <Button type="submit" disabled={createDocumentMutation.isPending}>
                {createDocumentMutation.isPending ? 'Adding...' : 'Add Document'}
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
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{doc.document_name}</h4>
                      <Badge className={getDocumentTypeColor(doc.document_type)}>
                        {doc.document_type}
                      </Badge>
                      {doc.expiry_date && isExpiringSoon(doc.expiry_date) && (
                        <Badge variant="destructive">Expiring Soon</Badge>
                      )}
                    </div>
                    {doc.expiry_date && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        Expires: {format(new Date(doc.expiry_date), 'MMM dd, yyyy')}
                      </div>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Added on {format(new Date(doc.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => deleteDocumentMutation.mutate(doc.id)}
                      disabled={deleteDocumentMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorDocumentsTab;
