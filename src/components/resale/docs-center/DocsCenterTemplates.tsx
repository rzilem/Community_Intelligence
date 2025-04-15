
import React, { useState } from 'react';
import { Search, Plus, FileText, Pencil, Copy, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import TooltipButton from '@/components/ui/tooltip-button';
import { toast } from 'sonner';

// Template type definition
interface ResaleTemplate {
  id: string;
  name: string;
  type: string;
  lastUpdated: string;
  status: string;
  content?: string;
  description?: string;
}

const DocsCenterTemplates = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewTemplateOpen, setIsNewTemplateOpen] = useState(false);
  const [isViewTemplateOpen, setIsViewTemplateOpen] = useState(false);
  const [isEditTemplateOpen, setIsEditTemplateOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ResaleTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState<Partial<ResaleTemplate>>({
    name: '',
    type: 'certificate',
    content: '',
    description: '',
    status: 'Draft'
  });
  
  // Mock templates for UI demonstration
  const [templates, setTemplates] = useState<ResaleTemplate[]>([
    { id: '1', name: 'Standard Resale Certificate', type: 'certificate', lastUpdated: '2023-04-10', status: 'Active' },
    { id: '2', name: 'Rush Resale Certificate', type: 'certificate', lastUpdated: '2023-03-22', status: 'Active' },
    { id: '3', name: 'Annual Disclosure Package', type: 'disclosure', lastUpdated: '2023-02-15', status: 'Draft' }
  ]);

  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTemplate = () => {
    const template: ResaleTemplate = {
      id: Date.now().toString(), // Simple ID generation for mock
      name: newTemplate.name || 'New Template',
      type: newTemplate.type || 'certificate',
      content: newTemplate.content || '',
      description: newTemplate.description || '',
      lastUpdated: new Date().toISOString().split('T')[0],
      status: 'Draft'
    };

    setTemplates([...templates, template]);
    setNewTemplate({
      name: '',
      type: 'certificate',
      content: '',
      description: '',
      status: 'Draft'
    });
    setIsNewTemplateOpen(false);
    toast.success('New template created');
  };

  const handleViewTemplate = (template: ResaleTemplate) => {
    setSelectedTemplate(template);
    setIsViewTemplateOpen(true);
  };

  const handleEditTemplate = (template: ResaleTemplate) => {
    setSelectedTemplate(template);
    setIsEditTemplateOpen(true);
  };

  const handleUpdateTemplate = () => {
    if (!selectedTemplate) return;
    
    const updatedTemplates = templates.map(t => 
      t.id === selectedTemplate.id ? { ...selectedTemplate, lastUpdated: new Date().toISOString().split('T')[0] } : t
    );
    
    setTemplates(updatedTemplates);
    setIsEditTemplateOpen(false);
    toast.success('Template updated successfully');
  };

  const handleDuplicateTemplate = (template: ResaleTemplate) => {
    const newTemplate: ResaleTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      lastUpdated: new Date().toISOString().split('T')[0],
      status: 'Draft'
    };
    
    setTemplates([...templates, newTemplate]);
    toast.success('Template duplicated successfully');
  };

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
        
        <TooltipButton 
          tooltip="Create a new resale template"
          onClick={() => setIsNewTemplateOpen(true)}
        >
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
                    <TableCell className="capitalize">{template.type}</TableCell>
                    <TableCell>{template.lastUpdated}</TableCell>
                    <TableCell>
                      <Badge variant={template.status === 'Active' ? 'default' : 'secondary'}>
                        {template.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <TooltipButton 
                        variant="ghost" 
                        size="sm" 
                        tooltip="View template details"
                        onClick={() => handleViewTemplate(template)}
                      >
                        View
                      </TooltipButton>
                      <TooltipButton 
                        variant="ghost" 
                        size="sm" 
                        tooltip="Edit template"
                        onClick={() => handleEditTemplate(template)}
                      >
                        Edit
                      </TooltipButton>
                      <TooltipButton 
                        variant="ghost" 
                        size="sm" 
                        tooltip="Duplicate template"
                        onClick={() => handleDuplicateTemplate(template)}
                      >
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

      {/* New Template Dialog */}
      <Dialog open={isNewTemplateOpen} onOpenChange={setIsNewTemplateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>
              Create a new resale certificate or disclosure package template.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <select
                id="type"
                value={newTemplate.type}
                onChange={(e) => setNewTemplate({...newTemplate, type: e.target.value})}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="certificate">Certificate</option>
                <option value="disclosure">Disclosure</option>
                <option value="questionnaire">Questionnaire</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                className="col-span-3"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="content" className="text-right">
                Content
              </Label>
              <Textarea
                id="content"
                value={newTemplate.content}
                onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                className="col-span-3"
                rows={5}
                placeholder="Enter template content or upload a document..."
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleCreateTemplate}>
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Template Dialog */}
      <Dialog open={isViewTemplateOpen} onOpenChange={setIsViewTemplateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              {selectedTemplate?.type} template - Last updated on {selectedTemplate?.lastUpdated}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 border rounded-md p-4 bg-muted/20 h-[200px] overflow-auto">
            {selectedTemplate?.content || (
              <p className="text-muted-foreground text-center py-8">
                No content available for this template.
              </p>
            )}
          </div>
          <DialogFooter className="sm:justify-between">
            <div className="flex gap-2">
              <TooltipButton 
                variant="outline" 
                size="sm" 
                tooltip="Edit this template"
                onClick={() => {
                  setIsViewTemplateOpen(false);
                  handleEditTemplate(selectedTemplate!);
                }}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </TooltipButton>
              <TooltipButton 
                variant="outline" 
                size="sm" 
                tooltip="Duplicate this template"
                onClick={() => {
                  setIsViewTemplateOpen(false);
                  handleDuplicateTemplate(selectedTemplate!);
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </TooltipButton>
            </div>
            <DialogClose asChild>
              <Button type="button">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={isEditTemplateOpen} onOpenChange={setIsEditTemplateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Update the template details and content.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={selectedTemplate?.name}
                onChange={(e) => setSelectedTemplate(prev => prev ? {...prev, name: e.target.value} : null)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-type" className="text-right">
                Type
              </Label>
              <select
                id="edit-type"
                value={selectedTemplate?.type}
                onChange={(e) => setSelectedTemplate(prev => prev ? {...prev, type: e.target.value} : null)}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="certificate">Certificate</option>
                <option value="disclosure">Disclosure</option>
                <option value="questionnaire">Questionnaire</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">
                Status
              </Label>
              <select
                id="edit-status"
                value={selectedTemplate?.status}
                onChange={(e) => setSelectedTemplate(prev => prev ? {...prev, status: e.target.value} : null)}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-content" className="text-right">
                Content
              </Label>
              <Textarea
                id="edit-content"
                value={selectedTemplate?.content || ''}
                onChange={(e) => setSelectedTemplate(prev => prev ? {...prev, content: e.target.value} : null)}
                className="col-span-3"
                rows={5}
                placeholder="Enter template content..."
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setTemplates(templates.filter(t => t.id !== selectedTemplate?.id));
                setIsEditTemplateOpen(false);
                toast.success('Template deleted');
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="button" onClick={handleUpdateTemplate}>
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocsCenterTemplates;
