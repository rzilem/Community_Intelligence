
export interface CategoryMapping {
  bidRequestCategory: string;
  vendorSpecialties: string[];
  displayName: string;
  description: string;
}

export interface CategoryHierarchy {
  id: string;
  name: string;
  description: string;
  vendorSpecialties: string[];
  subcategories?: string[];
}
