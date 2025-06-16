
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageTemplate from '@/components/layout/PageTemplate';
import { Building2, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VendorProfileDetails from '@/components/vendors/VendorProfileDetails';
import VendorEditDialog from '@/components/vendors/VendorEditDialog';
import { vendorExtendedService } from '@/services/vendor-extended-service';
import { useToast } from '@/components/ui/use-toast';
import { ExtendedVendor } from '@/types/vendor-extended-types';

const VendorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: vendor, isLoading, isError } = useQuery({
    queryKey: ['vendor', id],
    queryFn: () => vendorExtendedService.getExtendedVendorById(id!),
    enabled: !!id,
  });

  const updateVendorMutation = useMutation({
    mutationFn: (updatedVendor: ExtendedVendor) => {
      // In a real implementation, this would call an API to update the vendor
      return Promise.resolve(updatedVendor);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor', id] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast({
        title: "Vendor updated",
        description: "The vendor information has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating vendor",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSaveVendor = (updatedVendor: ExtendedVendor) => {
    updateVendorMutation.mutate(updatedVendor);
  };

  const handleDelete = () => {
    // In a real app, this would call an API to delete the vendor
    toast({
      title: "Vendor deleted",
      description: "The vendor has been deleted successfully.",
    });
    navigate('/operations/vendors');
  };

  if (isLoading) {
    return (
      <PageTemplate 
        title="Vendor Profile" 
        icon={<Building2 className="h-8 w-8" />}
      >
        <div className="flex justify-center py-8">Loading vendor profile...</div>
      </PageTemplate>
    );
  }

  if (isError || !vendor) {
    return (
      <PageTemplate 
        title="Vendor Profile" 
        icon={<Building2 className="h-8 w-8" />}
      >
        <div className="flex flex-col items-center py-8">
          <p className="text-red-500 mb-4">Vendor not found or error loading vendor details.</p>
          <Button asChild>
            <Link to="/operations/vendors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Vendors
            </Link>
          </Button>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate 
      title="Vendor Profile" 
      icon={<Building2 className="h-8 w-8" />}
    >
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" asChild className="mr-auto">
            <Link to="/operations/vendors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Vendors
            </Link>
          </Button>
          <div className="ml-auto space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <VendorProfileDetails vendor={vendor} />

        <VendorEditDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          vendor={vendor}
          onSave={handleSaveVendor}
        />
      </div>
    </PageTemplate>
  );
};

export default VendorProfile;
