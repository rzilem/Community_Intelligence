
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Edit, Trash, Copy, Link, ExternalLink, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/ui/empty-state';
import { FormBuilderTemplatesProps, FormTemplate } from '@/types/form-builder-types';
import { useFormTemplates } from '@/hooks/form-builder/useFormTemplates';
import FieldTemplatesLibrary from './FieldTemplatesLibrary';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface ExtendedFormBuilderTemplatesProps extends FormBuilderTemplatesProps {
  onTemplateSelect?: (template: FormTemplate) => void;
}

export const FormBuilderTemplates: React.FC<ExtendedFormBuilderTemplatesProps> = ({ 
  associationId,
  onTemplateSelect 
}) => {
  const { data: templates = [], isLoading, error } = useFormTemplates(associationId);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
  const navigate = useNavigate();

  // Filter templates based on search and category
  const filteredTemplates = templates.filter(template => {
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelectTemplate = (template: FormTemplate) => {
    setSelectedTemplate(template);
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
  };
  
  const handleAddField = (field: any) => {
    toast.success(`Field "${field.label}" added to library`);
    // This would typically update the backend through an API call
  };
  
  const handleAddTemplate = (fields: any[]) => {
    toast.success(`Added ${fields.length} fields to library`);
    // This would typically update the backend through an API call
  };

  const handleEditTemplate = (template: FormTemplate, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card click from selecting the template
    navigate(`/system/form-builder/edit/${template.id}`);
  };

  const handlePreviewTemplate = (template: FormTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    handleSelectTemplate(template);
  };

  const handleDuplicateTemplate = (template: FormTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success(`Duplicating template: ${template.name}`);
    // Add the implementation for duplicating a template here
  };

  const handleGetEmbedCode = (template: FormTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    const embedCode = `<iframe src="${window.location.origin}/embed/forms/${template.id}" width="100%" height="600" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    toast.success('Embed code copied to clipboard');
  };

  const handleDeleteTemplate = (template: FormTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${template.name}"?`)) {
      toast.success(`Template "${template.name}" deleted`);
      // Add the implementation for deleting a template here
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading templates...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Error loading templates: {error.message}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (templates.length === 0) {
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
        <div className="flex gap-2">
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
          
          <FieldTemplatesLibrary onAddField={handleAddField} onAddTemplate={handleAddTemplate} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map(template => (
          <Card 
            key={template.id} 
            className={`overflow-hidden transition-shadow hover:shadow-md cursor-pointer ${
              selectedTemplate?.id === template.id ? 'ring-2 ring-primary ring-offset-2' : ''
            }`}
            onClick={() => handleSelectTemplate(template)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">{template.name}</CardTitle>
              <CardDescription>
                {template.category ? (template.category.charAt(0).toUpperCase() + template.category.slice(1)) : 'Uncategorized'}
                {template.is_global && <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Global</span>}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Created: {new Date(template.created_at).toLocaleDateString()}</span>
                <span>Last updated: {new Date(template.updated_at).toLocaleDateString()}</span>
              </div>
              <div className="mt-2">
                <span className="text-xs bg-muted px-2 py-1 rounded-full">
                  {template.fields.length} field{template.fields.length !== 1 && 's'}
                </span>
              </div>
            </CardContent>
            <CardFooter className="pt-2 border-t flex justify-between">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => handleEditTemplate(template, e)}
              >
                <Edit className="h-4 w-4 mr-2" /> Edit
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>Actions</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem onClick={(e) => handlePreviewTemplate(template, e)}>
                    <Eye className="mr-2 h-4 w-4" /> Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => handleDuplicateTemplate(template, e)}>
                    <Copy className="mr-2 h-4 w-4" /> Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => handleGetEmbedCode(template, e)}>
                    <Link className="mr-2 h-4 w-4" /> Get Embed Code
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => window.open(`/public/forms/${template.id}`, '_blank')}>
                    <ExternalLink className="mr-2 h-4 w-4" /> Open Public Link
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={(e) => handleDeleteTemplate(template, e)}
                  >
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
}
