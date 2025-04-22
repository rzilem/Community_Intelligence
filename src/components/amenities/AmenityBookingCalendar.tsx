
import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, User, MapPin, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarEvent } from '@/types/calendar-types';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { format, isSameDay } from 'date-fns';
import { useAuth } from '@/contexts/auth';

interface AmenityBookingCalendarProps {
  bookings: CalendarEvent[];
  isLoading: boolean;
  onCancelBooking: (id: string) => Promise<boolean>;
}

const AmenityBookingCalendar: React.FC<AmenityBookingCalendarProps> = ({
  bookings,
  isLoading,
  onCancelBooking
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { user } = useAuth();
  
  // Filter bookings for the selected day
  const bookingsForDay = bookings
    .filter(booking => isSameDay(new Date(booking.start_time), selectedDate))
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  const handleCancelBooking = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      await onCancelBooking(id);
    }
  };

  // Get array of dates with bookings for highlighting in calendar
  const datesWithBookings = bookings.map(booking => new Date(booking.start_time));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          initialFocus
          className="rounded-md border"
          modifiers={{
            booked: datesWithBookings,
          }}
          modifiersStyles={{
            booked: { 
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              fontWeight: 'bold'
            }
          }}
        />
      </div>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center mb-4">
            <CalendarIcon className="mr-2 h-5 w-5" />
            <h3 className="text-lg font-medium">
              Bookings for {format(selectedDate, 'PP')}
            </h3>
          </div>
          
          {isLoading ? (
            <div className="py-8 text-center">Loading bookings...</div>
          ) : bookingsForDay.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No bookings for this date
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {bookingsForDay.map((booking) => (
                  <div 
                    key={booking.id} 
                    className="p-3 border rounded-md bg-card hover:bg-accent/10 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{booking.title}</h4>
                      
                      {user?.id === booking.booked_by && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex items-center mt-2 text-sm text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>
                        {format(new Date(booking.start_time), 'h:mm a')} - 
                        {format(new Date(booking.end_time), 'h:mm a')}
                      </span>
                    </div>
                    
                    {booking.location && (
                      <div className="flex items-center mt-1 text-sm text-muted-foreground">
                        <MapPin className="mr-2 h-4 w-4" />
                        <span>{booking.location}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="mr-2 h-4 w-4" />
                        <span>Booked by {booking.booked_by === user?.id ? 'you' : 'another user'}</span>
                      </div>
                      <Badge variant={booking.visibility === 'public' ? 'default' : 'outline'}>
                        {booking.visibility}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AmenityBookingCalendar;
