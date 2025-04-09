export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'converted' | 'lost';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source: string;
  status: LeadStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Additional fields
  association_name?: string;
  association_type?: string;
  current_management?: string;
  number_of_units?: number;
  first_name?: string;
  last_name?: string;
  street_address?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip?: string;
  uploaded_files?: any;
  additional_requirements?: string;
  html_content?: string;
}

export const LEAD_COLUMN_DEFINITIONS = [
  { id: 'name', label: 'Full Name', accessorKey: 'name', defaultVisible: true },
  { id: 'email', label: 'Email', accessorKey: 'email', defaultVisible: true },
  { id: 'association_name', label: 'Association Name', accessorKey: 'association_name', defaultVisible: true },
  { id: 'number_of_units', label: 'Units', accessorKey: 'number_of_units', defaultVisible: true },
  { id: 'street_address', label: 'Address', accessorKey: 'street_address', defaultVisible: true },
  { id: 'city', label: 'City', accessorKey: 'city', defaultVisible: true },
  { id: 'phone', label: 'Phone', accessorKey: 'phone', defaultVisible: true },
  { id: 'source', label: 'Source', accessorKey: 'source', defaultVisible: true },
  { id: 'status', label: 'Status', accessorKey: 'status', defaultVisible: true },
  { id: 'created_at', label: 'Created', accessorKey: 'created_at', defaultVisible: true },
  { id: 'company', label: 'Company', accessorKey: 'company', defaultVisible: false },
  { id: 'state', label: 'State', accessorKey: 'state', defaultVisible: false },
  
  // Other fields with defaultVisible set to false
  { id: 'association_type', label: 'Association Type', accessorKey: 'association_type', defaultVisible: false },
  { id: 'current_management', label: 'Current Management', accessorKey: 'current_management', defaultVisible: false },
  { id: 'first_name', label: 'First Name', accessorKey: 'first_name', defaultVisible: false },
  { id: 'last_name', label: 'Last Name', accessorKey: 'last_name', defaultVisible: false },
  { id: 'address_line2', label: 'Address Line 2', accessorKey: 'address_line2', defaultVisible: false },
  { id: 'zip', label: 'ZIP', accessorKey: 'zip', defaultVisible: false },
  { id: 'additional_requirements', label: 'Additional Requirements', accessorKey: 'additional_requirements', defaultVisible: false },
  { id: 'updated_at', label: 'Updated', accessorKey: 'updated_at', defaultVisible: false },
];
