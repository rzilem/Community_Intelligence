// Mock implementation for column preferences service

export interface ColumnPreference {
  table: string;
  column: string;
  visible: boolean;
  order: number;
}

const mockColumnPreferences: Record<string, ColumnPreference[]> = {
  'user-1': [
    { table: 'properties', column: 'address', visible: true, order: 0 },
    { table: 'properties', column: 'owner', visible: true, order: 1 },
    { table: 'properties', column: 'status', visible: false, order: 2 }
  ]
};

export async function getUserColumnPreferences(userId: string, viewId: string): Promise<{ data?: string[]; error?: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return { data: ['column1', 'column2', 'column3'] };
}

export async function saveUserColumnPreferences(userId: string, viewId: string, columnIds: string[]): Promise<{ success: boolean; error?: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  console.log(`Saved column preferences for user ${userId}, view ${viewId}`);
  return { success: true };
}

export async function resetColumnPreferences(userId: string, table: string): Promise<boolean> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  if (mockColumnPreferences[userId]) {
    mockColumnPreferences[userId] = mockColumnPreferences[userId].filter(pref => pref.table !== table);
  }
  
  console.log(`Reset column preferences for user ${userId}, table ${table}`);
  return true;
}