
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateWorkOrderData, useCreateWorkOrder } from '@/hooks/useWorkOrders';
import { X } from 'lucide-react';

interface WorkOrderFormProps {
  associationId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORIES = [
  'HVAC',
  'Plumbing',
  'Electrical',
  'Landscaping',
  'Painting',
  'Roofing',
  'Flooring',
  'Appliances',
  'General Maintenance',
  'Security',
  'Other'
];

export default function WorkOrderForm({ associationId, onClose, onSuccess }: WorkOrderFormProps) {
  const [formData, setFormData] = useState<CreateWorkOrderData>({
    association_id: associationId,
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    estimated_cost: undefined,
    due_date: '',
  });

  const createWorkOrder = useCreateWorkOrder();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      estimated_cost: formData.estimated_cost || undefined,
      due_date: formData.due_date || undefined,
    };

    try {
      await createWorkOrder.mutateAsync(submitData);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to create work order:', error);
    }
  };

  const handleInputChange = (field: keyof CreateWorkOrderData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Create New Work Order</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Brief description of the work needed"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Detailed description of the work order"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estimated_cost">Estimated Cost</Label>
              <Input
                id="estimated_cost"
                type="number"
                step="0.01"
                value={formData.estimated_cost || ''}
                onChange={(e) => handleInputChange('estimated_cost', parseFloat(e.target.value) || undefined)}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createWorkOrder.isPending}>
              {createWorkOrder.isPending ? 'Creating...' : 'Create Work Order'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
