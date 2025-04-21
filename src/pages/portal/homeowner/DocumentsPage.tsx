
import React, { useState } from 'react';
import { PortalPageLayout } from '@/components/portal/PortalPageLayout';
import { File, Search, Download, Eye, Calendar, FileText, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PortalNavigation } from '@/components/portal/PortalNavigation';

// Sample documents data
const documents = [
  { id: 1, name: 'HOA Bylaws', category: 'Governing Documents', date: '2023-01-15', size: '1.2 MB', type: 'pdf' },
  { id: 2, name: 'Community Rules & Regulations', category: 'Governing Documents', date: '2023-02-20', size: '850 KB', type: 'pdf' },
  { id: 3, name: 'Architectural Guidelines', category: 'ARC', date: '2023-03-10', size: '1.5 MB', type: 'pdf' },
  { id: 4, name: 'Pool Rules', category: 'Amenities', date: '2023-04-05', size: '500 KB', type: 'pdf' },
  { id: 5, name: 'Annual Budget', category: 'Financial', date: '2023-01-01', size: '750 KB', type: 'xlsx' },
  { id: 6, name: 'January Board Meeting Minutes', category: 'Meeting Minutes', date: '2023-01-20', size: '350 KB', type: 'pdf' },
  { id: 7, name: 'February Board Meeting Minutes', category: 'Meeting Minutes', date: '2023-02-25', size: '380 KB', type: 'pdf' },
  { id: 8, name: 'Q1 Financial Report', category: 'Financial', date: '2023-04-15', size: '900 KB', type: 'pdf' },
  { id: 9, name: 'Community Newsletter - Spring', category: 'Newsletters', date: '2023-03-01', size: '1.1 MB', type: 'pdf' },
  { id: 10, name: 'Insurance Certificate', category: 'Insurance', date: '2023-01-10', size: '600 KB', type: 'pdf' },
];

// Document categories
const categories = [
  'All Categories',
  'Governing Documents',
  'ARC',
  'Amenities',
  'Financial',
  'Meeting Minutes',
  'Newsletters',
  'Insurance',
];

const DocumentsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  
  // Filter function based on search term and category
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All Categories' || doc.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Get icon based on file type
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'xlsx':
        return <FileText className="h-4 w-4 text-green-500" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  return (
    <PortalPageLayout 
      title="Documents" 
      icon={<File className="h-6 w-6" />}
      description="Access community documents and files"
      portalType="homeowner"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <PortalNavigation portalType="homeowner" />
        </div>
        
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No documents found matching your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getFileIcon(doc.type)}
                            <span className="font-medium">{doc.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{doc.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span className="text-sm">{new Date(doc.date).toLocaleDateString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>{doc.size}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalPageLayout>
  );
};

export default DocumentsPage;
