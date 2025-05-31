
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { MapPin, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AmenityBookingCalendar from '@/components/amenities/AmenityBookingCalendar';

const AmenitiesPage: React.FC = () => {
  const [selectedAmenity, setSelectedAmenity] = useState<string | undefined>();

  // Mock amenities data
  const amenities = [
    {
      id: '1',
      name: 'Swimming Pool',
      type: 'pool',
      capacity: 50,
      description: 'Olympic-sized swimming pool with lifeguard',
      availability_hours: '6:00 AM - 10:00 PM',
      booking_fee: 25.00,
      location: 'Recreation Center'
    },
    {
      id: '2',
      name: 'Tennis Court',
      type: 'tennis_court',
      capacity: 4,
      description: 'Professional tennis court with lighting',
      availability_hours: '6:00 AM - 11:00 PM',
      booking_fee: 15.00,
      location: 'Sports Complex'
    },
    {
      id: '3',
      name: 'Clubhouse',
      type: 'clubhouse',
      capacity: 100,
      description: 'Multi-purpose event space with kitchen',
      availability_hours: '24/7',
      booking_fee: 100.00,
      location: 'Main Building'
    }
  ];

  return (
    <PageTemplate
      title="Amenities & Bookings"
      icon={<MapPin className="h-8 w-8" />}
      description="Manage amenity bookings and availability"
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
                      onClick={() => setSelectedAmenity(amenity.id)}
                    >
                      <CardContent className="p-4">
                        <h3 className="font-semibold">{amenity.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{amenity.description}</p>
                        <div className="mt-2 space-y-1 text-xs text-gray-500">
                          <div>Capacity: {amenity.capacity} people</div>
                          <div>Hours: {amenity.availability_hours}</div>
                          <div>Fee: ${amenity.booking_fee}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {selectedAmenity && (
              <AmenityBookingCalendar amenityId={selectedAmenity} />
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
                  <p>Booking management interface coming soon...</p>
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
