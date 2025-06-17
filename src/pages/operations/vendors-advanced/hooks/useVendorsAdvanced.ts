
import { useQuery } from '@tanstack/react-query';
import { vendorService } from '@/services/vendor-service';
import { useToast } from '@/components/ui/use-toast';

export const useVendorsAdvanced = () => {
  const { toast } = useToast();

  const { data: vendors = [], isLoading: isLoadingVendors, error: vendorsError } = useQuery({
    queryKey: ['vendors'],
    queryFn: vendorService.getVendors,
  });

  const { data: vendorStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['vendor-stats'],
    queryFn: vendorService.getVendorStats,
  });

  const handleSelectVendor = (vendorId: string) => {
    window.location.href = `/operations/vendors/${vendorId}`;
  };

  const handleVisitSave = (visitData: any) => {
    console.log('Saving visit data:', visitData);
    toast({
      title: "Visit Progress Saved",
      description: "Vendor visit information has been updated"
    });
  };

  const handleVisitComplete = (visit: any) => {
    console.log('Completing visit:', visit);
    toast({
      title: "Visit Completed",
      description: "Vendor visit has been marked as completed"
    });
  };

  return {
    vendors,
    vendorStats,
    isLoadingVendors,
    isLoadingStats,
    vendorsError,
    handleSelectVendor,
    handleVisitSave,
    handleVisitComplete
  };
};
