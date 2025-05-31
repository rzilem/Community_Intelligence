
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorService, VendorServiceType, VendorFormData } from '@/services/vendor-service';
import { toast } from 'sonner';

export function useVendors() {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: vendorService.getVendors,
  });
}

export function useVendor(id: string) {
  return useQuery({
    queryKey: ['vendor', id],
    queryFn: () => vendorService.getVendorById(id),
    enabled: !!id,
  });
}

export function useVendorStats() {
  return useQuery({
    queryKey: ['vendor-stats'],
    queryFn: vendorService.getVendorStats,
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vendorData: VendorFormData) => {
      return vendorService.createVendor(vendorData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-stats'] });
      toast.success('Vendor created successfully');
    },
    onError: (error) => {
      console.error('Failed to create vendor:', error);
      toast.error('Failed to create vendor');
    },
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<VendorServiceType> }) =>
      vendorService.updateVendor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-stats'] });
      toast.success('Vendor updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update vendor:', error);
      toast.error('Failed to update vendor');
    },
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vendorService.deleteVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-stats'] });
      toast.success('Vendor deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete vendor:', error);
      toast.error('Failed to delete vendor');
    },
  });
}
