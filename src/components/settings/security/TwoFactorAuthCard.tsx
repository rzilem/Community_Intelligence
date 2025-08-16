
import React from 'react';
import { TwoFactorAuth } from '@/components/security/TwoFactorAuth';

interface TwoFactorAuthCardProps {
  twoFactorEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const TwoFactorAuthCard: React.FC<TwoFactorAuthCardProps> = ({ 
  twoFactorEnabled, 
  onToggle 
}) => {
  return <TwoFactorAuth onStatusChange={onToggle} />;
};

export default TwoFactorAuthCard;
