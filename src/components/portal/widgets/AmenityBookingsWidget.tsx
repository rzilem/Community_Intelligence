
import React from 'react';
import { Calendar } from 'lucide-react';
import DashboardWidget from '@/components/portal/DashboardWidget';

interface AmenityBookingsWidgetProps {
  widgetId?: string;
  saveSettings?: (settings: any) => Promise<void>;
  isLoading?: boolean;
  isSaving?: boolean;
  settings?: Record<string, any>;
}

const AmenityBookingsWidget: React.FC<AmenityBookingsWidgetProps> = ({ 
  widgetId, 
  saveSettings, 
  isLoading = false,
  isSaving = false,
  settings = {}
}) => {
  const handleSave = () => {
    if (saveSettings) {
      saveSettings({
        showUpcoming: true,
        daysAhead: 7,
        ...settings
      });
    }
  };

  const bookings = [
    { amenity: 'Pool', date: 'May 24, 2023', time: '2:00 PM - 4:00 PM' },
    { amenity: 'Clubhouse', date: 'May 26, 2023', time: '6:00 PM - 9:00 PM' },
    { amenity: 'Tennis Court', date: 'May 28, 2023', time: '10:00 AM - 12:00 PM' }
  ];

  return (
    <DashboardWidget 
      title="My Amenity Bookings" 
      widgetType="amenity-bookings"
      isLoading={isLoading}
      onSave={saveSettings ? handleSave : undefined}
      isSaving={isSaving}
    >
      <div className="space-y-4">
        {bookings.map((booking, i) => (
          <div key={i} className="flex items-start gap-3 border-b pb-3">
            <Calendar className="h-5 w-5 text-primary mt-1" />
            <div>
              <p className="font-semibold">{booking.amenity}</p>
              <p className="text-sm text-muted-foreground">{booking.date}</p>
              <p className="text-sm text-muted-foreground">{booking.time}</p>
            </div>
          </div>
        ))}
        <div className="flex gap-2 pt-2">
          <button className="flex-1 bg-primary text-white py-2 px-4 rounded">
            New Booking
          </button>
          <button className="flex-1 bg-secondary text-secondary-foreground py-2 px-4 rounded">
            View All
          </button>
        </div>
      </div>
    </DashboardWidget>
  );
};

export default AmenityBookingsWidget;
