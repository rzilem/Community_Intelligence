
import React from 'react';
import { Link } from 'react-router-dom';
import PageTemplate from '@/components/layout/PageTemplate';
import { MapPin, Calendar, Users, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import SmartBookingForm from '@/components/amenities/SmartBookingForm';
import AmenityBookingCalendar from '@/components/amenities/AmenityBookingCalendar';

const AmenitiesPage: React.FC = () => {
  return (
    <PageTemplate
      title="Smart Amenity Booking"
      icon={<MapPin className="h-8 w-8" />}
      description="Book amenities with smart scheduling and conflict resolution"
      actions={
        <Button asChild>
          <Link to="/amenities/browse">
            <Users className="h-4 w-4 mr-2" />
            Browse All Amenities
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        <Tabs defaultValue="booking" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="booking">Quick Book</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="manage">My Bookings</TabsTrigger>
          </TabsList>

          <TabsContent value="booking">
            <div className="space-y-6">
              {/* Quick Access Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Link to="/amenities/pool">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <MapPin className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <h3 className="font-semibold">Swimming Pool</h3>
                      <p className="text-sm text-muted-foreground">$50/booking</p>
                    </CardContent>
                  </Card>
                </Link>
                
                <Link to="/amenities/gym">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <h3 className="font-semibold">Fitness Center</h3>
                      <p className="text-sm text-muted-foreground">$25/booking</p>
                    </CardContent>
                  </Card>
                </Link>
                
                <Link to="/amenities/clubhouse">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                      <h3 className="font-semibold">Clubhouse</h3>
                      <p className="text-sm text-muted-foreground">$150/booking</p>
                    </CardContent>
                  </Card>
                </Link>
                
                <Link to="/amenities/tennis">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <MapPin className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                      <h3 className="font-semibold">Tennis Court</h3>
                      <p className="text-sm text-muted-foreground">$30/booking</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>

              <SmartBookingForm />
            </div>
          </TabsContent>

          <TabsContent value="calendar">
            <AmenityBookingCalendar />
          </TabsContent>

          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  My Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>You have no current bookings</p>
                  <Button className="mt-4" asChild>
                    <Link to="/amenities/browse">Browse Amenities</Link>
                  </Button>
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
