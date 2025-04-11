
export const templateService = {
  getImportTemplate: (dataType: string) => {
    const templates: Record<string, Record<string, string>> = {
      associations: {
        name: 'Association Name',
        address: 'Street Address',
        contact_email: 'Contact Email'
      },
      properties_owners: {
        // Property fields
        address: 'Street Address',
        unit_number: 'Unit Number',
        property_type: 'Property Type',
        city: 'City',
        state: 'State',
        zip: 'Zip Code',
        square_feet: 'Square Footage',
        bedrooms: 'Bedrooms',
        bathrooms: 'Bathrooms',
        // Owner fields
        first_name: 'First Name',
        last_name: 'Last Name',
        email: 'Email Address',
        phone: 'Phone Number',
        move_in_date: 'Move-in Date (YYYY-MM-DD)',
        closing_date: 'Closing Date (YYYY-MM-DD)',
        is_primary: 'Is Primary Owner (true/false)',
        emergency_contact: 'Emergency Contact'
      },
      financial: {
        property_id: 'Property ID',
        amount: 'Amount',
        due_date: 'Due Date (YYYY-MM-DD)',
        assessment_type_id: 'Assessment Type ID',
        late_fee: 'Late Fee Amount'
      },
      compliance: {
        property_id: 'Property ID',
        violation_type: 'Violation Type',
        description: 'Description',
        due_date: 'Due Date (YYYY-MM-DD)',
        fine_amount: 'Fine Amount'
      },
      maintenance: {
        property_id: 'Property ID',
        title: 'Title',
        description: 'Description',
        priority: 'Priority (low/medium/high)',
        status: 'Status (open/in_progress/completed)'
      },
      vendors: {
        name: 'Vendor Name',
        contactPerson: 'Contact Person',
        email: 'Email',
        phone: 'Phone Number',
        category: 'Service Category',
        status: 'Status (active/inactive)',
        hasInsurance: 'Has Insurance (true/false)'
      }
    };
    
    return templates[dataType] || {};
  }
};
