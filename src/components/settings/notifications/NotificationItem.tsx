
import React from 'react';
import { Switch } from '@/components/ui/switch';

interface NotificationItemProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  title,
  description,
  icon,
  checked,
  onCheckedChange
}) => {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch 
        checked={checked} 
        onCheckedChange={onCheckedChange} 
      />
    </div>
  );
};

export default NotificationItem;
