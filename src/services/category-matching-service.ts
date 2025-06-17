
import { 
  CATEGORY_MAPPINGS, 
  getBidRequestCategoriesForVendorSpecialty,
  getVendorSpecialtiesForBidRequestCategory,
  getCategoryDisplayName 
} from '@/constants/category-mappings';
import { Vendor } from '@/types/vendor-types';

export interface VendorCategoryMatch {
  vendor: Vendor;
  matchingSpecialties: string[];
  matchScore: number;
}

export class CategoryMatchingService {
  /**
   * Find vendors that match a specific bid request category
   */
  static findMatchingVendors(vendors: Vendor[], bidRequestCategory: string): VendorCategoryMatch[] {
    const targetSpecialties = getVendorSpecialtiesForBidRequestCategory(bidRequestCategory);
    
    if (!targetSpecialties.length) {
      return [];
    }

    const matches: VendorCategoryMatch[] = [];

    vendors.forEach(vendor => {
      if (!vendor.specialties || !vendor.is_active) {
        return;
      }

      const matchingSpecialties = vendor.specialties.filter(specialty => 
        targetSpecialties.includes(specialty)
      );

      if (matchingSpecialties.length > 0) {
        const matchScore = matchingSpecialties.length / targetSpecialties.length;
        matches.push({
          vendor,
          matchingSpecialties,
          matchScore
        });
      }
    });

    // Sort by match score (highest first)
    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Get recommended categories for a vendor based on their specialties
   */
  static getRecommendedCategoriesForVendor(vendor: Vendor): string[] {
    if (!vendor.specialties) {
      return [];
    }

    const categories = new Set<string>();
    
    vendor.specialties.forEach(specialty => {
      const matchingCategories = getBidRequestCategoriesForVendorSpecialty(specialty);
      matchingCategories.forEach(category => categories.add(category));
    });

    return Array.from(categories);
  }

  /**
   * Calculate compatibility score between vendor and bid request category
   */
  static calculateCompatibilityScore(vendor: Vendor, bidRequestCategory: string): number {
    const targetSpecialties = getVendorSpecialtiesForBidRequestCategory(bidRequestCategory);
    
    if (!vendor.specialties || !targetSpecialties.length) {
      return 0;
    }

    const matchingSpecialties = vendor.specialties.filter(specialty => 
      targetSpecialties.includes(specialty)
    );

    return matchingSpecialties.length / targetSpecialties.length;
  }

  /**
   * Get category display information
   */
  static getCategoryInfo(category: string) {
    const mapping = CATEGORY_MAPPINGS.find(m => m.bidRequestCategory === category);
    return mapping ? {
      displayName: mapping.displayName,
      description: mapping.description,
      vendorSpecialties: mapping.vendorSpecialties
    } : null;
  }
}
