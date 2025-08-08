
import React, { useMemo, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';
import { Building2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAmenities as useAmenitiesHook } from '@/hooks/amenities/useAmenities';
import { useAuth } from '@/contexts/AuthContext';
import AmenityCard from '@/components/amenities/AmenityCard';
import AmenityForm from '@/components/amenities/AmenityForm';
import { toast } from 'sonner';

const AmenitiesPage: React.FC = () => {
  const { currentAssociation, isLoading } = useAuth();
  const { amenities, isLoading: amenitiesLoading, createAmenity, updateAmenity, deleteAmenity } = useAmenitiesHook();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<any | null>(null);

  const isReady = useMemo(() => !!currentAssociation && !isLoading, [currentAssociation, isLoading]);

  const handleCreate = async (payload: any, imageFile?: File | null) => {
    if (!currentAssociation?.id) {
      toast.error('Please select an association first.');
      return;
    }
    // Ensure association_id is set
    const toInsert = {
      association_id: currentAssociation.id,
      name: payload.name,
      description: payload.description || null,
      capacity: payload.capacity ? Number(payload.capacity) : null,
      booking_fee: payload.booking_fee ? Number(payload.booking_fee) : null,
      requires_approval: !!payload.requires_approval,
      // booking_settings and is_active can be updated after creation if needed
    };

    createAmenity.mutate(toInsert as any, {
      onSuccess: async (created: any) => {
        // If image selected, upload and update amenity
        if (imageFile) {
          try {
            const { supabase } = await import('@/integrations/supabase/client');
            const filePath = `${currentAssociation.id}/${created.id}/${Date.now()}_${imageFile.name}`;
            const { data: uploadRes, error: uploadErr } = await supabase.storage
              .from('amenity_images')
              .upload(filePath, imageFile, { upsert: true });

            if (uploadErr) throw uploadErr;
            const { data: publicUrlData } = supabase.storage.from('amenity_images').getPublicUrl(filePath);
            const image_url = publicUrlData.publicUrl;

            (updateAmenity.mutate as any)({ id: created.id, image_url });
          } catch (err: any) {
            console.error('Image upload failed', err);
            toast.error('Amenity created, but image upload failed.');
          }
        }
        toast.success('Amenity created.');
        setIsCreateOpen(false);
      },
      onError: (err: any) => {
        console.error(err);
        toast.error('Failed to create amenity.');
      },
    });
  };

  const handleUpdate = (id: string, updates: any) => {
    updateAmenity.mutate(
      { id, ...updates } as any,
      {
        onSuccess: () => {
          toast.success('Amenity updated.');
          setEditingAmenity(null);
        },
        onError: () => toast.error('Failed to update amenity.'),
      }
    );
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this amenity?')) return;
    deleteAmenity.mutate(id, {
      onSuccess: () => toast.success('Amenity deleted.'),
      onError: () => toast.error('Failed to delete amenity.'),
    });
  };

  return (
    <AppLayout>
      <PageTemplate
        title="Amenities"
        icon={<Building2 className="h-8 w-8" />}
        description="Manage community amenities, booking settings, and blackout dates."
      >
        {!isReady ? (
          <Card>
            <CardContent className="p-6 text-muted-foreground">Loading association...</CardContent>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <div />
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Amenity
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Amenity</DialogTitle>
                  </DialogHeader>
                  <AmenityForm
                    mode="create"
                    onSubmit={handleCreate}
                    onCancel={() => setIsCreateOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {amenitiesLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="h-60 animate-pulse" />
                ))
              ) : amenities.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-muted-foreground">
                    No amenities yet. Click "New Amenity" to create one.
                  </CardContent>
                </Card>
              ) : (
                amenities.map((amenity: any) => (
                  <AmenityCard
                    key={amenity.id}
                    amenity={amenity}
                    onEdit={() => setEditingAmenity(amenity)}
                    onDelete={() => handleDelete(amenity.id)}
                    onUpdate={(updates) => handleUpdate(amenity.id, updates)}
                  />
                ))
              )}
            </div>

            <Dialog open={!!editingAmenity} onOpenChange={(open) => !open && setEditingAmenity(null)}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Amenity</DialogTitle>
                </DialogHeader>
                {editingAmenity && (
                  <AmenityForm
                    mode="edit"
                    amenity={editingAmenity}
                    onSubmit={(updates, imageFile) => {
                      const payload: any = { ...updates };
                      // If we have an image file, upload then update with image_url
                      const doUpdate = async () => {
                        if (imageFile) {
                          try {
                            const { supabase } = await import('@/integrations/supabase/client');
                            const filePath = `${editingAmenity.association_id}/${editingAmenity.id}/${Date.now()}_${imageFile.name}`;
                            const { error: uploadErr } = await supabase.storage
                              .from('amenity_images')
                              .upload(filePath, imageFile, { upsert: true });
                            if (uploadErr) throw uploadErr;
                            const { data: publicUrlData } = supabase.storage.from('amenity_images').getPublicUrl(filePath);
                            payload.image_url = publicUrlData.publicUrl;
                          } catch (err: any) {
                            console.error('Image upload failed', err);
                            toast.error('Image upload failed.');
                          }
                        }
                        handleUpdate(editingAmenity.id, payload);
                      };
                      doUpdate();
                    }}
                    onCancel={() => setEditingAmenity(null)}
                  />
                )}
              </DialogContent>
            </Dialog>
          </>
        )}
      </PageTemplate>
    </AppLayout>
  );
};

export default AmenitiesPage;
