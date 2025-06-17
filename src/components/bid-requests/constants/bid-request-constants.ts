
import { getAllBidRequestCategories, getCategoryDisplayName } from '@/constants/category-mappings';

// Get all available categories from the mapping system
const allCategories = getAllBidRequestCategories();

// Create the categories array with proper typing
export const BID_REQUEST_CATEGORIES = allCategories.map(category => 
  getCategoryDisplayName(category)
);

// Also export the category values for form validation
export const BID_REQUEST_CATEGORY_VALUES = allCategories;

export const BID_REQUEST_PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
] as const;
