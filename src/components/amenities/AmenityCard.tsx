
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Pencil, Trash2 } from 'lucide-react';
import BookingSettingsEditor from './BookingSettingsEditor';
import AmenityBlackouts from './AmenityBlackouts';
import { useAmenityBookings } from '@/hooks/amenities/useAmenityBookings';

interface AmenityCardProps {
  amenity: any;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: (updates: any) => void;
}

const AmenityCard: React.FC<AmenityCardProps> = ({ amenity, onEdit, onDelete, onUpdate }) => {
  const { upcoming, loading } = useAmenityBookings(amenity?.id);

  const details = useMemo(() => {
    const items = [];
    if (amenity?.capacity) items.push(`${amenity.capacity} capacity`);
    if (amenity?.booking_fee) items.push(`$${Number(amenity.booking_fee).toFixed(2)} fee`);
    if (amenity?.requires_approval) items.push('Approval required');
    return items.join(' • ');
  }, [amenity]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {amenity?.image_url ? (
              <img
                src={amenity.image_url}
                alt={amenity.name}
                className="h-10 w-10 rounded object-cover border"
              />
            ) : (
              <div className="h-10 w-10 rounded bg-muted border" />
            )}
            <span>{amenity?.name}</span>
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant={amenity?.is_active === false ? 'secondary' : 'default'}>
              {amenity?.is_active === false ? 'Inactive' : 'Active'}
            </Badge>
            <Button size="icon" variant="outline" onClick={onEdit} title="Edit">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="destructive" onClick={onDelete} title="Delete">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {amenity?.description && (
          <p className="text-sm text-muted-foreground mt-2">{amenity.description}</p>
        )}
        {details && <p className="text-xs text-muted-foreground mt-1">{details}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant={amenity?.is_active === false ? 'default' : 'secondary'}
            onClick={() => onUpdate({ is_active: amenity?.is_active === false })}
          >
            {amenity?.is_active === false ? 'Activate' : 'Deactivate'}
          </Button>
        </div>

        <Separator />

        <div className="space-y-2">
          <h4 className="font-medium">Booking settings</h4>
          <BookingSettingsEditor
            amenityId={amenity.id}
            bookingSettings={amenity.booking_settings || {}}
            onSave={(settings) => onUpdate({ booking_settings: settings })}
          />
        </div>

        <Separator />

        <div className="space-y-2">
          <h4 className="font-medium">Blackout periods</h4>
          <AmenityBlackouts amenityId={amenity.id} />
        </div>

        <Separator />

        <div className="space-y-2">
          <h4 className="font-medium">Upcoming bookings</h4>
          <div className="space-y-2">
            {loading ? (
              <div className="h-16 rounded border animate-pulse bg-muted/50" />
            ) : upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming bookings.</p>
            ) : (
              upcoming.map((ev) => (
                <div key={ev.id} className="p-3 rounded border">
                  <div className="font-medium">{ev.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(ev.start_time).toLocaleString()} - {new Date(ev.end_time).toLocaleString()}
                    {ev.location ? ` • ${ev.location}` : ''}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AmenityCard;
