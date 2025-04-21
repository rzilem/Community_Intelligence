
import React, { useState } from 'react';
import { PortalPageLayout } from '@/components/portal/PortalPageLayout';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PortalNavigation } from '@/components/portal/PortalNavigation';
import { Badge } from '@/components/ui/badge';

// Sample calendar events
const eventsData = [
  { id: 1, title: 'Board Meeting', start: '2023-10-05T18:00:00', end: '2023-10-05T20:00:00', location: 'Community Center', type: 'community' },
  { id: 2, title: 'Pool Maintenance', start: '2023-10-10T09:00:00', end: '2023-10-10T12:00:00', location: 'Community Pool', type: 'maintenance' },
  { id: 3, title: 'Fall Festival', start: '2023-10-15T13:00:00', end: '2023-10-15T16:00:00', location: 'Community Park', type: 'community' },
  { id: 4, title: 'Pool Reservation', start: '2023-10-18T14:00:00', end: '2023-10-18T16:00:00', location: 'Community Pool', type: 'personal' },
];

// Sample amenities
const amenities = [
  { id: 1, name: 'Pool', description: 'Community swimming pool', image: 'pool.jpg' },
  { id: 2, name: 'Clubhouse', description: 'Multi-purpose community space', image: 'clubhouse.jpg' },
  { id: 3, name: 'Tennis Court', description: 'Tennis courts for residents', image: 'tennis.jpg' },
  { id: 4, name: 'BBQ Area', description: 'Outdoor grilling and picnic area', image: 'bbq.jpg' },
];

const CalendarPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState('calendar');
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState<any>(null);
  
  // Function to generate days for the current month
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay(); // Day of week (0-6)
    
    // Generate array of days
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      days.push({ day: null, date: null });
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      
      // Filter events for this day
      const dayEvents = eventsData.filter(event => {
        const eventDate = new Date(event.start);
        return eventDate.getDate() === i && 
               eventDate.getMonth() === month && 
               eventDate.getFullYear() === year;
      });
      
      days.push({ day: i, date, events: dayEvents });
    }
    
    return days;
  };

  const days = generateCalendarDays();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  const openBookingDialog = (amenity: any) => {
    setSelectedAmenity(amenity);
    setIsBookingDialogOpen(true);
  };

  return (
    <PortalPageLayout 
      title="Calendar & Events" 
      icon={<CalendarIcon className="h-6 w-6" />}
      description="Community calendar and amenity reservations"
      portalType="homeowner"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <PortalNavigation portalType="homeowner" />
        </div>
        
        <div className="lg:col-span-3 space-y-6">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="booking">Amenity Booking</TabsTrigger>
              </TabsList>
              
              {activeTab === 'calendar' && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={previousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="font-medium">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </span>
                  <Button variant="outline" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            <TabsContent value="calendar" className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-7 gap-1">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="text-center py-2 font-medium text-sm">
                        {day}
                      </div>
                    ))}
                    
                    {days.map((day, index) => (
                      <div 
                        key={index} 
                        className={`min-h-[100px] border rounded-md p-1 ${
                          day.day === null ? 'bg-gray-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        {day.day && (
                          <>
                            <div className="text-right text-sm mb-1">
                              {day.day}
                            </div>
                            <div className="space-y-1">
                              {day.events?.map((event) => (
                                <div 
                                  key={event.id} 
                                  className={`text-xs p-1 rounded truncate ${
                                    event.type === 'community' ? 'bg-blue-100 text-blue-800' : 
                                    event.type === 'maintenance' ? 'bg-amber-100 text-amber-800' : 
                                    'bg-green-100 text-green-800'
                                  }`}
                                >
                                  {event.title}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3">Upcoming Events</h3>
                  <div className="space-y-3">
                    {eventsData.map((event) => (
                      <div key={event.id} className="flex justify-between items-start border-b pb-2">
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.start).toLocaleDateString()} | {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-sm">{event.location}</p>
                        </div>
                        <Badge variant="outline" className={
                          event.type === 'community' ? 'bg-blue-50 text-blue-700' : 
                          event.type === 'maintenance' ? 'bg-amber-50 text-amber-700' : 
                          'bg-green-50 text-green-700'
                        }>
                          {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="booking">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-4">Reserve Community Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {amenities.map((amenity) => (
                      <div key={amenity.id} className="border rounded-lg overflow-hidden">
                        <div className="h-40 bg-gray-200"></div>
                        <div className="p-4">
                          <h4 className="font-medium">{amenity.name}</h4>
                          <p className="text-sm text-muted-foreground mb-4">{amenity.description}</p>
                          <Button onClick={() => openBookingDialog(amenity)}>
                            <Plus className="h-4 w-4 mr-1" />
                            Book Now
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Booking Dialog */}
      {selectedAmenity && (
        <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Book {selectedAmenity.name}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time">Time Slot</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9-11">9:00 AM - 11:00 AM</SelectItem>
                    <SelectItem value="11-1">11:00 AM - 1:00 PM</SelectItem>
                    <SelectItem value="1-3">1:00 PM - 3:00 PM</SelectItem>
                    <SelectItem value="3-5">3:00 PM - 5:00 PM</SelectItem>
                    <SelectItem value="5-7">5:00 PM - 7:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="guests">Number of Guests</Label>
                <Input id="guests" type="number" defaultValue="1" min="1" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Special Notes</Label>
                <Input id="notes" placeholder="Any special requests or notes" />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsBookingDialogOpen(false)}>Confirm Booking</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </PortalPageLayout>
  );
};

export default CalendarPage;
