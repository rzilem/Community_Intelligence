
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Document } from '@/types/document-types';
import { ResaleDocumentLink } from '@/types/resale-types';
import DocumentLinkingTable from './DocumentLinkingTable';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

interface LinkDocumentsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documents: Document[];
  linkedDocuments: ResaleDocumentLink[];
  packageId: string;
  onSaveLinks: (links: { documentId: string; isIncluded: boolean }[]) => Promise<void>;
}

const LinkDocumentsDialog: React.FC<LinkDocumentsDialogProps> = ({
  isOpen,
  onClose,
  documents,
  linkedDocuments,
  packageId,
  onSaveLinks
}) => {
  const [activeCategory, setActiveCategory] = useState<string | undefined>();
  const [pendingLinks, setPendingLinks] = useState<{ documentId: string; isIncluded: boolean }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setPendingLinks([]);
    }
  }, [isOpen]);

  // Filter documents by category if active
  const filteredDocuments = activeCategory
    ? documents.filter(doc => doc.category === activeCategory)
    : documents;

  const handleLinkDocument = (documentId: string, isIncluded: boolean) => {
    // Add to pending changes
    setPendingLinks(prev => {
      // Remove if exists
      const filtered = prev.filter(link => link.documentId !== documentId);
      // Add new state
      return [...filtered, { documentId, isIncluded }];
    });
  };

  const handleViewDocument = (doc: Document) => {
    window.open(doc.url, '_blank');
  };

  const handleSave = async () => {
    if (pendingLinks.length === 0) {
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      await onSaveLinks(pendingLinks);
      toast({
        title: "Documents linked successfully",
        description: `${pendingLinks.length} document links updated for this resale package.`,
      });
      onClose();
    } catch (error) {
      console.error("Error saving document links:", error);
      toast({
        title: "Error linking documents",
        description: "There was a problem updating document links.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique categories from documents
  const categories = Array.from(new Set(documents.map(doc => doc.category).filter(Boolean) as string[]));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Link Association Documents</DialogTitle>
          <DialogDescription>
            Select documents from the association repository to include in this resale package.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {categories.length > 0 && (
            <Tabs defaultValue={activeCategory} onValueChange={setActiveCategory} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value={undefined}>All Documents</TabsTrigger>
                {categories.map(category => (
                  <TabsTrigger key={category} value={category}>
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}

          <DocumentLinkingTable
            documents={filteredDocuments}
            linkedDocuments={linkedDocuments}
            isLoading={isLoading}
            onLinkDocument={handleLinkDocument}
            onViewDocument={handleViewDocument}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Links"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LinkDocumentsDialog;
