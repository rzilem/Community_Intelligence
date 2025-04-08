
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PageTemplate from '@/components/layout/PageTemplate';
import { Building2, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VendorProfileDetails from '@/components/vendors/VendorProfileDetails';
import { vendorService } from '@/services/vendor-service';
import { useToast } from '@/components/ui/use-toast';

const VendorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: vendor, isLoading, isError } = useQuery({
    queryKey: ['vendor', id],
    queryFn: () => vendorService.getVendorById(id!),
    enabled: !!id,
  });

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
            <Button variant="outline">
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
      </div>
    </PageTemplate>
  );
};

export default VendorProfile;
