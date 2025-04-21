
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Edit, Trash, Copy, Link, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/ui/empty-state';

export const FormBuilderTemplates = () => {
  const [formTemplates, setFormTemplates] = useState<any[]>([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // This would be replaced with actual data from API
  const mockTemplates = [
    { 
      id: 'template-1', 
      name: 'Work Order Request', 
      category: 'maintenance',
      updatedAt: new Date().toISOString(),
      submissionCount: 24,
      portal: 'homeowner'
    },
    { 
      id: 'template-2', 
      name: 'Pool Access Waiver', 
      category: 'legal',
      updatedAt: new Date().toISOString(),
      submissionCount: 56,
      portal: 'homeowner'
    },
    { 
      id: 'template-3', 
      name: 'ARC Application', 
      category: 'approval',
      updatedAt: new Date().toISOString(),
      submissionCount: 12,
      portal: 'homeowner'
    },
  ];

  // For demo purposes
  React.useEffect(() => {
    setFormTemplates(mockTemplates);
  }, []);

  const filteredTemplates = formTemplates.filter(template => {
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (formTemplates.length === 0) {
    return (
      <EmptyState
        title="No Form Templates"
        description="Get started by creating your first form template."
        icon={<FileText className="h-10 w-10" />}
        action={<Button>Create Form</Button>}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Search forms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="legal">Legal</SelectItem>
            <SelectItem value="approval">Approval</SelectItem>
            <SelectItem value="survey">Survey</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map(template => (
          <Card key={template.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">{template.name}</CardTitle>
              <CardDescription>
                {template.category.charAt(0).toUpperCase() + template.category.slice(1)} • {template.portal.charAt(0).toUpperCase() + template.portal.slice(1)} Portal
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>{template.submissionCount} submissions</span>
                <span>Last updated: {new Date(template.updatedAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
            <CardFooter className="pt-2 border-t flex justify-between">
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4 mr-2" /> Edit
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">Actions</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Copy className="mr-2 h-4 w-4" /> Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link className="mr-2 h-4 w-4" /> Get Embed Code
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ExternalLink className="mr-2 h-4 w-4" /> Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
