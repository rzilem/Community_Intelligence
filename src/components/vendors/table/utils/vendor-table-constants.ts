
export const COLUMN_WIDTHS = {
  selection: 'w-[40px]',
  name: 'w-[200px]',
  contact_person: 'w-[140px]',
  email: 'w-[240px]',
  phone: 'w-[130px]',
  specialties: 'w-[200px]',
  is_active: 'w-[80px]',
  total_jobs: 'w-[80px]',
  rating: 'w-[120px]'
} as const;

export const CELL_STYLES = {
  default: 'py-3',
  withFont: 'font-medium py-3',
  text: 'text-gray-700 py-3 text-sm',
  whitespace: 'py-3 whitespace-nowrap'
} as const;
