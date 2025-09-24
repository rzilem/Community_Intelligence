// Centralized Placeholder Data - Carefully crafted by Database Agent
// This provides consistent mock data across all components

export const PLACEHOLDER_HOA = {
  id: 'default-hoa',
  name: 'Sunset Valley HOA',
  portfolio_id: 'default-portfolio',
  total_units: 50,
  city: 'Austin',
  state: 'TX',
  zip_code: '78701',
  email: 'info@sunsetvalleyhoa.com',
  phone: '(512) 555-0100'
};

export const PLACEHOLDER_USER = {
  id: 'current-user',
  email: 'admin@sunsetvalleyhoa.com',
  first_name: 'Admin',
  last_name: 'User',
  role: 'administrator'
};

export const PLACEHOLDER_PROPERTIES = [
  {
    id: 'prop-1',
    hoa_id: 'default-hoa',
    unit_number: '101',
    street_address: '101 Sunset Drive',
    city: 'Austin',
    state: 'TX',
    zip_code: '78701',
    property_type: 'condo',
    property_status: 'occupied',
    square_footage: 1200,
    bedrooms: 2,
    bathrooms: 2,
    assessment_amount: 250.00
  },
  {
    id: 'prop-2',
    hoa_id: 'default-hoa',
    unit_number: '102',
    street_address: '102 Sunset Drive',
    city: 'Austin',
    state: 'TX',
    zip_code: '78701',
    property_type: 'condo',
    property_status: 'vacant',
    square_footage: 1200,
    bedrooms: 2,
    bathrooms: 2,
    assessment_amount: 250.00
  },
  {
    id: 'prop-3',
    hoa_id: 'default-hoa',
    unit_number: '201',
    street_address: '201 Valley Lane',
    city: 'Austin',
    state: 'TX',
    zip_code: '78701',
    property_type: 'townhouse',
    property_status: 'occupied',
    square_footage: 1800,
    bedrooms: 3,
    bathrooms: 2.5,
    assessment_amount: 325.00
  }
];

export const PLACEHOLDER_RESIDENTS = [
  {
    id: 'res-1',
    property_id: 'prop-1',
    hoa_id: 'default-hoa',
    first_name: 'John',
    last_name: 'Smith',
    email: 'john.smith@email.com',
    phone: '(512) 555-0101',
    is_owner: true,
    is_primary_contact: true,
    move_in_date: '2022-01-15'
  },
  {
    id: 'res-2',
    property_id: 'prop-2',
    hoa_id: 'default-hoa',
    first_name: 'Jane',
    last_name: 'Johnson',
    email: 'jane.johnson@email.com',
    phone: '(512) 555-0102',
    is_owner: true,
    is_primary_contact: true,
    move_in_date: '2021-06-20'
  }
];

export const PLACEHOLDER_VENDORS = [
  {
    id: 'vendor-1',
    hoa_id: 'default-hoa',
    company_name: 'Green Thumb Landscaping',
    contact_name: 'Mike Johnson',
    email: 'mike@greenthumb.com',
    phone: '(512) 555-2001',
    service_categories: ['landscaping', 'irrigation'],
    hourly_rate: 75.00,
    is_preferred: true,
    rating: 4.5
  },
  {
    id: 'vendor-2',
    hoa_id: 'default-hoa',
    company_name: 'Reliable Plumbing Services',
    contact_name: 'Sarah Martinez',
    email: 'sarah@reliableplumbing.com',
    phone: '(512) 555-2002',
    service_categories: ['plumbing', 'emergency'],
    hourly_rate: 125.00,
    is_preferred: true,
    rating: 4.8
  }
];

export const PLACEHOLDER_AMENITIES = [
  {
    id: 'amenity-1',
    hoa_id: 'default-hoa',
    name: 'Swimming Pool',
    description: 'Olympic size swimming pool',
    location: 'Recreation Center',
    capacity: 50,
    booking_required: false,
    is_active: true
  },
  {
    id: 'amenity-2',
    hoa_id: 'default-hoa',
    name: 'Tennis Courts',
    description: 'Two professional tennis courts',
    location: 'North Recreation Area',
    capacity: 4,
    booking_required: true,
    max_booking_duration_hours: 2,
    is_active: true
  },
  {
    id: 'amenity-3',
    hoa_id: 'default-hoa',
    name: 'Clubhouse',
    description: 'Community clubhouse with kitchen',
    location: 'Main Entrance',
    capacity: 100,
    booking_required: true,
    max_booking_duration_hours: 8,
    hourly_rate: 50.00,
    deposit_amount: 200.00,
    is_active: true
  }
];

export const PLACEHOLDER_DOCUMENTS = [
  {
    id: 'doc-1',
    hoa_id: 'default-hoa',
    category: 'Governance',
    name: 'CC&Rs',
    description: 'Covenants, Conditions & Restrictions',
    file_type: 'pdf',
    file_size: 2457600,
    version: 1,
    is_public: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'doc-2',
    hoa_id: 'default-hoa',
    category: 'Financial',
    name: 'Annual Budget 2025',
    description: 'Approved budget for fiscal year 2025',
    file_type: 'pdf',
    file_size: 1024000,
    version: 1,
    is_public: true,
    created_at: '2024-11-15T00:00:00Z'
  },
  {
    id: 'doc-3',
    hoa_id: 'default-hoa',
    category: 'Meetings',
    name: 'Board Meeting Minutes - September 2025',
    description: 'Minutes from the September board meeting',
    file_type: 'pdf',
    file_size: 512000,
    version: 1,
    is_public: true,
    created_at: '2025-09-20T00:00:00Z'
  }
];

export const PLACEHOLDER_COMMUNICATIONS = [
  {
    id: 'comm-1',
    hoa_id: 'default-hoa',
    type: 'announcement',
    title: 'Pool Maintenance Schedule',
    message: 'The pool will be closed for maintenance on October 1st from 8 AM to 12 PM.',
    status: 'sent',
    created_at: '2025-09-20T10:00:00Z'
  },
  {
    id: 'comm-2',
    hoa_id: 'default-hoa',
    type: 'newsletter',
    title: 'September Newsletter',
    message: 'Welcome to the September edition of our community newsletter...',
    status: 'draft',
    created_at: '2025-09-15T09:00:00Z'
  }
];

// Helper function to get placeholder data with delay (simulates API call)
export async function getPlaceholderData<T>(data: T, delay: number = 500): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
}

// Helper to check if we're using placeholder data
export function isUsingPlaceholderData(): boolean {
  // Check if we have a real Supabase connection
  const hasSupabaseUrl = import.meta.env.VITE_SUPABASE_URL && 
                         import.meta.env.VITE_SUPABASE_URL !== 'your_supabase_url';
  return !hasSupabaseUrl;
}