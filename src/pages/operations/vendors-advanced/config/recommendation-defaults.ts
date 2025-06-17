
export const DEFAULT_RECOMMENDATION_CRITERIA = {
  projectType: 'Plumbing',
  budget: 5000,
  timeline: 'this_week',
  priority: 'quality' as const
};

export const PROJECT_TYPES = [
  'Plumbing',
  'Electrical',
  'HVAC',
  'Landscaping',
  'Roofing'
];

export const TIMELINE_OPTIONS = [
  { value: 'urgent', label: 'Urgent (1-2 days)' },
  { value: 'this_week', label: 'This Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'flexible', label: 'Flexible' }
];

export const PRIORITY_OPTIONS = [
  { value: 'cost', label: 'Lowest Cost' },
  { value: 'quality', label: 'Highest Quality' },
  { value: 'speed', label: 'Fastest Delivery' },
  { value: 'reliability', label: 'Most Reliable' }
];
