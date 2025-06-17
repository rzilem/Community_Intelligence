
import { getAllBidRequestCategories, getCategoryDisplayName } from '@/constants/category-mappings';

// Get all available categories from the mapping system
const allCategories = getAllBidRequestCategories();

export const BID_REQUEST_CATEGORIES = allCategories.map(category => 
  getCategoryDisplayName(category)
) as const;

// Also export the category values for form validation
export const BID_REQUEST_CATEGORY_VALUES = allCategories as const;

export const BID_REQUEST_PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
] as const;
