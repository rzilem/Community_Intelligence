
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';

const ProjectTypes = () => {
  const { userRole } = useAuth();
  const [open, setOpen] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'maintenance'
  });

  // Mock data for project types - in a real app this would come from the database
  const [projectTypes, setProjectTypes] = useState([
    {
      id: '1',
      name: 'Roof Repair',
      description: 'General roof maintenance and repairs',
      category: 'maintenance',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Landscaping',
      description: 'Lawn care and landscaping services',
      category: 'improvement',
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Plumbing',
      description: 'Plumbing repairs and installations',
      category: 'maintenance',
      created_at: new Date().toISOString()
    }
  ]);

  // Only show for admin/manager roles
  if (!['admin', 'manager'].includes(userRole || '')) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'maintenance'
    });
    setEditingType(null);
    setOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingType) {
      setProjectTypes(prev => prev.map(type => 
        type.id === editingType.id ? { ...type, ...formData } : type
      ));
      toast.success('Project type updated successfully');
    } else {
      const newType = {
        id: Date.now().toString(),
        ...formData,
        created_at: new Date().toISOString()
      };
      setProjectTypes(prev => [newType, ...prev]);
      toast.success('Project type created successfully');
    }
    
    resetForm();
  };

  const handleEdit = (type: any) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      description: type.description || '',
      category: type.category
    });
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this project type?')) {
      setProjectTypes(prev => prev.filter(type => type.id !== id));
      toast.success('Project type deleted successfully');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Project Types</h1>
          <p className="text-muted-foreground">Manage project types for bid requests and maintenance</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingType(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Project Type
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingType ? 'Edit Project Type' : 'Create Project Type'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Roof Repair"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this project type"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="maintenance">Maintenance</option>
                  <option value="improvement">Improvement</option>
                  <option value="emergency">Emergency</option>
                  <option value="landscaping">Landscaping</option>
                  <option value="security">Security</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
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
        </CardHeader>
        <CardContent>
          {projectTypes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No project types created yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectTypes.map((type: any) => (
                  <TableRow key={type.id}>
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell>{type.description || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {type.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(type)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(type.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectTypes;
