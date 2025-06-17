
import { CategoryMapping, CategoryHierarchy } from '@/types/category-mapping-types';

// Mapping between bid request categories and vendor specialties
export const CATEGORY_MAPPINGS: CategoryMapping[] = [
  {
    bidRequestCategory: 'access_system',
    vendorSpecialties: ['Access Systems', 'Security'],
    displayName: 'Access Systems',
    description: 'Security and access control systems'
  },
  {
    bidRequestCategory: 'arborist',
    vendorSpecialties: ['Arborist', 'Tree Service', 'Landscaping'],
    displayName: 'Tree Care & Arborist',
    description: 'Tree care, pruning, and arborist services'
  },
  {
    bidRequestCategory: 'concrete',
    vendorSpecialties: ['Concrete', 'Masonry'],
    displayName: 'Concrete Work',
    description: 'Concrete installation, repair, and masonry'
  },
  {
    bidRequestCategory: 'construction',
    vendorSpecialties: ['Construction', 'General Maintenance', 'Repairs & Maintenance'],
    displayName: 'Construction & Major Projects',
    description: 'Large-scale construction and renovation projects'
  },
  {
    bidRequestCategory: 'cpa',
    vendorSpecialties: ['CPA', 'Professional Services'],
    displayName: 'Accounting Services',
    description: 'Certified Public Accountant and financial services'
  },
  {
    bidRequestCategory: 'electrical',
    vendorSpecialties: ['Electrical Services'],
    displayName: 'Electrical Work',
    description: 'Electrical systems, wiring, and fixtures'
  },
  {
    bidRequestCategory: 'hvac',
    vendorSpecialties: ['Heating and Air', 'HVAC'],
    displayName: 'HVAC Systems',
    description: 'Heating, ventilation, and air conditioning'
  },
  {
    bidRequestCategory: 'fencing',
    vendorSpecialties: ['Fence Maintenance'],
    displayName: 'Fencing',
    description: 'Fence installation, repair, and maintenance'
  },
  {
    bidRequestCategory: 'landscaping',
    vendorSpecialties: ['Landscape', 'Landscaping Maintenance', 'Irrigation'],
    displayName: 'Landscaping',
    description: 'Landscaping, grounds maintenance, and irrigation'
  },
  {
    bidRequestCategory: 'painting',
    vendorSpecialties: ['Interior Painting', 'Exterior Painting'],
    displayName: 'Painting',
    description: 'Interior and exterior painting services'
  },
  {
    bidRequestCategory: 'pest_control',
    vendorSpecialties: ['Pest Control'],
    displayName: 'Pest Control',
    description: 'Pest management and extermination services'
  },
  {
    bidRequestCategory: 'plumbing',
    vendorSpecialties: ['Plumbing'],
    displayName: 'Plumbing',
    description: 'Plumbing installation, repair, and maintenance'
  },
  {
    bidRequestCategory: 'pool_service',
    vendorSpecialties: ['Pool & Spa Services', 'Pool Maintenance'],
    displayName: 'Pool & Spa Services',
    description: 'Swimming pool and spa maintenance and repair'
  },
  {
    bidRequestCategory: 'power_washing',
    vendorSpecialties: ['Pressure Washing'],
    displayName: 'Pressure Washing',
    description: 'Pressure washing and exterior cleaning'
  },
  {
    bidRequestCategory: 'roofing',
    vendorSpecialties: ['Roofing'],
    displayName: 'Roofing',
    description: 'Roof repair, replacement, and maintenance'
  },
  {
    bidRequestCategory: 'security',
    vendorSpecialties: ['Security', 'Security Surveillance Camera'],
    displayName: 'Security Services',
    description: 'Security systems and surveillance'
  },
  {
    bidRequestCategory: 'trash_services',
    vendorSpecialties: ['Trash Removal', 'Trash Services', 'Garbage'],
    displayName: 'Waste Management',
    description: 'Trash collection and waste disposal services'
  },
  {
    bidRequestCategory: 'general_maintenance',
    vendorSpecialties: ['General Maintenance', 'Repairs & Maintenance', 'Miscellaneous'],
    displayName: 'General Maintenance',
    description: 'General repairs and property maintenance'
  }
];

// Hierarchical category structure
export const CATEGORY_HIERARCHY: CategoryHierarchy[] = [
  {
    id: 'maintenance',
    name: 'Maintenance & Repairs',
    description: 'General maintenance and repair services',
    vendorSpecialties: ['General Maintenance', 'Repairs & Maintenance', 'Miscellaneous']
  },
  {
    id: 'construction',
    name: 'Construction & Building',
    description: 'Construction and major building projects',
    vendorSpecialties: ['Construction', 'Concrete', 'Masonry', 'Roofing']
  },
  {
    id: 'mechanical',
    name: 'Mechanical Systems',
    description: 'HVAC, plumbing, and electrical systems',
    vendorSpecialties: ['Heating and Air', 'Plumbing', 'Electrical Services']
  },
  {
    id: 'landscaping',
    name: 'Landscaping & Grounds',
    description: 'Outdoor maintenance and landscaping',
    vendorSpecialties: ['Landscape', 'Landscaping Maintenance', 'Irrigation', 'Tree Service', 'Arborist']
  },
  {
    id: 'cleaning',
    name: 'Cleaning & Sanitation',
    description: 'Cleaning and maintenance services',
    vendorSpecialties: ['Cleaning', 'Pressure Washing', 'Trash Removal', 'Pest Control']
  },
  {
    id: 'security',
    name: 'Security & Access',
    description: 'Security systems and access control',
    vendorSpecialties: ['Security', 'Access Systems', 'Security Surveillance Camera']
  },
  {
    id: 'professional',
    name: 'Professional Services',
    description: 'Legal, accounting, and consulting services',
    vendorSpecialties: ['CPA', 'Professional Services', 'Attorney']
  }
];

// Utility functions
export const getBidRequestCategoriesForVendorSpecialty = (specialty: string): string[] => {
  return CATEGORY_MAPPINGS
    .filter(mapping => mapping.vendorSpecialties.includes(specialty))
    .map(mapping => mapping.bidRequestCategory);
};

export const getVendorSpecialtiesForBidRequestCategory = (category: string): string[] => {
  const mapping = CATEGORY_MAPPINGS.find(m => m.bidRequestCategory === category);
  return mapping ? mapping.vendorSpecialties : [];
};

export const getCategoryDisplayName = (category: string): string => {
  const mapping = CATEGORY_MAPPINGS.find(m => m.bidRequestCategory === category);
  return mapping ? mapping.displayName : category;
};

export const getAllBidRequestCategories = (): string[] => {
  return CATEGORY_MAPPINGS.map(mapping => mapping.bidRequestCategory);
};

export const getAllVendorSpecialties = (): string[] => {
  const specialties = new Set<string>();
  CATEGORY_MAPPINGS.forEach(mapping => {
    mapping.vendorSpecialties.forEach(specialty => specialties.add(specialty));
  });
  return Array.from(specialties).sort();
};
