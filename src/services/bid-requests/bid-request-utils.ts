
/**
 * Utility functions for bid request operations
 */

export const getCategoryImageUrl = (category: string): string => {
  const categoryImages: Record<string, string> = {
    landscaping: '/api/placeholder/400/200?text=Landscaping',
    maintenance: '/api/placeholder/400/200?text=Maintenance',
    roofing: '/api/placeholder/400/200?text=Roofing',
    plumbing: '/api/placeholder/400/200?text=Plumbing',
    electrical: '/api/placeholder/400/200?text=Electrical',
    hvac: '/api/placeholder/400/200?text=HVAC',
    painting: '/api/placeholder/400/200?text=Painting',
    cleaning: '/api/placeholder/400/200?text=Cleaning',
    security: '/api/placeholder/400/200?text=Security',
    default: '/api/placeholder/400/200?text=Project'
  };

  return categoryImages[category] || categoryImages.default;
};

export const formatBudgetRange = (min?: number, max?: number): string => {
  if (!min && !max) return 'Budget not specified';
  if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  if (min) return `From $${min.toLocaleString()}`;
  if (max) return `Up to $${max.toLocaleString()}`;
  return 'Budget not specified';
};

export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    draft: 'gray',
    published: 'blue',
    bidding: 'green',
    evaluating: 'yellow',
    awarded: 'purple',
    completed: 'green',
    cancelled: 'red'
  };

  return statusColors[status] || 'gray';
};

export const getPriorityColor = (priority: string): string => {
  const priorityColors: Record<string, string> = {
    low: 'gray',
    medium: 'blue',
    high: 'orange',
    urgent: 'red'
  };

  return priorityColors[priority] || 'gray';
};

export const validateBidRequestForm = (data: any): string[] => {
  const errors: string[] = [];

  if (!data.title?.trim()) {
    errors.push('Title is required');
  }

  if (data.budget_range_min && data.budget_range_max && data.budget_range_min > data.budget_range_max) {
    errors.push('Minimum budget cannot be greater than maximum budget');
  }

  if (data.preferred_start_date && data.required_completion_date) {
    const startDate = new Date(data.preferred_start_date);
    const endDate = new Date(data.required_completion_date);
    if (startDate > endDate) {
      errors.push('Start date cannot be after completion date');
    }
  }

  if (data.bid_deadline) {
    const deadline = new Date(data.bid_deadline);
    if (deadline < new Date()) {
      errors.push('Bid deadline cannot be in the past');
    }
  }

  return errors;
};
