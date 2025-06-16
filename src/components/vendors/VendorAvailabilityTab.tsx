
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { vendorExtendedService } from "@/services/vendor-extended-service";
import { VendorAvailability } from "@/types/vendor-extended-types";
import { Clock, Save } from "lucide-react";

interface VendorAvailabilityTabProps {
  vendorId: string;
}

const DAYS_OF_WEEK = [
  { id: 0, name: 'Sunday', short: 'Sun' },
  { id: 1, name: 'Monday', short: 'Mon' },
  { id: 2, name: 'Tuesday', short: 'Tue' },
  { id: 3, name: 'Wednesday', short: 'Wed' },
  { id: 4, name: 'Thursday', short: 'Thu' },
  { id: 5, name: 'Friday', short: 'Fri' },
  { id: 6, name: 'Saturday', short: 'Sat' },
];

const VendorAvailabilityTab: React.FC<VendorAvailabilityTabProps> = ({ vendorId }) => {
  const [availability, setAvailability] = useState<Record<number, {
    is_available: boolean;
    start_time: string;
    end_time: string;
  }>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: existingAvailability = [], isLoading } = useQuery({
    queryKey: ['vendor-availability', vendorId],
    queryFn: () => vendorExtendedService.getVendorAvailability(vendorId),
    onSuccess: (data) => {
      // Initialize state with existing data
      const availabilityMap: typeof availability = {};
      DAYS_OF_WEEK.forEach(day => {
        const existing = data.find(av => av.day_of_week === day.id);
        availabilityMap[day.id] = {
          is_available: existing?.is_available ?? true,
          start_time: existing?.start_time ?? '09:00',
          end_time: existing?.end_time ?? '17:00',
        };
      });
      setAvailability(availabilityMap);
    }
  });

  const updateAvailabilityMutation = useMutation({
    mutationFn: (data: Omit<VendorAvailability, 'id' | 'vendor_id' | 'created_at' | 'updated_at'>[]) => 
      vendorExtendedService.updateVendorAvailability(vendorId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-availability', vendorId] });
      toast({ title: "Availability updated successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error updating availability", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Initialize availability state when existing data loads
  React.useEffect(() => {
    if (existingAvailability.length > 0) {
      const availabilityMap: typeof availability = {};
      DAYS_OF_WEEK.forEach(day => {
        const existing = existingAvailability.find(av => av.day_of_week === day.id);
        availabilityMap[day.id] = {
          is_available: existing?.is_available ?? true,
          start_time: existing?.start_time ?? '09:00',
          end_time: existing?.end_time ?? '17:00',
        };
      });
      setAvailability(availabilityMap);
    } else {
      // Set default availability for all days
      const defaultAvailability: typeof availability = {};
      DAYS_OF_WEEK.forEach(day => {
        defaultAvailability[day.id] = {
          is_available: day.id >= 1 && day.id <= 5, // Monday to Friday by default
          start_time: '09:00',
          end_time: '17:00',
        };
      });
      setAvailability(defaultAvailability);
    }
  }, [existingAvailability]);

  const handleAvailabilityChange = (dayId: number, field: string, value: any) => {
    setAvailability(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    const availabilityData = DAYS_OF_WEEK.map(day => ({
      day_of_week: day.id,
      is_available: availability[day.id]?.is_available ?? false,
      start_time: availability[day.id]?.is_available ? availability[day.id]?.start_time : null,
      end_time: availability[day.id]?.is_available ? availability[day.id]?.end_time : null,
    }));

    updateAvailabilityMutation.mutate(availabilityData);
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading availability...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Availability Schedule</h3>
        <Button onClick={handleSave} disabled={updateAvailabilityMutation.isPending}>
          <Save className="mr-2 h-4 w-4" />
          {updateAvailabilityMutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Weekly Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day.id} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-24">
                <Label className="font-medium">{day.name}</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  checked={availability[day.id]?.is_available ?? false}
                  onCheckedChange={(checked) => 
                    handleAvailabilityChange(day.id, 'is_available', checked)
                  }
                />
                <Label className="text-sm">Available</Label>
              </div>

              {availability[day.id]?.is_available && (
                <div className="flex items-center gap-2 ml-4">
                  <Label className="text-sm">From:</Label>
                  <Input
                    type="time"
                    value={availability[day.id]?.start_time ?? '09:00'}
                    onChange={(e) => 
                      handleAvailabilityChange(day.id, 'start_time', e.target.value)
                    }
                    className="w-32"
                  />
                  <Label className="text-sm">To:</Label>
                  <Input
                    type="time"
                    value={availability[day.id]?.end_time ?? '17:00'}
                    onChange={(e) => 
                      handleAvailabilityChange(day.id, 'end_time', e.target.value)
                    }
                    className="w-32"
                  />
                </div>
              )}

              {!availability[day.id]?.is_available && (
                <div className="ml-4 text-sm text-gray-500">
                  Unavailable
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-gray-600">
            <p className="mb-2"><strong>Note:</strong> This schedule represents the vendor's general availability.</p>
            <p>Specific job scheduling may require additional coordination with the vendor.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorAvailabilityTab;
