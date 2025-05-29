
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Image } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useProjectTypes, ProjectType } from '@/hooks/bid-requests/useProjectTypes';
import { useQueryClient } from '@tanstack/react-query';

const ProjectTypeManagement = () => {
  const { data: projectTypes, isLoading } = useProjectTypes();
  const queryClient = useQueryClient();
  const [editingType, setEditingType] = useState<ProjectType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    is_active: true,
    sort_order: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingType) {
        const { error } = await supabase
          .from('project_types')
          .update({
            name: formData.name,
            description: formData.description,
            image_url: formData.image_url,
            is_active: formData.is_active,
            sort_order: formData.sort_order,
            slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')
          })
          .eq('id', editingType.id);

        if (error) throw error;
        toast.success('Project type updated successfully');
      } else {
        const { error } = await supabase
          .from('project_types')
          .insert({
            name: formData.name,
            description: formData.description,
            image_url: formData.image_url,
            is_active: formData.is_active,
            sort_order: formData.sort_order,
            slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
            conditional_fields: {}
          });

        if (error) throw error;
        toast.success('Project type created successfully');
      }
      
      queryClient.invalidateQueries({ queryKey: ['project-types'] });
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving project type:', error);
      toast.error('Failed to save project type');
    }
  };

  const handleEdit = (projectType: ProjectType) => {
    setEditingType(projectType);
    setFormData({
      name: projectType.name,
      description: projectType.description || '',
      image_url: projectType.image_url || '',
      is_active: projectType.is_active,
      sort_order: projectType.sort_order
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project type?')) return;
    
    try {
      const { error } = await supabase
        .from('project_types')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Project type deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['project-types'] });
    } catch (error) {
      console.error('Error deleting project type:', error);
      toast.error('Failed to delete project type');
    }
  };

  const resetForm = () => {
    setEditingType(null);
    setFormData({
      name: '',
      description: '',
      image_url: '',
      is_active: true,
      sort_order: 0
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Project Type Management</h1>
          <p className="text-muted-foreground">
            Manage project types for bid requests
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Project Type
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingType ? 'Edit Project Type' : 'Add Project Type'}
              </DialogTitle>
              <DialogDescription>
                {editingType 
                  ? 'Update the project type details below.' 
                  : 'Create a new project type for bid requests.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingType ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Types</CardTitle>
          <CardDescription>
            Manage available project types for bid requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Sort Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projectTypes?.map((projectType) => (
                <TableRow key={projectType.id}>
                  <TableCell>
                    {projectType.image_url ? (
                      <img
                        src={projectType.image_url}
                        alt={projectType.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                        <Image className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{projectType.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{projectType.description}</TableCell>
                  <TableCell>{projectType.sort_order}</TableCell>
                  <TableCell>
                    <Badge variant={projectType.is_active ? 'default' : 'secondary'}>
                      {projectType.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(projectType)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(projectType.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectTypeManagement;
