
import { mockVendors, vendorStats } from "@/data/vendors-data";
import { Vendor, VendorStats } from "@/types/vendor-types";

export const vendorService = {
  getVendors: async (): Promise<Vendor[]> => {
    // In a real implementation, this would fetch from an API
    return Promise.resolve(mockVendors);
  },

  getVendorById: async (id: string): Promise<Vendor | undefined> => {
    // In a real implementation, this would fetch a single vendor from an API
    return Promise.resolve(mockVendors.find(vendor => vendor.id === id));
  },

  getVendorStats: async (): Promise<VendorStats> => {
    // In a real implementation, this would fetch stats from an API
    return Promise.resolve(vendorStats);
  }
};
