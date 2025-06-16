
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Camera, MapPin, Clock, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface VendorVisit {
  id: string;
  vendorId: string;
  visitType: 'inspection' | 'meeting' | 'site_visit' | 'delivery';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduledTime: string;
  location: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  photos: string[];
  notes: string;
  checklist: {
    item: string;
    completed: boolean;
    notes?: string;
  }[];
}

interface MobileVendorWorkflowProps {
  visit?: VendorVisit;
  onSave: (visit: Partial<VendorVisit>) => void;
  onComplete: (visit: VendorVisit) => void;
}

const MobileVendorWorkflow: React.FC<MobileVendorWorkflowProps> = ({
  visit,
  onSave,
  onComplete
}) => {
  const { toast } = useToast();
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [photos, setPhotos] = useState<string[]>(visit?.photos || []);
  const [notes, setNotes] = useState(visit?.notes || '');
  const [checklist, setChecklist] = useState(visit?.checklist || [
    { item: 'Vendor arrived on time', completed: false },
    { item: 'Work area prepared properly', completed: false },
    { item: 'Quality standards met', completed: false },
    { item: 'Clean-up completed', completed: false },
    { item: 'Documentation provided', completed: false }
  ]);

  const capturePhoto = async () => {
    try {
      // In a real implementation, this would use the device camera
      // For now, we'll simulate photo capture
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.capture = 'environment'; // Use rear camera on mobile
      
      fileInput.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const photoUrl = e.target?.result as string;
            setPhotos(prev => [...prev, photoUrl]);
            toast({
              title: "Photo Captured",
              description: "Photo added to visit documentation"
            });
          };
          reader.readAsDataURL(file);
        }
      };
      
      fileInput.click();
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera",
        variant: "destructive"
      });
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          toast({
            title: "Location Captured",
            description: "Current location recorded for visit"
          });
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Unable to get current location",
            variant: "destructive"
          });
        }
      );
    }
  };

  const toggleChecklistItem = (index: number) => {
    setChecklist(prev => prev.map((item, i) => 
      i === index ? { ...item, completed: !item.completed } : item
    ));
  };

  const addChecklistNote = (index: number, note: string) => {
    setChecklist(prev => prev.map((item, i) => 
      i === index ? { ...item, notes: note } : item
    ));
  };

  const saveProgress = () => {
    const visitData = {
      photos,
      notes,
      checklist,
      location: currentLocation ? {
        ...visit?.location,
        coordinates: currentLocation
      } : visit?.location
    };
    
    onSave(visitData);
    toast({
      title: "Progress Saved",
      description: "Visit information has been saved"
    });
  };

  const completeVisit = () => {
    if (!visit) return;
    
    const completedVisit: VendorVisit = {
      ...visit,
      status: 'completed',
      photos,
      notes,
      checklist
    };
    
    onComplete(completedVisit);
    toast({
      title: "Visit Completed",
      description: "All visit information has been submitted"
    });
  };

  const completedItems = checklist.filter(item => item.completed).length;
  const progressPercentage = (completedItems / checklist.length) * 100;

  return (
    <div className="max-w-md mx-auto space-y-4 p-4">
      {/* Visit Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Vendor Visit</CardTitle>
          {visit && (
            <div className="flex items-center justify-between text-sm">
              <Badge variant={visit.status === 'completed' ? 'default' : 'secondary'}>
                {visit.status.replace('_', ' ')}
              </Badge>
              <span className="text-muted-foreground">
                {new Date(visit.scheduledTime).toLocaleString()}
              </span>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              onClick={capturePhoto}
              className="flex flex-col gap-2 h-auto py-3"
            >
              <Camera className="h-5 w-5" />
              <span className="text-xs">Capture Photo</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={getCurrentLocation}
              className="flex flex-col gap-2 h-auto py-3"
            >
              <MapPin className="h-5 w-5" />
              <span className="text-xs">Get Location</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Checklist */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            Visit Checklist
            <span className="text-sm text-muted-foreground">
              {completedItems}/{checklist.length}
            </span>
          </CardTitle>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {checklist.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleChecklistItem(index)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    item.completed 
                      ? 'bg-green-600 border-green-600 text-white' 
                      : 'border-gray-300'
                  }`}
                >
                  {item.completed && <CheckCircle className="h-3 w-3" />}
                </button>
                <span className={`text-sm flex-1 ${
                  item.completed ? 'line-through text-muted-foreground' : ''
                }`}>
                  {item.item}
                </span>
              </div>
              
              {item.completed && (
                <Input
                  placeholder="Add notes..."
                  value={item.notes || ''}
                  onChange={(e) => addChecklistNote(index, e.target.value)}
                  className="ml-8 text-xs"
                />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Photos */}
      {photos.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Photos ({photos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {photos.map((photo, index) => (
                <div key={index} className="aspect-square bg-gray-100 rounded overflow-hidden">
                  <img 
                    src={photo} 
                    alt={`Visit photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Visit Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add notes about the vendor visit..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Location Info */}
      {currentLocation && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-green-600" />
              <span>Location captured: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={saveProgress} className="flex-1">
          Save Progress
        </Button>
        <Button 
          onClick={completeVisit}
          disabled={completedItems < checklist.length}
          className="flex-1"
        >
          Complete Visit
        </Button>
      </div>

      {completedItems < checklist.length && (
        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded">
          <AlertCircle className="h-4 w-4" />
          <span>Complete all checklist items to finish the visit</span>
        </div>
      )}
    </div>
  );
};

export default MobileVendorWorkflow;
