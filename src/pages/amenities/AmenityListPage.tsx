
import React from 'react';
import { Link } from 'react-router-dom';
import PageTemplate from '@/components/layout/PageTemplate';
import { MapPin, Users, Clock, DollarSign, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const amenities = [
  {
    id: 'pool',
    name: 'Swimming Pool',
    description: 'Community swimming pool with heated water and deck area',
    capacity: 25,
    bookingFee: 50,
    hours: '6:00 AM - 10:00 PM',
    image: 'photo-1506744038136-46273834b3fb',
    status: 'Available'
  },
  {
    id: 'gym',
    name: 'Fitness Center',
    description: 'Fully equipped fitness center with cardio and weight equipment',
    capacity: 15,
    bookingFee: 25,
    hours: '5:00 AM - 11:00 PM',
    image: 'photo-1472396961693-142e6e269027',
    status: 'Available'
  },
  {
    id: 'clubhouse',
    name: 'Community Clubhouse',
    description: 'Multi-purpose clubhouse for events and gatherings',
    capacity: 100,
    bookingFee: 150,
    hours: '8:00 AM - 10:00 PM',
    image: 'photo-1721322800607-8c38375eef04',
    status: 'Available'
  },
  {
    id: 'tennis',
    name: 'Tennis Court',
    description: 'Professional tennis court with lighting for evening play',
    capacity: 4,
    bookingFee: 30,
    hours: '6:00 AM - 10:00 PM',
    image: 'photo-1465146344425-f00d5f5c8f07',
    status: 'Maintenance'
  }
];

const AmenityListPage: React.FC = () => {
  return (
    <PageTemplate
      title="Community Amenities"
      icon={<MapPin className="h-8 w-8" />}
      description="Browse and book community amenities"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {amenities.map((amenity) => (
          <Card key={amenity.id} className="overflow-hidden">
            <div className="aspect-video bg-gray-100">
              <img 
                src={`https://images.unsplash.com/${amenity.image}?w=600&h=300&fit=crop`}
                alt={amenity.name}
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {amenity.name}
                </CardTitle>
                <Badge 
                  variant={amenity.status === 'Available' ? 'default' : 'secondary'}
                  className={amenity.status === 'Available' ? 'bg-green-500' : ''}
                >
                  {amenity.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">{amenity.description}</p>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span>{amenity.capacity}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-muted-foreground" />
                  <span>${amenity.bookingFee}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs">{amenity.hours}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <Link to={`/amenities/${amenity.id}`}>
                    View Details
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                {amenity.status === 'Available' && (
                  <Button variant="outline" asChild>
                    <Link to={`/amenities/${amenity.id}`}>
                      Book Now
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageTemplate>
  );
};

export default AmenityListPage;
