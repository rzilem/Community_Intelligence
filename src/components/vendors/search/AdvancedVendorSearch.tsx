
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { MapPin, Star, Clock, DollarSign, Filter, Save, Bell } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface AdvancedSearchFilters {
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // in miles
  };
  ratings: number[];
  specialties: string[];
  availability: 'any' | 'today' | 'this_week' | 'this_month';
  priceRange: [number, number];
  certifications: string[];
  responseTimeHours: number;
  verified: boolean;
  emergency24h: boolean;
}

interface AdvancedVendorSearchProps {
  onFiltersChange: (filters: AdvancedSearchFilters) => void;
  onSaveSearch?: (searchName: string, filters: AdvancedSearchFilters) => void;
  onCreateAlert?: (filters: AdvancedSearchFilters) => void;
}

const AdvancedVendorSearch: React.FC<AdvancedVendorSearchProps> = ({
  onFiltersChange,
  onSaveSearch,
  onCreateAlert
}) => {
  const { toast } = useToast();
  const [filters, setFilters] = useState<AdvancedSearchFilters>({
    ratings: [3, 5],
    specialties: [],
    availability: 'any',
    priceRange: [0, 10000],
    certifications: [],
    responseTimeHours: 24,
    verified: false,
    emergency24h: false
  });
  
  const [searchName, setSearchName] = useState('');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  const availableSpecialties = [
    'Plumbing', 'Electrical', 'HVAC', 'Landscaping', 'Roofing',
    'Painting', 'Flooring', 'Carpentry', 'Cleaning', 'Security'
  ];

  const availableCertifications = [
    'Licensed', 'Insured', 'Bonded', 'EPA Certified', 'OSHA Certified'
  ];

  useEffect(() => {
    // Get user's current location for geo-search
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Location access denied:', error);
        }
      );
    }
  }, []);

  const updateFilters = (newFilters: Partial<AdvancedSearchFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange(updated);
  };

  const toggleSpecialty = (specialty: string) => {
    const updated = filters.specialties.includes(specialty)
      ? filters.specialties.filter(s => s !== specialty)
      : [...filters.specialties, specialty];
    updateFilters({ specialties: updated });
  };

  const toggleCertification = (cert: string) => {
    const updated = filters.certifications.includes(cert)
      ? filters.certifications.filter(c => c !== cert)
      : [...filters.certifications, cert];
    updateFilters({ certifications: updated });
  };

  const handleLocationSearch = () => {
    if (!userLocation) {
      toast({
        title: "Location Required",
        description: "Please enable location access for geo-search",
        variant: "destructive"
      });
      return;
    }

    updateFilters({
      location: {
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        radius: 25 // default 25 miles
      }
    });
  };

  const handleSaveSearch = () => {
    if (!searchName.trim()) {
      toast({
        title: "Search Name Required",
        description: "Please enter a name for your saved search",
        variant: "destructive"
      });
      return;
    }

    onSaveSearch?.(searchName, filters);
    toast({
      title: "Search Saved",
      description: `"${searchName}" has been saved to your searches`
    });
    setSearchName('');
  };

  const handleCreateAlert = () => {
    onCreateAlert?.(filters);
    toast({
      title: "Alert Created",
      description: "You'll be notified when vendors matching these criteria become available"
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Advanced Vendor Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Location Search */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location-Based Search
          </Label>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleLocationSearch}
              disabled={!userLocation}
            >
              Search Near Me
            </Button>
            {filters.location && (
              <Badge variant="secondary">
                Within {filters.location.radius} miles
              </Badge>
            )}
          </div>
        </div>

        {/* Rating Filter */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Minimum Rating: {filters.ratings[0]} - {filters.ratings[1]} stars
          </Label>
          <Slider
            value={filters.ratings}
            onValueChange={(value) => updateFilters({ ratings: value })}
            min={1}
            max={5}
            step={0.5}
            className="w-full"
          />
        </div>

        {/* Specialties */}
        <div className="space-y-3">
          <Label>Specialties</Label>
          <div className="flex flex-wrap gap-2">
            {availableSpecialties.map(specialty => (
              <Badge
                key={specialty}
                variant={filters.specialties.includes(specialty) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleSpecialty(specialty)}
              >
                {specialty}
              </Badge>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Availability
          </Label>
          <Select value={filters.availability} onValueChange={(value: any) => updateFilters({ availability: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Time</SelectItem>
              <SelectItem value="today">Available Today</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
          </Label>
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => updateFilters({ priceRange: value as [number, number] })}
            min={0}
            max={20000}
            step={100}
            className="w-full"
          />
        </div>

        {/* Response Time */}
        <div className="space-y-3">
          <Label>Maximum Response Time: {filters.responseTimeHours} hours</Label>
          <Slider
            value={[filters.responseTimeHours]}
            onValueChange={(value) => updateFilters({ responseTimeHours: value[0] })}
            min={1}
            max={72}
            step={1}
            className="w-full"
          />
        </div>

        {/* Certifications */}
        <div className="space-y-3">
          <Label>Required Certifications</Label>
          <div className="flex flex-wrap gap-2">
            {availableCertifications.map(cert => (
              <Badge
                key={cert}
                variant={filters.certifications.includes(cert) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleCertification(cert)}
              >
                {cert}
              </Badge>
            ))}
          </div>
        </div>

        {/* Boolean Filters */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Verified Vendors Only</Label>
            <Switch
              checked={filters.verified}
              onCheckedChange={(checked) => updateFilters({ verified: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>24/7 Emergency Service</Label>
            <Switch
              checked={filters.emergency24h}
              onCheckedChange={(checked) => updateFilters({ emergency24h: checked })}
            />
          </div>
        </div>

        {/* Save Search & Alerts */}
        <div className="border-t pt-4 space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Search name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline" onClick={handleSaveSearch}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
          <Button variant="outline" onClick={handleCreateAlert} className="w-full">
            <Bell className="h-4 w-4 mr-2" />
            Create Alert for These Criteria
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedVendorSearch;
