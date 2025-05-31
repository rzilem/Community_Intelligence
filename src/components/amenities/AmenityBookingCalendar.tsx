
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, MapPin, CheckCircle } from 'lucide-react';
import { useAmenityBooking } from '@/hooks/amenities/useAmenityBooking';
import { AmenityBooking } from '@/types/amenity-types';
import { format } from 'date-fns';

interface AmenityBookingCalendarProps {
  amenityId?: string;
  onBookingSelect?: (booking: AmenityBooking) => void;
  onDateSelect?: (date: Date) => void;
  className?: string;
}

const AmenityBookingCalendar: React.FC<AmenityBookingCalendarProps> = ({
  amenityId,
  onBookingSelect,
  onDateSelect,
  className
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dayBookings, setDayBookings] = useState<AmenityBooking[]>([]);
  const { fetchBookings, isLoading } = useAmenityBooking();

  useEffect(() => {
    if (selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      fetchBookings(amenityId, dateStr).then((bookings) => {
        setDayBookings(bookings);
      });
    }
  }, [selectedDate, amenityId, fetchBookings]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      onDateSelect?.(date);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Bookings for {format(selectedDate, 'MMM d, yyyy')}
            {isLoading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dayBookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No bookings for this date</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dayBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onBookingSelect?.(booking)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={`${getStatusColor(booking.status)} text-white`}>
                      {getStatusIcon(booking.status)}
                      <span className="ml-1 capitalize">{booking.status}</span>
                    </Badge>
                    <span className="text-sm font-medium">
                      {booking.start_time} - {booking.end_time}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>Amenity ID: {booking.amenity_id}</span>
                    </div>
                    
                    {booking.guests_count && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{booking.guests_count} guests</span>
                      </div>
                    )}
                    
                    {booking.special_requests && (
                      <div className="text-xs text-gray-500 mt-1">
                        {booking.special_requests}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AmenityBookingCalendar;
