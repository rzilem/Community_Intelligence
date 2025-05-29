
/**
 * Get the image URL for a project category
 */
export function getCategoryImageUrl(category: string): string {
  const categoryImages: Record<string, string> = {
    'landscaping': '/images/landscaping.jpg',
    'building-maintenance': '/images/maintenance.jpg',
    'pool-maintenance': '/images/pool.jpg',
    'roofing': '/images/roofing.jpg',
    'painting': '/images/painting.jpg',
    'cleaning': '/images/cleaning.jpg',
    'hvac': '/images/hvac.jpg',
    'plumbing': '/images/plumbing.jpg',
    'electrical': '/images/electrical.jpg',
    'security': '/images/security.jpg'
  };

  return categoryImages[category] || '/images/default-project.jpg';
}

/**
 * Format priority for display
 */
export function formatPriority(priority: string): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

/**
 * Get priority color class
 */
export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    'low': 'text-green-600',
    'medium': 'text-yellow-600',
    'high': 'text-orange-600',
    'urgent': 'text-red-600'
  };

  return colors[priority] || 'text-gray-600';
}
