
import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth';
import { useAmenities } from '@/hooks/amenities/useAmenities';
import { useAmenityBookings } from '@/hooks/amenities/useAmenityBookings';
import AmenitiesList from '@/components/amenities/AmenitiesList';
import AmenityBookingCalendar from '@/components/amenities/AmenityBookingCalendar';
import NewBookingDialog from '@/components/amenities/NewBookingDialog';
import NewAmenityDialog from '@/components/amenities/NewAmenityDialog';
import { Amenity } from '@/types/amenity-types';
import { Plus, Calendar } from 'lucide-react';
import { Tab, Tabs, TabList, TabPanel } from '@/components/ui/tabs';

const AmenityBookingPage = () => {
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isAmenityDialogOpen, setIsAmenityDialogOpen] = useState(false);
  const { currentAssociation, profile } = useAuth();
  
  const isAdmin = profile?.role === 'admin';
  
  const {
    amenities,
    isLoading: amenitiesLoading,
    createAmenity,
    updateAmenity,
    deleteAmenity
  } = useAmenities(currentAssociation?.id);
  
  const {
    bookings,
    isLoading: bookingsLoading,
    createBooking,
    cancelBooking
  } = useAmenityBookings(
    currentAssociation?.id,
    selectedAmenity?.id
  );

  const handleSelectAmenity = (amenity: Amenity) => {
    setSelectedAmenity(amenity);
  };

  const handleOpenBookingDialog = () => {
    setIsBookingDialogOpen(true);
  };

  const handleOpenNewAmenityDialog = () => {
    setIsAmenityDialogOpen(true);
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Amenity Booking</h1>
          <div className="flex gap-2">
            {selectedAmenity && (
              <Button onClick={handleOpenBookingDialog}>
                <Calendar className="mr-2 h-4 w-4" />
                Book {selectedAmenity.name}
              </Button>
            )}
            {isAdmin && (
              <Button onClick={handleOpenNewAmenityDialog}>
                <Plus className="mr-2 h-4 w-4" />
                New Amenity
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <AmenitiesList
                  amenities={amenities}
                  isLoading={amenitiesLoading}
                  selectedAmenityId={selectedAmenity?.id}
                  onSelectAmenity={handleSelectAmenity}
                  onDeleteAmenity={isAdmin ? deleteAmenity : undefined}
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedAmenity
                    ? `${selectedAmenity.name} Calendar`
                    : 'Select an amenity to view availability'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedAmenity ? (
                  <AmenityBookingCalendar
                    bookings={bookings}
                    isLoading={bookingsLoading}
                    onCancelBooking={cancelBooking}
                  />
                ) : (
                  <div className="flex justify-center items-center h-64 text-muted-foreground">
                    Please select an amenity from the list
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {selectedAmenity && (
          <NewBookingDialog
            open={isBookingDialogOpen}
            onOpenChange={setIsBookingDialogOpen}
            amenity={selectedAmenity}
            onSubmit={createBooking}
          />
        )}

        <NewAmenityDialog
          open={isAmenityDialogOpen}
          onOpenChange={setIsAmenityDialogOpen}
          onSubmit={createAmenity}
        />
      </div>
    </AppLayout>
  );
};

export default AmenityBookingPage;
