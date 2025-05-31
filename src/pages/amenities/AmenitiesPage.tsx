
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { MapPin, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AmenityBookingCalendar from '@/components/amenities/AmenityBookingCalendar';
import SmartBookingForm from '@/components/amenities/SmartBookingForm';

const AmenitiesPage: React.FC = () => {
  const [selectedAmenity, setSelectedAmenity] = useState<string | undefined>();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showBookingForm, setShowBookingForm] = useState(false);

  // Mock amenities data
  const amenities = [
    {
      id: '1',
      association_id: 'demo-association',
      name: 'Swimming Pool',
      amenity_type: 'pool' as const,
      capacity: 50,
      description: 'Olympic-sized swimming pool with lifeguard',
      availability_hours: '6:00 AM - 10:00 PM',
      booking_fee: 25.00,
      location: 'Recreation Center',
      requires_approval: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      association_id: 'demo-association',
      name: 'Tennis Court',
      amenity_type: 'tennis_court' as const,
      capacity: 4,
      description: 'Professional tennis court with lighting',
      availability_hours: '6:00 AM - 11:00 PM',
      booking_fee: 15.00,
      location: 'Sports Complex',
      requires_approval: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      association_id: 'demo-association',
      name: 'Clubhouse',
      amenity_type: 'clubhouse' as const,
      capacity: 100,
      description: 'Multi-purpose event space with kitchen',
      availability_hours: '24/7',
      booking_fee: 100.00,
      location: 'Main Building',
      requires_approval: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const selectedAmenityData = amenities.find(a => a.id === selectedAmenity);

  return (
    <PageTemplate
      title="Smart Amenity Booking"
      icon={<MapPin className="h-8 w-8" />}
      description="AI-powered amenity booking with conflict resolution"
    >
      <div className="space-y-6">
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calendar">Booking Calendar</TabsTrigger>
            <TabsTrigger value="amenities">Manage Amenities</TabsTrigger>
            <TabsTrigger value="bookings">All Bookings</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Amenity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {amenities.map((amenity) => (
                    <Card
                      key={amenity.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedAmenity === amenity.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => {
                        setSelectedAmenity(amenity.id);
                        setShowBookingForm(false);
                      }}
                    >
                      <CardContent className="p-4">
                        <h3 className="font-semibold">{amenity.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{amenity.description}</p>
                        <div className="mt-2 space-y-1 text-xs text-gray-500">
                          <div>Capacity: {amenity.capacity} people</div>
                          <div>Hours: {amenity.availability_hours}</div>
                          <div>Fee: ${amenity.booking_fee}</div>
                          {amenity.requires_approval && (
                            <div className="text-amber-600">Requires approval</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {selectedAmenity && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AmenityBookingCalendar 
                  amenityId={selectedAmenity}
                  onDateSelect={setSelectedDate}
                />
                
                {selectedAmenityData && (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          onClick={() => setShowBookingForm(true)}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Book {selectedAmenityData.name}
                        </Button>
                      </CardContent>
                    </Card>
                    
                    {showBookingForm && (
                      <SmartBookingForm
                        amenity={selectedAmenityData}
                        selectedDate={selectedDate}
                        onBookingSuccess={() => setShowBookingForm(false)}
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="amenities" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Amenity Management</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Amenity
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {amenities.map((amenity) => (
                <Card key={amenity.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{amenity.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600">{amenity.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Capacity:</span>
                        <span>{amenity.capacity} people</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Booking Fee:</span>
                        <span>${amenity.booking_fee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Hours:</span>
                        <span className="text-right">{amenity.availability_hours}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Location:</span>
                        <span>{amenity.location}</span>
                      </div>
                      {amenity.requires_approval && (
                        <div className="flex justify-between">
                          <span>Approval:</span>
                          <span className="text-amber-600">Required</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Booking management interface with AI insights coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  );
};

export default AmenitiesPage;
