
import { Resident, ResidentType } from '@/types/resident-types';
import { Property } from '@/types/property-types';
import { Association } from '@/types/association-types';
import { format } from 'date-fns';

/**
 * Available merge tag categories
 */
export type MergeTagCategory = 
  | 'resident' 
  | 'property' 
  | 'association' 
  | 'date'
  | 'payment'
  | 'compliance';

/**
 * Interface for a merge tag
 */
export interface MergeTag {
  id: string;
  category: MergeTagCategory;
  name: string;
  description: string;
  example: string;
}

/**
 * All available merge tags
 */
export const MERGE_TAGS: MergeTag[] = [
  // Resident Tags
  { 
    id: 'resident.first_name', 
    category: 'resident',
    name: 'First Name', 
    description: 'Resident\'s first name',
    example: 'John'
  },
  { 
    id: 'resident.last_name', 
    category: 'resident',
    name: 'Last Name', 
    description: 'Resident\'s last name',
    example: 'Smith'
  },
  { 
    id: 'resident.full_name', 
    category: 'resident',
    name: 'Full Name', 
    description: 'Resident\'s full name',
    example: 'John Smith'
  },
  { 
    id: 'resident.email', 
    category: 'resident',
    name: 'Email', 
    description: 'Resident\'s email address',
    example: 'john.smith@example.com'
  },
  { 
    id: 'resident.phone', 
    category: 'resident',
    name: 'Phone', 
    description: 'Resident\'s phone number',
    example: '(512) 555-1234'
  },
  { 
    id: 'resident.move_in_date', 
    category: 'resident',
    name: 'Move-In Date', 
    description: 'Date the resident moved in',
    example: '01/15/2022'
  },
  { 
    id: 'resident.resident_type', 
    category: 'resident',
    name: 'Resident Type', 
    description: 'Type of resident (owner, tenant, etc.)',
    example: 'Owner'
  },
  
  // Property Tags
  { 
    id: 'property.address', 
    category: 'property',
    name: 'Address', 
    description: 'Property street address',
    example: '123 Oak Lane'
  },
  { 
    id: 'property.unit', 
    category: 'property',
    name: 'Unit', 
    description: 'Property unit number',
    example: 'Unit 4B'
  },
  { 
    id: 'property.city', 
    category: 'property',
    name: 'City', 
    description: 'Property city',
    example: 'Austin'
  },
  { 
    id: 'property.state', 
    category: 'property',
    name: 'State', 
    description: 'Property state',
    example: 'Texas'
  },
  { 
    id: 'property.zip', 
    category: 'property',
    name: 'ZIP Code', 
    description: 'Property ZIP code',
    example: '78701'
  },
  { 
    id: 'property.full_address', 
    category: 'property',
    name: 'Full Address', 
    description: 'Complete property address',
    example: '123 Oak Lane, Unit 4B, Austin, TX 78701'
  },
  { 
    id: 'property.type', 
    category: 'property',
    name: 'Property Type', 
    description: 'Type of property',
    example: 'Condo'
  },
  { 
    id: 'property.square_feet', 
    category: 'property',
    name: 'Square Footage', 
    description: 'Property square footage',
    example: '1,250'
  },
  
  // Association Tags
  { 
    id: 'association.name', 
    category: 'association',
    name: 'Association Name', 
    description: 'Name of the HOA or association',
    example: 'Oakridge Estates'
  },
  { 
    id: 'association.email', 
    category: 'association',
    name: 'Association Email', 
    description: 'Primary contact email for the association',
    example: 'info@oakridgeestates.org'
  },
  { 
    id: 'association.phone', 
    category: 'association',
    name: 'Association Phone', 
    description: 'Primary contact phone for the association',
    example: '(512) 555-9000'
  },
  { 
    id: 'association.website', 
    category: 'association',
    name: 'Association Website', 
    description: 'Association website URL',
    example: 'www.oakridgeestates.org'
  },
  { 
    id: 'association.address', 
    category: 'association',
    name: 'Association Address', 
    description: 'Mailing address for the association',
    example: '500 Main Street, Suite 300, Austin, TX 78701'
  },
  
  // Date Tags
  { 
    id: 'date.current', 
    category: 'date',
    name: 'Current Date', 
    description: 'The current date',
    example: 'April 11, 2025'
  },
  { 
    id: 'date.current_month', 
    category: 'date',
    name: 'Current Month', 
    description: 'The current month name',
    example: 'April'
  },
  { 
    id: 'date.current_year', 
    category: 'date',
    name: 'Current Year', 
    description: 'The current year',
    example: '2025'
  },
  
  // Payment Tags
  { 
    id: 'payment.amount', 
    category: 'payment',
    name: 'Payment Amount', 
    description: 'Amount due for assessment or payment',
    example: '$350.00'
  },
  { 
    id: 'payment.due_date', 
    category: 'payment',
    name: 'Due Date', 
    description: 'Due date for payment',
    example: 'May 1, 2025'
  },
  { 
    id: 'payment.late_fee', 
    category: 'payment',
    name: 'Late Fee', 
    description: 'Late fee amount',
    example: '$25.00'
  },
  { 
    id: 'payment.past_due', 
    category: 'payment',
    name: 'Past Due Amount', 
    description: 'Total amount past due',
    example: '$725.00'
  },
  
  // Compliance Tags
  { 
    id: 'compliance.violation', 
    category: 'compliance',
    name: 'Violation Type', 
    description: 'Type of compliance violation',
    example: 'Landscaping'
  },
  { 
    id: 'compliance.fine', 
    category: 'compliance',
    name: 'Fine Amount', 
    description: 'Fine amount for violation',
    example: '$100.00'
  },
  { 
    id: 'compliance.deadline', 
    category: 'compliance',
    name: 'Compliance Deadline', 
    description: 'Deadline to resolve the violation',
    example: 'May 15, 2025'
  }
];

/**
 * Get merge tags by category
 */
export const getMergeTagsByCategory = (category: MergeTagCategory): MergeTag[] => {
  return MERGE_TAGS.filter(tag => tag.category === category);
};

/**
 * Replace merge tags in content with actual values
 */
export const replaceMergeTags = (
  content: string,
  data: {
    resident?: Partial<Resident> | any;
    property?: Partial<Property> | any;
    association?: Partial<Association> | any;
    payment?: { amount?: number; dueDate?: Date; lateFee?: number; pastDue?: number };
    compliance?: { violation?: string; fine?: number; deadline?: Date };
    [key: string]: any;
  }
): string => {
  let processedContent = content;

  // Process resident tags
  if (data.resident) {
    const resident = data.resident;
    processedContent = processedContent
      .replace(/\{resident\.first_name\}/g, resident.name?.split(' ')[0] || '')
      .replace(/\{resident\.last_name\}/g, resident.name?.split(' ').slice(1).join(' ') || '')
      .replace(/\{resident\.full_name\}/g, resident.name || '')
      .replace(/\{resident\.email\}/g, resident.email || '')
      .replace(/\{resident\.phone\}/g, resident.phone || '')
      .replace(/\{resident\.move_in_date\}/g, resident.move_in_date ? format(new Date(resident.move_in_date), 'MM/dd/yyyy') : '')
      .replace(/\{resident\.resident_type\}/g, resident.resident_type || '');
  }

  // Process property tags
  if (data.property) {
    const property = data.property;
    const fullAddress = [
      property.address,
      property.unit_number ? `Unit ${property.unit_number}` : '',
      property.city,
      property.state,
      property.zip
    ].filter(Boolean).join(', ');

    processedContent = processedContent
      .replace(/\{property\.address\}/g, property.address || '')
      .replace(/\{property\.unit\}/g, property.unit_number ? `Unit ${property.unit_number}` : '')
      .replace(/\{property\.city\}/g, property.city || '')
      .replace(/\{property\.state\}/g, property.state || '')
      .replace(/\{property\.zip\}/g, property.zip || '')
      .replace(/\{property\.full_address\}/g, fullAddress)
      .replace(/\{property\.type\}/g, property.property_type || '')
      .replace(/\{property\.square_feet\}/g, property.square_feet ? property.square_feet.toLocaleString() : '');
  }

  // Process association tags
  if (data.association) {
    const association = data.association;
    processedContent = processedContent
      .replace(/\{association\.name\}/g, association.name || '')
      .replace(/\{association\.email\}/g, association.contact_email || '')
      .replace(/\{association\.phone\}/g, association.phone || '')
      .replace(/\{association\.website\}/g, association.website || '')
      .replace(/\{association\.address\}/g, [
        association.address,
        association.city,
        association.state,
        association.zip
      ].filter(Boolean).join(', '));
  }

  // Process date tags
  const now = new Date();
  processedContent = processedContent
    .replace(/\{date\.current\}/g, format(now, 'MMMM d, yyyy'))
    .replace(/\{date\.current_month\}/g, format(now, 'MMMM'))
    .replace(/\{date\.current_year\}/g, format(now, 'yyyy'));

  // Process payment tags
  if (data.payment) {
    const payment = data.payment;
    processedContent = processedContent
      .replace(/\{payment\.amount\}/g, payment.amount ? `$${payment.amount.toFixed(2)}` : '')
      .replace(/\{payment\.due_date\}/g, payment.dueDate ? format(payment.dueDate, 'MMMM d, yyyy') : '')
      .replace(/\{payment\.late_fee\}/g, payment.lateFee ? `$${payment.lateFee.toFixed(2)}` : '')
      .replace(/\{payment\.past_due\}/g, payment.pastDue ? `$${payment.pastDue.toFixed(2)}` : '');
  }

  // Process compliance tags
  if (data.compliance) {
    const compliance = data.compliance;
    processedContent = processedContent
      .replace(/\{compliance\.violation\}/g, compliance.violation || '')
      .replace(/\{compliance\.fine\}/g, compliance.fine ? `$${compliance.fine.toFixed(2)}` : '')
      .replace(/\{compliance\.deadline\}/g, compliance.deadline ? format(compliance.deadline, 'MMMM d, yyyy') : '');
  }

  return processedContent;
};
