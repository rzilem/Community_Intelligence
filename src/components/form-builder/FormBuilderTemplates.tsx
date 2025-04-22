
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
import { useSupabaseDelete } from '@/hooks/supabase';
import { toast } from 'sonner';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ExtendedFormBuilderTemplatesProps extends FormBuilderTemplatesProps {
  onTemplateSelect?: (template: FormTemplate) => void;
  onEditTemplate?: (template: FormTemplate) => void;
}

export const FormBuilderTemplates: React.FC<ExtendedFormBuilderTemplatesProps> = ({ 
  associationId,
  onTemplateSelect,
  onEditTemplate
}) => {
  const { data: templates = [], isLoading, refetch } = useFormTemplates(associationId);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<FormTemplate | null>(null);

  const { mutate: deleteTemplate, isLoading: isDeleting } = useSupabaseDelete('form_templates');

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
  
  const handleEditTemplate = (template: FormTemplate) => {
    if (onEditTemplate) {
      onEditTemplate(template);
    }
  };
  
  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;
    
    try {
      await deleteTemplate(templateToDelete.id);
      toast.success(`Template "${templateToDelete.name}" deleted successfully`);
      refetch();
    } catch (error: any) {
      toast.error(`Failed to delete template: ${error.message}`);
    } finally {
      setTemplateToDelete(null);
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Form Templates</CardTitle>
          <CardDescription>Loading templates...</CardDescription>
        </CardHeader>
      </Card>
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
              <Button variant="ghost" size="sm" onClick={(e) => {
                e.stopPropagation();
                handleEditTemplate(template);
              }}>
                <Edit className="h-4 w-4 mr-2" /> Edit
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm">Actions</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleSelectTemplate(template);
                  }}>
                    <Eye className="mr-2 h-4 w-4" /> Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="mr-2 h-4 w-4" /> Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link className="mr-2 h-4 w-4" /> Get Embed Code
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ExternalLink className="mr-2 h-4 w-4" /> Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={(e) => {
                    e.stopPropagation();
                    setTemplateToDelete(template);
                  }}>
                    <Trash className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardFooter>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!templateToDelete} onOpenChange={(open) => !open && setTemplateToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the form template "{templateToDelete?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTemplate}
              className="bg-destructive text-destructive-foreground"
            >
              {isDeleting ? 'Deleting...' : 'Delete Template'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
