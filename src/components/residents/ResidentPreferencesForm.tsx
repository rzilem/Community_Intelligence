
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useResidentPreferences } from '@/hooks/residents/useResidentPreferences';
import { ResidentPreferences } from '@/types/resident-types';

interface ResidentPreferencesFormProps {
  residentId: string;
}

export const ResidentPreferencesForm: React.FC<ResidentPreferencesFormProps> = ({ residentId }) => {
  const { preferences, fetchPreferences, updatePreferences } = useResidentPreferences(residentId);
  const [localPreferences, setLocalPreferences] = useState<ResidentPreferences>({});

  useEffect(() => {
    fetchPreferences();
  }, [residentId]);

  useEffect(() => {
    setLocalPreferences(preferences);
  }, [preferences]);

  const handleSave = () => {
    updatePreferences(localPreferences);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resident Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Notifications</h3>
          <div className="flex items-center space-x-2">
            <Switch
              checked={localPreferences.notifications?.email ?? true}
              onCheckedChange={(checked) => 
                setLocalPreferences(prev => ({
                  ...prev,
                  notifications: { 
                    ...prev.notifications, 
                    email: checked 
                  }
                }))
              }
            />
            <Label>Email Notifications</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={localPreferences.notifications?.sms ?? false}
              onCheckedChange={(checked) => 
                setLocalPreferences(prev => ({
                  ...prev,
                  notifications: { 
                    ...prev.notifications, 
                    sms: checked 
                  }
                }))
              }
            />
            <Label>SMS Notifications</Label>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Contact Preferences</h3>
          <div className="flex items-center space-x-2">
            <Select
              value={localPreferences.contactPreferences?.preferredContactMethod ?? 'email'}
              onValueChange={(value: 'email' | 'phone' | 'mail') => 
                setLocalPreferences(prev => ({
                  ...prev,
                  contactPreferences: {
                    ...prev.contactPreferences,
                    preferredContactMethod: value
                  }
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Contact Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="mail">Mail</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button onClick={handleSave}>Save Preferences</Button>
        </div>
      </CardContent>
    </Card>
  );
};
