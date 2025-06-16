
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { vendorExtendedService } from "@/services/vendor-extended-service";
import { VendorDocumentFormData } from "@/types/vendor-extended-types";
import { Plus, FileText } from "lucide-react";
import DocumentUploadDialog from "./documents/DocumentUploadDialog";
import DocumentCard from "./documents/DocumentCard";

interface VendorDocumentsTabProps {
  vendorId: string;
}

const VendorDocumentsTab: React.FC<VendorDocumentsTabProps> = ({ vendorId }) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<any>(null);
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

  const handleSaveDocument = (data: VendorDocumentFormData) => {
    if (editingDocument) {
      updateDocumentMutation.mutate({ id: editingDocument.id, data });
    } else {
      createDocumentMutation.mutate(data);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading documents...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Documents</h3>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Document
        </Button>
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
          {documents.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onEdit={setEditingDocument}
              onDelete={(id) => deleteDocumentMutation.mutate(id)}
              isDeleting={deleteDocumentMutation.isPending}
            />
          ))}
        </div>
      )}

      <DocumentUploadDialog
        open={isAddDialogOpen || !!editingDocument}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) setEditingDocument(null);
        }}
        onSave={handleSaveDocument}
        editingDocument={editingDocument}
        isLoading={createDocumentMutation.isPending || updateDocumentMutation.isPending}
      />
    </div>
  );
};

export default VendorDocumentsTab;
