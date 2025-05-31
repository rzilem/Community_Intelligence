
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, Users, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
import { useAmenityBooking } from '@/hooks/amenities/useAmenityBooking';
import { Amenity, BookingConflict } from '@/types/amenity-types';
import { format } from 'date-fns';

// Mock amenity data
const mockAmenity: Amenity = {
  id: 'pool-1',
  association_id: 'assoc-1',
  name: 'Community Pool',
  description: 'Main community swimming pool',
  capacity: 25,
  booking_fee: 50,
  requires_approval: false,
  availability_hours: '6:00 AM - 10:00 PM',
  amenity_type: 'pool',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

const SmartBookingForm: React.FC = () => {
  const { isLoading, createBooking, checkBookingConflicts } = useAmenityBooking();
  const [selectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [guestsCount, setGuestsCount] = useState('1');
  const [specialRequests, setSpecialRequests] = useState('');
  const [conflicts, setConflicts] = useState<BookingConflict[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  // Check for conflicts when times change
  useEffect(() => {
    if (startTime && endTime) {
      checkConflicts();
      generateAISuggestions();
    }
  }, [startTime, endTime]);

  const checkConflicts = async () => {
    if (!startTime || !endTime) return;

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const conflictResults = await checkBookingConflicts(
        mockAmenity.id,
        dateStr,
        startTime,
        endTime
      );
      setConflicts(conflictResults);
    } catch (error) {
      console.error('Error checking conflicts:', error);
    }
  };

  const generateAISuggestions = () => {
    const suggestions = [];
    
    // Time-based suggestions
    const hour = parseInt(startTime.split(':')[0]);
    if (hour < 8) {
      suggestions.push('Early morning bookings often have lower fees and better availability');
    } else if (hour >= 18) {
      suggestions.push('Evening slots are popular - consider booking in advance');
    }

    // Capacity suggestions
    const guests = parseInt(guestsCount);
    if (mockAmenity.capacity && guests > mockAmenity.capacity * 0.8) {
      suggestions.push('High guest count - ensure all attendees are registered');
    }

    // Weather-based suggestions (mock)
    if (mockAmenity.amenity_type === 'pool') {
      suggestions.push('Pool temperature is optimal between 2-6 PM');
    }

    setAiSuggestions(suggestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (conflicts.length > 0) {
      return; // Don't submit if there are conflicts
    }

    try {
      const bookingData = {
        amenity_id: mockAmenity.id,
        property_id: 'demo-property-id', // This would come from user context
        booking_date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: startTime,
        end_time: endTime,
        guests_count: parseInt(guestsCount),
        special_requests: specialRequests,
        total_fee: mockAmenity.booking_fee
      };

      await createBooking(bookingData);
      
      // Reset form
      setStartTime('');
      setEndTime('');
      setGuestsCount('1');
      setSpecialRequests('');
      setConflicts([]);
      setAiSuggestions([]);
    } catch (error) {
      // Error handled in hook
    }
  };

  const timeSlots = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Book {mockAmenity.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input value={format(selectedDate, 'MMM d, yyyy')} disabled />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="start-time">Start Time</Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select start time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end-time">End Time</Label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select end time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guests">Number of Guests</Label>
              <Select value={guestsCount} onValueChange={setGuestsCount}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: mockAmenity.capacity || 10 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      {i + 1} {i === 0 ? 'guest' : 'guests'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {mockAmenity.capacity && (
                <p className="text-xs text-muted-foreground">
                  Maximum capacity: {mockAmenity.capacity} guests
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Booking Fee</Label>
              <div className="flex items-center gap-2 p-2 border rounded">
                <span className="font-semibold">${mockAmenity.booking_fee?.toFixed(2) || '0.00'}</span>
                <Badge variant="outline">Per booking</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requests">Special Requests</Label>
            <Textarea
              id="requests"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Any special requirements or notes..."
              rows={3}
            />
          </div>

          {/* Conflict Detection */}
          {conflicts.length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <div className="space-y-2">
                  <p className="font-semibold">Booking Conflicts Detected:</p>
                  {conflicts.map((conflict, index) => (
                    <div key={index} className="text-sm">
                      • {conflict.message}
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && conflicts.length === 0 && (
            <Alert className="border-blue-200 bg-blue-50">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <div className="space-y-2">
                  <p className="font-semibold">AI Recommendations:</p>
                  {aiSuggestions.map((suggestion, index) => (
                    <div key={index} className="text-sm">
                      • {suggestion}
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Success indicator */}
          {startTime && endTime && conflicts.length === 0 && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Time slot is available! Ready to book.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading || !startTime || !endTime || conflicts.length > 0}
              className="flex-1"
            >
              {isLoading ? 'Booking...' : `Book ${mockAmenity.name}`}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SmartBookingForm;
