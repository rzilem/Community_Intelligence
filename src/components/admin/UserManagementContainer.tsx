// Fix 1: src/components/admin/UserManagementContainer.tsx
// Add missing created_at property to mock users

const mockUsers: UserWithProfile[] = [
  {
    id: '1',
    email: 'admin@example.com',
    created_at: new Date().toISOString(), // Add this line
    profile: {
      id: '1',
      email: 'admin@example.com',
      first_name: 'John',
      last_name: 'Doe',
      role: 'admin' as const,
      phone_number: null,
      preferred_language: 'en',
      profile_image_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: '2',
    email: 'manager@example.com',
    created_at: new Date().toISOString(), // Add this line
    profile: {
      id: '2',
      email: 'manager@example.com',
      first_name: 'Jane',
      last_name: 'Smith',
      role: 'manager' as const,
      phone_number: null,
      preferred_language: 'en',
      profile_image_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
];

// Fix 2: src/components/reporting/ReportBuilder.tsx
// Add missing 'type' property to availableColumns

const availableColumns: ReportColumn[] = [
  { 
    field: 'property_number', 
    label: 'Property Number', 
    data_type: 'string', 
    is_visible: true,
    type: 'text' // Add this line
  },
  { 
    field: 'owner_name', 
    label: 'Owner Name', 
    data_type: 'string', 
    is_visible: true,
    type: 'text' // Add this line
  },
  { 
    field: 'assessment_amount', 
    label: 'Assessment Amount', 
    data_type: 'currency', 
    is_visible: true,
    type: 'currency' // Add this line
  },
  { 
    field: 'due_date', 
    label: 'Due Date', 
    data_type: 'date', 
    is_visible: true,
    type: 'date' // Add this line
  },
];

// Fix 3: src/contexts/auth/authUtils.ts
// Change 'associations' to 'association'

export async function createUserAssociation(
  userId: string,
  hoaId: string,
  role: string = 'resident'
): Promise<UserAssociation> {
  const { data, error } = await supabase
    .from('user_associations')
    .insert({
      user_id: userId,
      hoa_id: hoaId,
      role,
      association: { // Change from 'associations' to 'association'
        hoa_id: hoaId,
        role: role,
        permissions: getDefaultPermissions(role)
      }
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Fix 4: src/pages/user/UserProfile.tsx
// Change 'phone' to 'phone_number'

// In the UserProfile component, replace:
// profile.phone
// with:
// profile.phone_number

// Example fix in the component:
<div className="space-y-4">
  <div>
    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
    <input
      type="tel"
      value={profile.phone_number || ''} // Changed from profile.phone
      onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
    />
  </div>
</div>