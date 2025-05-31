
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useSupabaseQuery, useSupabaseCreate, useSupabaseUpdate, useSupabaseDelete } from '@/hooks/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';

const AssessmentTypes = () => {
  const { userRole } = useAuth();
  const [open, setOpen] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_recurring: false,
    recurrence_period: 'monthly'
  });

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

  const { data: assessmentTypes = [], refetch } = useSupabaseQuery(
    'assessment_types',
    {
      select: '*',
      order: { column: 'created_at', ascending: false }
    }
  );

  const createType = useSupabaseCreate('assessment_types', {
    onSuccess: () => {
      toast.success('Assessment type created successfully');
      resetForm();
      refetch();
    }
  });

  const updateType = useSupabaseUpdate('assessment_types', {
    onSuccess: () => {
      toast.success('Assessment type updated successfully');
      resetForm();
      refetch();
    }
  });

  const deleteType = useSupabaseDelete('assessment_types', {
    onSuccess: () => {
      toast.success('Assessment type deleted successfully');
      refetch();
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      is_recurring: false,
      recurrence_period: 'monthly'
    });
    setEditingType(null);
    setOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingType) {
      updateType.mutate({
        id: editingType.id,
        data: formData
      });
    } else {
      createType.mutate(formData);
    }
  };

  const handleEdit = (type: any) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      description: type.description || '',
      is_recurring: type.is_recurring || false,
      recurrence_period: type.recurrence_period || 'monthly'
    });
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this assessment type?')) {
      deleteType.mutate(id);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Assessment Types</h1>
          <p className="text-muted-foreground">Manage different types of assessments for your associations</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingType(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Assessment Type
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingType ? 'Edit Assessment Type' : 'Create Assessment Type'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Monthly HOA Fee"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this assessment type"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_recurring"
                  checked={formData.is_recurring}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_recurring: checked }))}
                />
                <Label htmlFor="is_recurring">Recurring Assessment</Label>
              </div>

              {formData.is_recurring && (
                <div>
                  <Label htmlFor="recurrence_period">Recurrence Period</Label>
                  <Select 
                    value={formData.recurrence_period}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, recurrence_period: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="bi_annual">Bi-Annual</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createType.isPending || updateType.isPending}>
                  {editingType ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assessment Types</CardTitle>
        </CardHeader>
        <CardContent>
          {assessmentTypes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No assessment types created yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Recurrence</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessmentTypes.map((type: any) => (
                  <TableRow key={type.id}>
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell>{type.description || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={type.is_recurring ? "default" : "secondary"}>
                        {type.is_recurring ? 'Recurring' : 'One-time'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {type.is_recurring ? type.recurrence_period : '-'}
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

export default AssessmentTypes;
