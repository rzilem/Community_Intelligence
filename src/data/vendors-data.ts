
import { Vendor, VendorStats } from "@/types/vendor-types";

export const mockVendors: Vendor[] = [
  {
    id: "v1",
    name: "1800 Ceiling.com DBA: ReCeil It International, Inc.",
    email: "sales@1800ceiling.com",
    phone: "(516) 221-1484",
    is_active: true,
    rating: 0.0,
    total_jobs: 0,
    completed_jobs: 0,
    specialties: [],
    hoa_id: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "v2",
    name: "1800Flowers.com",
    phone: "(800) 356-9377",
    is_active: true,
    rating: 0.0,
    total_jobs: 0,
    completed_jobs: 0,
    specialties: [],
    hoa_id: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "v3",
    name: "1st Call Security Solutions, LLC",
    email: "billing@1stcalltexas.com",
    phone: "(512) 522-6819",
    is_active: true,
    rating: 0.0,
    total_jobs: 0,
    completed_jobs: 0,
    specialties: [],
    hoa_id: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "v4",
    name: "1st Fire Safety, LLC DBA: 1st Fire Safety",
    email: "service@1stfiresafety.com",
    phone: "(512) 777-1555",
    is_active: true,
    rating: 0.0,
    total_jobs: 0,
    completed_jobs: 0,
    specialties: [],
    hoa_id: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "v5",
    name: "1st FP Austin llc",
    email: "trey@1stfpservices.com",
    phone: "(512) 312-9768",
    is_active: true,
    rating: 0.0,
    total_jobs: 0,
    completed_jobs: 0,
    specialties: [],
    hoa_id: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "v6",
    name: "1st Home and Commercial Services LLC",
    phone: "(512) 957-2992",
    is_active: true,
    rating: 0.0,
    total_jobs: 0,
    completed_jobs: 0,
    specialties: [],
    hoa_id: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const vendorStats: VendorStats = {
  totalVendors: mockVendors.length,
  activeVendors: mockVendors.filter(v => v.is_active).length,
  inactiveVendors: mockVendors.filter(v => !v.is_active).length,
  topCategory: null,
  serviceCategories: 0,
  withInsurance: 0
};
