
import React, { useState } from 'react';
import { Search, Plus, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import TooltipButton from '@/components/ui/tooltip-button';

const DocsCenterTemplates = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock templates for UI demonstration
  const templates = [
    { id: '1', name: 'Standard Resale Certificate', type: 'certificate', lastUpdated: '2023-04-10', status: 'Active' },
    { id: '2', name: 'Rush Resale Certificate', type: 'certificate', lastUpdated: '2023-03-22', status: 'Active' },
    { id: '3', name: 'Annual Disclosure Package', type: 'disclosure', lastUpdated: '2023-02-15', status: 'Draft' }
  ];

  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-between">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <TooltipButton tooltip="Create a new resale template">
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </TooltipButton>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Resale Templates</CardTitle>
          <CardDescription>
            Templates used for generating resale certificates and packages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.length > 0 ? (
                filteredTemplates.map(template => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                        {template.name}
                      </div>
                    </TableCell>
                    <TableCell>{template.type}</TableCell>
                    <TableCell>{template.lastUpdated}</TableCell>
                    <TableCell>
                      <Badge variant={template.status === 'Active' ? 'default' : 'secondary'}>
                        {template.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <TooltipButton variant="ghost" size="sm" tooltip="View template details">
                        View
                      </TooltipButton>
                      <TooltipButton variant="ghost" size="sm" tooltip="Edit template">
                        Edit
                      </TooltipButton>
                      <TooltipButton variant="ghost" size="sm" tooltip="Duplicate template">
                        Duplicate
                      </TooltipButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No templates found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocsCenterTemplates;
