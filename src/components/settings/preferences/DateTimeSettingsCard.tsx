
import React from 'react';
import { CalendarClock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateFormat, TimeFormat } from '@/types/settings-types';

interface DateTimeSettingsCardProps {
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  onDateFormatChange: (format: DateFormat) => void;
  onTimeFormatChange: (format: TimeFormat) => void;
}

const DateTimeSettingsCard: React.FC<DateTimeSettingsCardProps> = ({ 
  dateFormat, 
  timeFormat,
  onDateFormatChange,
  onTimeFormatChange
}) => {
  return (
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
            value={dateFormat} 
            onValueChange={(value) => onDateFormatChange(value as DateFormat)}
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
            value={timeFormat} 
            onValueChange={(value) => onTimeFormatChange(value as TimeFormat)}
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
  );
};

export default DateTimeSettingsCard;
