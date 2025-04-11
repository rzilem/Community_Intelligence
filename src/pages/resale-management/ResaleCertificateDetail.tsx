
import React from 'react';
import { useParams } from 'react-router-dom';
import { Clipboard, FileText, Link, Plus } from 'lucide-react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDialog } from '@/hooks/ui/useDialog';
import { useQuery } from '@tanstack/react-query';
import { useDocuments } from '@/hooks/documents';
import { useResaleDocumentLinks } from '@/hooks/resale/useResaleDocumentLinks';
import LinkDocumentsDialog from '@/components/resale/LinkDocumentsDialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatBytes } from '@/lib/utils';

const ResaleCertificateDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { isOpen: isDialogOpen, open: openDialog, close: closeDialog } = useDialog();
  
  // Fetch association for the certificate - in a real app this would come from the resale package data
  const associationId = "sample-association-id"; // This would be dynamically fetched
  
  // Fetch documents for the association
  const { 
    documents, 
    isLoading: isLoadingDocuments 
  } = useDocuments({
    associationId,
    enabled: !!associationId
  });
  
  // Fetch linked documents
  const {
    linkedDocuments,
    isLoadingLinks,
    updateLinks,
    isLinkDialogOpen,
    openLinkDialog,
    closeLinkDialog
  } = useResaleDocumentLinks(id);
  
  // Mock data for the resale certificate
  const { data: certificate, isLoading } = useQuery({
    queryKey: ['resale-certificate', id],
    queryFn: () => Promise.resolve({
      id,
      property_address: '123 Main St, Austin, TX 78701',
      requester_name: 'John Smith',
      request_date: '2025-03-15',
      due_date: '2025-03-22',
      status: 'in_progress',
      fee: 250.00,
      rush_fee: 50.00,
      total_fee: 300.00
    }),
    enabled: !!id
  });

  // Get included documents
  const includedDocuments = linkedDocuments
    .filter(link => link.is_included && link.document)
    .map(link => link.document!);
  
  const handleSaveLinks = async (links: { documentId: string; isIncluded: boolean }[]) => {
    await updateLinks.mutateAsync(links);
  };

  if (isLoading) {
    return (
      <PageTemplate 
        title="Resale Certificate" 
        icon={<Clipboard className="h-8 w-8" />}
        description="Loading certificate details..."
      />
    );
  }

  return (
    <PageTemplate 
      title="Resale Certificate" 
      icon={<Clipboard className="h-8 w-8" />}
      description={`Manage resale certificate for ${certificate?.property_address}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Certificate Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Property</p>
                <p className="text-lg">{certificate?.property_address}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  {certificate?.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Requester</p>
                <p>{certificate?.requester_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Request Date</p>
                <p>{certificate?.request_date}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Due Date</p>
                <p>{certificate?.due_date}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Total Fee</p>
                <p>${certificate?.total_fee.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Certificate Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Base Fee</p>
                <p>${certificate?.fee.toFixed(2)}</p>
              </div>
              {certificate?.rush_fee ? (
                <div>
                  <p className="text-sm font-medium">Rush Fee</p>
                  <p>${certificate?.rush_fee.toFixed(2)}</p>
                </div>
              ) : null}
              <div>
                <p className="text-sm font-medium">Documents Included</p>
                <p>{includedDocuments.length}</p>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm font-medium">Total</p>
                <p className="text-xl font-bold">${certificate?.total_fee.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Linked Documents</CardTitle>
          <Button onClick={openLinkDialog} className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            Link Documents
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="included">
            <TabsList className="mb-4">
              <TabsTrigger value="included">Included Documents</TabsTrigger>
              <TabsTrigger value="all">All Linked Documents</TabsTrigger>
            </TabsList>
            
            <TabsContent value="included">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingLinks ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        Loading documents...
                      </TableCell>
                    </TableRow>
                  ) : includedDocuments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No documents included yet. Click "Link Documents" to add documents to this resale package.
                      </TableCell>
                    </TableRow>
                  ) : (
                    includedDocuments.map(doc => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              {doc.description && (
                                <p className="text-sm text-muted-foreground">{doc.description}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{doc.category || 'general'}</TableCell>
                        <TableCell>{formatBytes(doc.file_size)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => window.open(doc.url, '_blank')}>
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="all">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Included</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingLinks ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        Loading documents...
                      </TableCell>
                    </TableRow>
                  ) : linkedDocuments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No documents linked yet. Click "Link Documents" to add documents.
                      </TableCell>
                    </TableRow>
                  ) : (
                    linkedDocuments
                      .filter(link => link.document)
                      .map(link => (
                        <TableRow key={link.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{link.document!.name}</p>
                                {link.document!.description && (
                                  <p className="text-sm text-muted-foreground">{link.document!.description}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{link.document!.category || 'general'}</TableCell>
                          <TableCell>
                            <Badge variant={link.is_included ? "default" : "outline"}>
                              {link.is_included ? "Included" : "Not Included"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => window.open(link.document!.url, '_blank')}>
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Document linking dialog */}
      <LinkDocumentsDialog
        isOpen={isLinkDialogOpen}
        onClose={closeLinkDialog}
        documents={documents}
        linkedDocuments={linkedDocuments}
        packageId={id!}
        onSaveLinks={handleSaveLinks}
      />
    </PageTemplate>
  );
};

export default ResaleCertificateDetail;
