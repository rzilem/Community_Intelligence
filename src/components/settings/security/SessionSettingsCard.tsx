
import React from 'react';
import { Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SessionSettingsCardProps {
  sessionTimeout: number;
  passwordResetInterval: number;
  onSessionTimeoutChange: (value: number) => void;
  onPasswordResetIntervalChange: (value: number) => void;
}

const SessionSettingsCard: React.FC<SessionSettingsCardProps> = ({ 
  sessionTimeout, 
  passwordResetInterval,
  onSessionTimeoutChange,
  onPasswordResetIntervalChange
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <CardTitle>Session Settings</CardTitle>
        </div>
        <CardDescription>
          Control your session timeout and security settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="sessionTimeout">Session timeout</Label>
          <Select 
            value={sessionTimeout.toString()} 
            onValueChange={(value) => onSessionTimeoutChange(parseInt(value, 10))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeout" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
              <SelectItem value="120">2 hours</SelectItem>
              <SelectItem value="240">4 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="passwordReset">Password reset interval</Label>
          <Select 
            value={passwordResetInterval.toString()} 
            onValueChange={(value) => onPasswordResetIntervalChange(parseInt(value, 10))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="60">60 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="180">180 days</SelectItem>
              <SelectItem value="365">365 days</SelectItem>
              <SelectItem value="0">Never</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionSettingsCard;
