
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { vendorExtendedService } from "@/services/vendor-extended-service";
import { VendorAvailability } from "@/types/vendor-extended-types";
import { Clock, Save } from "lucide-react";

interface VendorAvailabilityTabProps {
  vendorId: string;
}

const VendorAvailabilityTab: React.FC<VendorAvailabilityTabProps> = ({ vendorId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: availability = [], isLoading } = useQuery({
    queryKey: ['vendor-availability', vendorId],
    queryFn: () => vendorExtendedService.getVendorAvailability(vendorId),
  });

  const [availabilityData, setAvailabilityData] = useState<
    Omit<VendorAvailability, 'id' | 'vendor_id' | 'created_at' | 'updated_at'>[]
  >([]);

  React.useEffect(() => {
    if (availability.length > 0) {
      setAvailabilityData(availability.map(av => ({
        day_of_week: av.day_of_week,
        start_time: av.start_time,
        end_time: av.end_time,
        is_available: av.is_available,
      })));
    } else {
      // Initialize with default availability (Monday-Friday 9AM-5PM)
      const defaultAvailability = Array.from({ length: 7 }, (_, index) => ({
        day_of_week: index,
        start_time: index >= 1 && index <= 5 ? '09:00' : null,
        end_time: index >= 1 && index <= 5 ? '17:00' : null,
        is_available: index >= 1 && index <= 5,
      }));
      setAvailabilityData(defaultAvailability);
    }
  }, [availability]);

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

  const handleAvailabilityChange = (dayIndex: number, field: string, value: any) => {
    setAvailabilityData(prev => 
      prev.map((day, index) => 
        index === dayIndex ? { ...day, [field]: value } : day
      )
    );
  };

  const handleSave = () => {
    updateAvailabilityMutation.mutate(availabilityData);
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading availability...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Business Hours & Availability</h3>
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
          {availabilityData.map((day, index) => (
            <div key={day.day_of_week} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-24">
                  <Label className="font-medium">{dayNames[day.day_of_week]}</Label>
                </div>
                <Switch
                  checked={day.is_available}
                  onCheckedChange={(checked) => 
                    handleAvailabilityChange(index, 'is_available', checked)
                  }
                />
                <Label className="text-sm text-gray-600">Available</Label>
              </div>
              
              {day.is_available && (
                <div className="flex items-center space-x-2">
                  <Label className="text-sm">From:</Label>
                  <Input
                    type="time"
                    value={day.start_time || ''}
                    onChange={(e) => 
                      handleAvailabilityChange(index, 'start_time', e.target.value)
                    }
                    className="w-32"
                  />
                  <Label className="text-sm">To:</Label>
                  <Input
                    type="time"
                    value={day.end_time || ''}
                    onChange={(e) => 
                      handleAvailabilityChange(index, 'end_time', e.target.value)
                    }
                    className="w-32"
                  />
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            variant="outline" 
            onClick={() => {
              const businessHours = availabilityData.map((day, index) => ({
                ...day,
                is_available: index >= 1 && index <= 5,
                start_time: index >= 1 && index <= 5 ? '09:00' : null,
                end_time: index >= 1 && index <= 5 ? '17:00' : null,
              }));
              setAvailabilityData(businessHours);
            }}
            className="mr-2"
          >
            Set Business Hours (Mon-Fri 9AM-5PM)
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              const allDay = availabilityData.map(day => ({
                ...day,
                is_available: true,
                start_time: '00:00',
                end_time: '23:59',
              }));
              setAvailabilityData(allDay);
            }}
            className="mr-2"
          >
            24/7 Availability
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              const unavailable = availabilityData.map(day => ({
                ...day,
                is_available: false,
                start_time: null,
                end_time: null,
              }));
              setAvailabilityData(unavailable);
            }}
          >
            Mark All Unavailable
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorAvailabilityTab;
