/**
 * Replace merge tags in a string with values from a data object
 * @param text Text containing merge tags
 * @param data Object containing values to replace merge tags
 * @returns Text with merge tags replaced by actual values
 */
export function replaceMergeTags(text: string, data: Record<string, any>): string {
  if (!text) return '';
  
  // Pattern matches {{namespace.property}} format
  const tagPattern = /\{\{([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\}\}/g;
  
  return text.replace(tagPattern, (match, namespace, property) => {
    // Check if namespace exists in data
    if (!data[namespace]) {
      console.warn(`Merge tag namespace '${namespace}' not found`);
      return match; // Return original tag if namespace not found
    }
    
    // Check if property exists in namespace
    if (data[namespace][property] === undefined) {
      console.warn(`Property '${property}' not found in namespace '${namespace}'`);
      return match; // Return original tag if property not found
    }
    
    // Format date values
    if (data[namespace][property] instanceof Date) {
      return data[namespace][property].toLocaleDateString();
    }
    
    // Format currency values if property name suggests money
    if (
      ['amount', 'fee', 'fine', 'payment', 'balance', 'cost', 'price'].some(term => 
        property.toLowerCase().includes(term)
      ) && 
      typeof data[namespace][property] === 'number'
    ) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(data[namespace][property]);
    }
    
    // Return property value as string
    return String(data[namespace][property]);
  });
}

/**
 * Get all merge tags used in text
 * @param text Text to check for merge tags
 * @returns Array of found merge tags
 */
export function extractMergeTags(text: string): string[] {
  if (!text) return [];
  
  const tagPattern = /\{\{([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\}\}/g;
  const tags: string[] = [];
  let match;
  
  while ((match = tagPattern.exec(text)) !== null) {
    tags.push(match[0]);
  }
  
  return tags;
}

/**
 * Get available merge tags by category
 * @returns Object with merge tags grouped by category
 */
export function getAvailableMergeTags() {
  return {
    resident: [
      { tag: '{{resident.name}}', description: 'Full name of the resident' },
      { tag: '{{resident.email}}', description: 'Email address' },
      { tag: '{{resident.phone}}', description: 'Phone number' },
      { tag: '{{resident.move_in_date}}', description: 'Move-in date' },
      { tag: '{{resident.resident_type}}', description: 'Type (Owner/Tenant)' },
    ],
    property: [
      { tag: '{{property.address}}', description: 'Street address' },
      { tag: '{{property.unit_number}}', description: 'Unit/apartment number' },
      { tag: '{{property.city}}', description: 'City' },
      { tag: '{{property.state}}', description: 'State' },
      { tag: '{{property.zip}}', description: 'ZIP/Postal code' },
    ],
    association: [
      { tag: '{{association.name}}', description: 'Association name' },
      { tag: '{{association.contact_email}}', description: 'Contact email' },
      { tag: '{{association.phone}}', description: 'Phone number' },
      { tag: '{{association.website}}', description: 'Website URL' },
    ],
    payment: [
      { tag: '{{payment.amount}}', description: 'Payment amount' },
      { tag: '{{payment.dueDate}}', description: 'Due date' },
      { tag: '{{payment.lateFee}}', description: 'Late fee amount' },
      { tag: '{{payment.pastDue}}', description: 'Past due amount' },
    ],
    compliance: [
      { tag: '{{compliance.violation}}', description: 'Violation type' },
      { tag: '{{compliance.fine}}', description: 'Fine amount' },
      { tag: '{{compliance.deadline}}', description: 'Compliance deadline' },
    ],
  };
}

export const MERGE_TAGS = {
  resident: [
    { tag: '{{resident.name}}', description: 'Full name of the resident' },
    { tag: '{{resident.email}}', description: 'Email address' },
    { tag: '{{resident.phone}}', description: 'Phone number' },
    { tag: '{{resident.move_in_date}}', description: 'Move-in date' },
    { tag: '{{resident.resident_type}}', description: 'Type (Owner/Tenant)' }
  ],
  property: [
    { tag: '{{property.address}}', description: 'Property address' },
    { tag: '{{property.unit_number}}', description: 'Unit number' }
  ],
  association: [
    { tag: '{{association.name}}', description: 'Association name' },
    { tag: '{{association.contact_email}}', description: 'Contact email' }
  ]
};

export type MergeTagCategory = keyof typeof MERGE_TAGS;

export type MergeTag = {
  tag: string;
  description: string;
};

export const getMergeTagsByCategory = (category: MergeTagCategory): MergeTag[] => {
  return MERGE_TAGS[category] || [];
};
