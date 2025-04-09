
import React from 'react';
import { CalendarClock, Languages, DollarSign, Building, Settings2, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SystemPreferences, DateFormat, TimeFormat } from '@/types/settings-types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface SystemPreferencesTabProps {
  settings: SystemPreferences;
  onChange: (settings: Partial<SystemPreferences>) => void;
}

const SystemPreferencesTab: React.FC<SystemPreferencesTabProps> = ({ settings, onChange }) => {
  const handleSave = () => {
    toast.success("System preferences updated successfully");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            <CardTitle>Default Association</CardTitle>
          </div>
          <CardDescription>
            Select the default association to load on startup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select 
            value={settings.defaultAssociationId || ''} 
            onValueChange={(value) => onChange({ defaultAssociationId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select default association" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="assoc-1">Oakwood HOA</SelectItem>
              <SelectItem value="assoc-2">Pineview Community</SelectItem>
              <SelectItem value="assoc-3">Lakeshore Estates</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            <CardTitle>Date & Time</CardTitle>
          </div>
          <CardDescription>
            Configure date and time display formats
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="dateFormat">Date Format</Label>
            <Select 
              value={settings.defaultDateFormat} 
              onValueChange={(value) => onChange({ defaultDateFormat: value as DateFormat })}
            >
              <SelectTrigger id="dateFormat">
                <SelectValue placeholder="Select date format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="timeFormat">Time Format</Label>
            <Select 
              value={settings.defaultTimeFormat} 
              onValueChange={(value) => onChange({ defaultTimeFormat: value as TimeFormat })}
            >
              <SelectTrigger id="timeFormat">
                <SelectValue placeholder="Select time format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                <SelectItem value="24h">24-hour</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <CardTitle>Currency</CardTitle>
          </div>
          <CardDescription>
            Set the default currency for financial data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select 
            value={settings.defaultCurrency} 
            onValueChange={(value) => onChange({ defaultCurrency: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">US Dollar ($)</SelectItem>
              <SelectItem value="EUR">Euro (€)</SelectItem>
              <SelectItem value="GBP">British Pound (£)</SelectItem>
              <SelectItem value="CAD">Canadian Dollar (C$)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Languages className="h-5 w-5 text-primary" />
            <CardTitle>Language</CardTitle>
          </div>
          <CardDescription>
            Set the default language for the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select 
            value={settings.defaultLanguage} 
            onValueChange={(value) => onChange({ defaultLanguage: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="de">German</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            <CardTitle>Other Preferences</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="autoSave">Auto-save changes</Label>
            <Switch 
              id="autoSave" 
              checked={settings.autoSave}
              onCheckedChange={(checked) => onChange({ autoSave: checked })} 
            />
          </div>
          
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
            <Input 
              id="sessionTimeout" 
              type="number"
              min="5"
              max="480"
              value={settings.sessionTimeout}
              onChange={(e) => onChange({ sessionTimeout: parseInt(e.target.value, 10) })}
              className="max-w-[180px]"
            />
            <p className="text-xs text-muted-foreground">
              Set how long users can be inactive before being logged out
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemPreferencesTab;
