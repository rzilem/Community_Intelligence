
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import PageTemplate from '@/components/layout/PageTemplate';
import { MapPin, Users, Clock, DollarSign, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SmartBookingForm from '@/components/amenities/SmartBookingForm';

const amenityTypes = {
  pool: {
    name: 'Swimming Pool',
    icon: MapPin,
    description: 'Community swimming pool with heated water and deck area',
    capacity: 25,
    bookingFee: 50,
    hours: '6:00 AM - 10:00 PM',
    image: 'photo-1506744038136-46273834b3fb'
  },
  gym: {
    name: 'Fitness Center',
    icon: Users,
    description: 'Fully equipped fitness center with cardio and weight equipment',
    capacity: 15,
    bookingFee: 25,
    hours: '5:00 AM - 11:00 PM',
    image: 'photo-1472396961693-142e6e269027'
  },
  clubhouse: {
    name: 'Community Clubhouse',
    icon: Users,
    description: 'Multi-purpose clubhouse for events and gatherings',
    capacity: 100,
    bookingFee: 150,
    hours: '8:00 AM - 10:00 PM',
    image: 'photo-1721322800607-8c38375eef04'
  },
  tennis: {
    name: 'Tennis Court',
    icon: MapPin,
    description: 'Professional tennis court with lighting for evening play',
    capacity: 4,
    bookingFee: 30,
    hours: '6:00 AM - 10:00 PM',
    image: 'photo-1465146344425-f00d5f5c8f07'
  }
};

const AmenityDetailPage: React.FC = () => {
  const { amenityType } = useParams<{ amenityType: string }>();
  
  if (!amenityType || !amenityTypes[amenityType as keyof typeof amenityTypes]) {
    return <Navigate to="/amenities" replace />;
  }

  const amenity = amenityTypes[amenityType as keyof typeof amenityTypes];
  const IconComponent = amenity.icon;

  return (
    <PageTemplate
      title={amenity.name}
      icon={<IconComponent className="h-8 w-8" />}
      description={amenity.description}
    >
      <div className="space-y-6">
        {/* Amenity Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconComponent className="h-5 w-5" />
                  {amenity.name} Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <img 
                    src={`https://images.unsplash.com/${amenity.image}?w=800&h=400&fit=crop`}
                    alt={amenity.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <p className="text-muted-foreground">{amenity.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Capacity</p>
                      <p className="text-sm text-muted-foreground">{amenity.capacity} people</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Booking Fee</p>
                      <p className="text-sm text-muted-foreground">${amenity.bookingFee}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Hours</p>
                      <p className="text-sm text-muted-foreground">{amenity.hours}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        Available
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Now
                </Button>
                <Button variant="outline" className="w-full">
                  <Clock className="h-4 w-4 mr-2" />
                  Check Availability
                </Button>
                <Button variant="outline" className="w-full">
                  View Rules & Guidelines
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Booking Form */}
        <SmartBookingForm />
      </div>
    </PageTemplate>
  );
};

export default AmenityDetailPage;
