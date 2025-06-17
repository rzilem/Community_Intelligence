
export interface AssociationTableColumn {
  id: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export const ASSOCIATION_TABLE_COLUMNS: AssociationTableColumn[] = [
  { id: 'name', label: 'Association Name', sortable: true },
  { id: 'property_type', label: 'Type', sortable: true },
  { id: 'location', label: 'Location', sortable: true },
  { id: 'contact_email', label: 'Contact', sortable: true },
  { id: 'status', label: 'Status', sortable: true },
  { id: 'total_units', label: 'Units', sortable: true, align: 'right' },
  { id: 'phone', label: 'Phone' },
  { id: 'created_at', label: 'Created', sortable: true },
  { id: 'founded_date', label: 'Founded', sortable: true },
  { id: 'insurance_expiration', label: 'Insurance Exp.' },
  { id: 'fire_inspection_due', label: 'Fire Insp. Due' },
  { id: 'actions', label: 'Actions', width: '100px' }
];

export const DEFAULT_VISIBLE_COLUMNS = [
  'name', 
  'property_type', 
  'location', 
  'contact_email', 
  'status', 
  'actions'
];
