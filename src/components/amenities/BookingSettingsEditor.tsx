
import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface BookingSettings {
  openTime?: string; // "08:00"
  closeTime?: string; // "22:00"
  maxDurationHours?: number;
  allowConcurrent?: boolean;
}

interface BookingSettingsEditorProps {
  amenityId: string;
  bookingSettings: BookingSettings;
  onSave: (settings: BookingSettings) => void;
}

const BookingSettingsEditor: React.FC<BookingSettingsEditorProps> = ({
  amenityId,
  bookingSettings,
  onSave
}) => {
  const [settings, setSettings] = useState<BookingSettings>({
    openTime: '08:00',
    closeTime: '22:00',
    maxDurationHours: 2,
    allowConcurrent: false,
  });

  useEffect(() => {
    setSettings({
      openTime: bookingSettings?.openTime || '08:00',
      closeTime: bookingSettings?.closeTime || '22:00',
      maxDurationHours: bookingSettings?.maxDurationHours ?? 2,
      allowConcurrent: bookingSettings?.allowConcurrent ?? false,
    });
  }, [bookingSettings]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor={`open-${amenityId}`}>Open time</Label>
          <Input
            id={`open-${amenityId}`}
            type="time"
            value={settings.openTime}
            onChange={(e) => setSettings((s) => ({ ...s, openTime: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`close-${amenityId}`}>Close time</Label>
          <Input
            id={`close-${amenityId}`}
            type="time"
            value={settings.closeTime}
            onChange={(e) => setSettings((s) => ({ ...s, closeTime: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor={`dur-${amenityId}`}>Max duration (hours)</Label>
          <Input
            id={`dur-${amenityId}`}
            type="number"
            min={1}
            value={settings.maxDurationHours ?? 2}
            onChange={(e) => setSettings((s) => ({ ...s, maxDurationHours: Number(e.target.value) }))}
          />
        </div>
        <div className="flex items-center justify-between rounded-md border p-3 mt-6">
          <div>
            <Label htmlFor={`conc-${amenityId}`}>Allow concurrent bookings</Label>
          </div>
          <Switch
            id={`conc-${amenityId}`}
            checked={!!settings.allowConcurrent}
            onCheckedChange={(checked) => setSettings((s) => ({ ...s, allowConcurrent: checked }))}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => {
            onSave(settings);
            toast.success('Booking settings saved');
          }}
        >
          Save settings
        </Button>
      </div>
    </div>
  );
};

export default BookingSettingsEditor;
