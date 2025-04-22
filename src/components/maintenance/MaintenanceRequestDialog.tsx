
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MaintenanceRequest } from '@/types/maintenance-types';
import { useProperties } from '@/hooks/properties/useProperties';
import { useAuth } from '@/contexts/auth';

interface MaintenanceRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: MaintenanceRequest | null;
  onSubmit: (data: Partial<MaintenanceRequest>) => void;
}

const MaintenanceRequestDialog: React.FC<MaintenanceRequestDialogProps> = ({
  open,
  onOpenChange,
  request,
  onSubmit
}) => {
  const [formData, setFormData] = useState<Partial<MaintenanceRequest>>({
    title: '',
    description: '',
    property_id: '',
    priority: 'medium',
    status: 'open'
  });
  
  const { currentAssociation } = useAuth();
  const { properties, isLoading: propertiesLoading } = useProperties(currentAssociation?.id);

  useEffect(() => {
    if (request) {
      setFormData({
        title: request.title,
        description: request.description,
        property_id: request.property_id,
        priority: request.priority,
        status: request.status,
        assigned_to: request.assigned_to
      });
    } else {
      setFormData({
        title: '',
        description: '',
        property_id: '',
        priority: 'medium',
        status: 'open'
      });
    }
  }, [request, open]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {request ? 'Edit Maintenance Request' : 'New Maintenance Request'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title || ''}
              onChange={handleInputChange}
              placeholder="Enter request title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="property_id">Property</Label>
            <Select
              value={formData.property_id}
              onValueChange={(value) => handleSelectChange('property_id', value)}
              disabled={propertiesLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                {properties?.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              placeholder="Describe the maintenance issue"
              rows={4}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleSelectChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit">
              {request ? 'Update Request' : 'Create Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceRequestDialog;
