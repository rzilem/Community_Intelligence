import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';
import { Building2, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useAmenities, Amenity } from '@/hooks/amenities/useAmenities';
import { useAuth } from '@/contexts/AuthContext';

const Amenities: React.FC = () => {
  const { amenities, isLoading, createAmenity, updateAmenity, deleteAmenity } = useAmenities();
  const { currentAssociation } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: '',
    booking_fee: '',
    requires_approval: false
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      capacity: '',
      booking_fee: '',
      requires_approval: false
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentAssociation?.id) return;

    const amenityData = {
      association_id: currentAssociation.id,
      name: formData.name,
      description: formData.description || undefined,
      capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      booking_fee: formData.booking_fee ? parseFloat(formData.booking_fee) : undefined,
      requires_approval: formData.requires_approval
    };

    try {
      if (editingAmenity) {
        await updateAmenity.mutateAsync({ id: editingAmenity.id, ...amenityData });
        setEditingAmenity(null);
      } else {
        await createAmenity.mutateAsync(amenityData);
        setIsCreateOpen(false);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving amenity:', error);
    }
  };

  const handleEdit = (amenity: Amenity) => {
    setEditingAmenity(amenity);
    setFormData({
      name: amenity.name,
      description: amenity.description || '',
      capacity: amenity.capacity?.toString() || '',
      booking_fee: amenity.booking_fee?.toString() || '',
      requires_approval: amenity.requires_approval || false
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this amenity?')) {
      await deleteAmenity.mutateAsync(id);
    }
  };

  const AmenityForm = () => (
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
        <Label htmlFor="capacity">Capacity</Label>
        <Input
          id="capacity"
          type="number"
          value={formData.capacity}
          onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="booking_fee">Booking Fee ($)</Label>
        <Input
          id="booking_fee"
          type="number"
          step="0.01"
          value={formData.booking_fee}
          onChange={(e) => setFormData({ ...formData, booking_fee: e.target.value })}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="requires_approval"
          checked={formData.requires_approval}
          onCheckedChange={(checked) => setFormData({ ...formData, requires_approval: checked })}
        />
        <Label htmlFor="requires_approval">Requires Approval</Label>
      </div>
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setIsCreateOpen(false);
            setEditingAmenity(null);
            resetForm();
          }}
        >
          Cancel
        </Button>
        <Button type="submit">
          {editingAmenity ? 'Update' : 'Create'} Amenity
        </Button>
      </div>
    </form>
  );

  return (
    <AppLayout>
      <PageTemplate
        title="Amenities"
        icon={<Building2 className="h-8 w-8" />}
        description="Manage community amenities and facilities"
        actions={
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Amenity
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Amenity</DialogTitle>
              </DialogHeader>
              <AmenityForm />
            </DialogContent>
          </Dialog>
        }
      >
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center">Loading amenities...</div>
          ) : amenities.length === 0 ? (
            <div className="bg-muted/30 rounded-lg p-8 text-center">
              <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Amenities Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first amenity to get started.
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Amenity
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {amenities.map((amenity) => (
                <Card key={amenity.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{amenity.name}</CardTitle>
                        {amenity.description && (
                          <CardDescription>{amenity.description}</CardDescription>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(amenity)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(amenity.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {amenity.capacity && (
                        <div>Capacity: {amenity.capacity} people</div>
                      )}
                      {amenity.booking_fee && (
                        <div>Booking Fee: ${amenity.booking_fee}</div>
                      )}
                      <div>
                        Approval: {amenity.requires_approval ? 'Required' : 'Not Required'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {editingAmenity && (
            <Dialog open={!!editingAmenity} onOpenChange={() => setEditingAmenity(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Amenity</DialogTitle>
                </DialogHeader>
                <AmenityForm />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </PageTemplate>
    </AppLayout>
  );
};

export default Amenities;