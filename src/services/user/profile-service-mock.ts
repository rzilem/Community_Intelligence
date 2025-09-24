// Mock implementation for profile service

export interface UserSettings {
  user_id: string;
  theme: string;
  notifications_enabled: boolean;
  column_preferences?: any;
}

const mockUserSettings: Record<string, UserSettings> = {
  'user-1': {
    user_id: 'user-1',
    theme: 'light',
    notifications_enabled: true,
    column_preferences: {}
  }
};

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return mockUserSettings[userId] || {
    user_id: userId,
    theme: 'system',
    notifications_enabled: true,
    column_preferences: {}
  };
}

export async function updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<boolean> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (!mockUserSettings[userId]) {
    mockUserSettings[userId] = {
      user_id: userId,
      theme: 'system',
      notifications_enabled: true,
      column_preferences: {}
    };
  }
  
  Object.assign(mockUserSettings[userId], settings);
  console.log(`Updated settings for user ${userId}`);
  return true;
}