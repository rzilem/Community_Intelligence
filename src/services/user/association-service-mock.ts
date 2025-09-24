// Mock implementation for user association service

export interface UserAssociation {
  id: string;
  name: string;
  role: string;
  joined_at: string;
}

const mockUserAssociations: UserAssociation[] = [
  {
    id: 'assoc-1',
    name: 'Sample HOA Community',
    role: 'resident',
    joined_at: new Date().toISOString()
  },
  {
    id: 'assoc-2',
    name: 'Another HOA',
    role: 'manager',
    joined_at: new Date().toISOString()
  }
];

export async function getUserAssociations(userId: string): Promise<UserAssociation[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  console.log(`Getting associations for user: ${userId}`);
  return [...mockUserAssociations];
}

export async function assignUserToAssociation(userId: string, associationId: string, role: string = 'resident'): Promise<boolean> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  console.log(`Assigning user ${userId} to association ${associationId} with role ${role}`);
  return true;
}

export async function getUsersInAssociation(associationId: string): Promise<any[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const mockUsers = [
    {
      id: 'user-1',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      role: 'resident',
      joined_at: new Date().toISOString()
    },
    {
      id: 'user-2',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@example.com',
      role: 'manager',
      joined_at: new Date().toISOString()
    }
  ];
  
  console.log(`Getting users for association: ${associationId}`);
  return mockUsers;
}