
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Plus, Link2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import LinkDocumentsDialog from '@/components/resale/LinkDocumentsDialog';
import { useAssociations } from '@/hooks/associations';

const DocsCenterDocuments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssociation, setSelectedAssociation] = useState('');
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  
  // Use the useAssociations hook which returns an object with 'associations' property
  const { associations = [] } = useAssociations();
  
  // Mock documents for UI demonstration
  const documents = [
    { id: '1', name: 'Resale Certificate', type: 'certificate', lastUpdated: '2023-04-10', status: 'Active' },
    { id: '2', name: 'Disclosure Packet', type: 'disclosure', lastUpdated: '2023-03-22', status: 'Active' },
    { id: '3', name: 'Homeowner Manual', type: 'documentation', lastUpdated: '2023-02-15', status: 'Archive' }
  ];

  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-between">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="flex space-x-2">
          <Select value={selectedAssociation} onValueChange={setSelectedAssociation}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Association" />
            </SelectTrigger>
            <SelectContent>
              {associations.map((assoc: { id: string; name: string }) => (
                <SelectItem key={assoc.id} value={assoc.id}>
                  {assoc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={() => setIsLinkDialogOpen(true)}>
            <Link2 className="mr-2 h-4 w-4" />
            Link Association Documents
          </Button>
          
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Document
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Resale Documents</CardTitle>
          <CardDescription>
            Documents that can be included in resale packages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map(doc => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.name}</TableCell>
                    <TableCell>{doc.type}</TableCell>
                    <TableCell>{doc.lastUpdated}</TableCell>
                    <TableCell>{doc.status}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">View</Button>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No documents found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {selectedAssociation && (
        <LinkDocumentsDialog
          isOpen={isLinkDialogOpen}
          onClose={() => setIsLinkDialogOpen(false)}
          documents={[]} // This would be populated with actual association documents
          linkedDocuments={[]} // This would track already linked documents
          packageId="mock-package-id" // This would be the actual package ID
          onSaveLinks={async () => {}} // This would be the actual save function
        />
      )}
    </div>
  );
};

export default DocsCenterDocuments;
