
/**
 * Get image URL for a given bid request category
 */
export function getCategoryImageUrl(category: string): string {
  const defaultImageUrl = "/assets/images/placeholder-project.jpg";
  
  // Map categories to image URLs
  const categoryImageMap: Record<string, string> = {
    "Power Washing": "/assets/images/categories/power-washing.jpg",
    "Privacy Gate": "/assets/images/categories/privacy-gate.jpg",
    "Regular Maintenance": "/assets/images/categories/regular-maintenance.jpg",
    "Renovation Project": "/assets/images/categories/renovation.jpg",
    "Repair Work": "/assets/images/categories/repair-work.jpg",
    "Reserve Study": "/assets/images/categories/reserve-study.jpg",
    "Roof Repair / Replacement": "/assets/images/categories/roof-repair.jpg",
    "Roofing": "/assets/images/categories/roofing.jpg",
    "Signs": "/assets/images/categories/signs.jpg",
    "Sports Courts": "/assets/images/categories/sports-courts.jpg",
    "Street Repairs / Paving / Striping": "/assets/images/categories/street-repairs.jpg",
    "Stucco": "/assets/images/categories/stucco.jpg",
    "Towing": "/assets/images/categories/towing.jpg",
    "Trash Disposal": "/assets/images/categories/trash-disposal.jpg",
    "Trash Services": "/assets/images/categories/trash-services.jpg",
    "Welder": "/assets/images/categories/welder.jpg",
    "Window Services": "/assets/images/categories/window-services.jpg",
  };
  
  // Return the mapped image URL or the default if not found
  return categoryImageMap[category] || defaultImageUrl;
}
