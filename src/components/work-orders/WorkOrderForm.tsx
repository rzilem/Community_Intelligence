
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateWorkOrderData, useCreateWorkOrder } from '@/hooks/useWorkOrders';
import PropertyResidentSelector from './PropertyResidentSelector';
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
  'Pool/Spa',
  'Elevator',
  'Fire Safety',
  'Pest Control',
  'Other'
];

// Mock data - in real app, these would come from hooks/API
const mockProperties = [
  { id: '1', address: '123 Main St', unit_number: 'A' },
  { id: '2', address: '456 Oak Ave', unit_number: 'B' },
  { id: '3', address: '789 Pine Rd', unit_number: undefined },
];

const mockResidents = [
  { id: '1', first_name: 'John', last_name: 'Doe', email: 'john@example.com' },
  { id: '2', first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com' },
  { id: '3', first_name: 'Bob', last_name: 'Johnson', email: 'bob@example.com' },
];

export default function WorkOrderForm({ associationId, onClose, onSuccess }: WorkOrderFormProps) {
  const [formData, setFormData] = useState<CreateWorkOrderData & { 
    property_id?: string; 
    resident_id?: string; 
  }>({
    association_id: associationId,
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    estimated_cost: undefined,
    due_date: '',
    property_id: undefined,
    resident_id: undefined,
  });

  const createWorkOrder = useCreateWorkOrder();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      estimated_cost: formData.estimated_cost || undefined,
      due_date: formData.due_date || undefined,
      property_id: formData.property_id || undefined,
      resident_id: formData.resident_id === 'none' ? undefined : formData.resident_id,
    };

    try {
      await createWorkOrder.mutateAsync(submitData);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to create work order:', error);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Create New Work Order</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
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
          </div>

          {/* Property and Resident Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Location & Contact</h3>
            <PropertyResidentSelector
              properties={mockProperties}
              residents={mockResidents}
              selectedPropertyId={formData.property_id}
              selectedResidentId={formData.resident_id}
              onPropertyChange={(value) => handleInputChange('property_id', value)}
              onResidentChange={(value) => handleInputChange('resident_id', value)}
            />
          </div>

          {/* Schedule and Budget */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Schedule & Budget</h3>
            
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
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
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
