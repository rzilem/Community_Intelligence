
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SmartBookingForm from '@/components/amenities/SmartBookingForm';

const AmenitiesPage: React.FC = () => {
  return (
    <PageTemplate
      title="Smart Amenity Booking"
      icon={<MapPin className="h-8 w-8" />}
      description="Book amenities with smart scheduling and conflict resolution"
    >
      <div className="space-y-6">
        <Tabs defaultValue="booking" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="booking">Book Amenity</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="manage">Manage Amenities</TabsTrigger>
          </TabsList>

          <TabsContent value="booking">
            <SmartBookingForm />
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Amenity Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Calendar view will show all amenity bookings</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle>Amenity Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Manage amenity settings and availability</p>
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
