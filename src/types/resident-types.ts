
export interface ResidentPreferences {
  notifications?: {
    email?: boolean;
    sms?: boolean;
    inAppNotifications?: boolean;
  };
  contactPreferences?: {
    preferredContactMethod?: 'email' | 'phone' | 'mail';
    shareContactInfo?: boolean;
  };
  portalAccess?: {
    canViewDocuments?: boolean;
    canViewFinancials?: boolean;
    canPostInForum?: boolean;
  };
}
