// Mock implementation for profile service

import { ServiceResponse } from '../mocks/common-types';
import { BaseMockService } from '../mocks/base-mock-service';
import { UserRole } from '@/types/profile-types';

export interface UserSettings {
  user_id: string;
  theme: string;
  notifications_enabled: boolean;
  column_preferences?: any;
}

export interface UserProfile {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  profile_image_url?: string | null;
  phone?: string | null;
  created_at: string;
  updated_at: string;
}

class ProfileService extends BaseMockService {
  private mockUserSettings: Record<string, UserSettings> = {
    'user-1': {
      user_id: 'user-1',
      theme: 'light',
      notifications_enabled: true,
      column_preferences: {}
    }
  };

  private mockUserProfiles: Record<string, UserProfile> = {
    'user-1': {
      id: 'user-1',
      email: 'user@example.com',
      first_name: 'John',
      last_name: 'Doe',
      role: 'user',
      profile_image_url: null,
      phone: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  };

  async getUserSettings(userId: string): Promise<UserSettings | null> {
    this.logCall('ProfileService', 'getUserSettings', { userId });
    await this.simulateDelay();
    
    return this.mockUserSettings[userId] || {
      user_id: userId,
      theme: 'system',
      notifications_enabled: true,
      column_preferences: {}
    };
  }

  async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<ServiceResponse<boolean>> {
    this.logCall('ProfileService', 'updateUserSettings', { userId, settings });
    await this.simulateDelay(300);
    
    if (!this.mockUserSettings[userId]) {
      this.mockUserSettings[userId] = {
        user_id: userId,
        theme: 'system',
        notifications_enabled: true,
        column_preferences: {}
      };
    }
    
    Object.assign(this.mockUserSettings[userId], settings);
    return this.createResponse(true, true, undefined, 'Settings updated successfully');
  }

  async updateProfile(userId: string, profileData: Partial<UserProfile>): Promise<ServiceResponse<UserProfile>> {
    this.logCall('ProfileService', 'updateProfile', { userId, profileData });
    await this.simulateDelay(300);
    
    if (!this.mockUserProfiles[userId]) {
      this.mockUserProfiles[userId] = {
        id: userId,
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...profileData
      } as UserProfile;
    } else {
      Object.assign(this.mockUserProfiles[userId], {
        ...profileData,
        updated_at: new Date().toISOString()
      });
    }
    
    return this.createResponse(this.mockUserProfiles[userId], true, undefined, 'Profile updated successfully');
  }

  async updateUserPassword(userId: string, oldPassword: string, newPassword: string): Promise<ServiceResponse<boolean>> {
    this.logCall('ProfileService', 'updateUserPassword', { userId });
    await this.simulateDelay(400);
    
    // Mock password validation
    if (oldPassword === 'wrongpassword') {
      return this.createResponse(false, false, 'Current password is incorrect');
    }
    
    return this.createResponse(true, true, undefined, 'Password updated successfully');
  }
}

const profileService = new ProfileService();

// Export service instance
export { profileService };

// Export individual functions for backward compatibility
export const getUserSettings = profileService.getUserSettings.bind(profileService);
export const updateUserSettings = profileService.updateUserSettings.bind(profileService);
export const updateProfile = profileService.updateProfile.bind(profileService);
export const updateUserPassword = profileService.updateUserPassword.bind(profileService);

// Export aliases for maximum compatibility
export const fetchUserSettings = getUserSettings;
export const updateUserPreferences = updateUserSettings;