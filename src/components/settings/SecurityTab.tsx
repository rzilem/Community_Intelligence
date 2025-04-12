
import React from 'react';
import { SecuritySettings } from '@/types/settings-types';
import TwoFactorAuthCard from '@/components/settings/security/TwoFactorAuthCard';
import SessionSettingsCard from '@/components/settings/security/SessionSettingsCard';
import IPWhitelistCard from '@/components/settings/security/IPWhitelistCard';
import SecurityLogCard from '@/components/settings/security/SecurityLogCard';
import { toast } from 'sonner';

interface SecurityTabProps {
  settings: SecuritySettings;
  onChange: (settings: Partial<SecuritySettings>) => void;
}

const SecurityTab: React.FC<SecurityTabProps> = ({ settings, onChange }) => {
  const handleRemoveWhitelistItem = (ip: string) => {
    const updatedWhitelist = settings.ipWhitelist.filter(item => item !== ip);
    onChange({ ipWhitelist: updatedWhitelist });
    toast.success(`Removed ${ip} from IP whitelist`);
  };

  return (
    <div className="space-y-6">
      <TwoFactorAuthCard 
        twoFactorEnabled={settings.twoFactorAuth}
        onToggle={(checked) => onChange({ twoFactorAuth: checked })}
      />

      <SessionSettingsCard 
        sessionTimeout={settings.sessionTimeout}
        passwordResetInterval={settings.passwordResetInterval}
        onSessionTimeoutChange={(value) => onChange({ sessionTimeout: value })}
        onPasswordResetIntervalChange={(value) => onChange({ passwordResetInterval: value })}
      />

      <IPWhitelistCard 
        ipAddresses={settings.ipWhitelist}
        onRemoveIP={handleRemoveWhitelistItem}
      />

      <SecurityLogCard />
    </div>
  );
};

export default SecurityTab;
