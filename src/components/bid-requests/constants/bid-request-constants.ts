
export const BID_REQUEST_CATEGORIES = [
  'Landscaping',
  'Maintenance',
  'Repairs',
  'Construction',
  'Cleaning',
  'Security',
  'Pool & Spa',
  'HVAC',
  'Electrical',
  'Plumbing',
  'Roofing',
  'Painting',
  'Other'
] as const;

export const BID_REQUEST_PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
] as const;
