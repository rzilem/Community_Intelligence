import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { 
  Camera, 
  MapPin, 
  Mic, 
  Check, 
  X, 
  AlertTriangle,
  Upload,
  QrCode,
  Navigation
} from 'lucide-react';

interface InspectionItem {
  id: string;
  category: string;
  item: string;
  status: 'pass' | 'fail' | 'na' | 'pending';
  notes?: string;
  photos?: string[];
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

const PropertyInspection: React.FC = () => {
  const { toast } = useToast();
  const [currentProperty, setCurrentProperty] = useState('');
  const [inspector, setInspector] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>([
    // Exterior Inspection
    { id: '1', category: 'Exterior', item: 'Building Exterior Condition', status: 'pending' },
    { id: '2', category: 'Exterior', item: 'Roof Condition', status: 'pending' },
    { id: '3', category: 'Exterior', item: 'Gutters and Downspouts', status: 'pending' },
    { id: '4', category: 'Exterior', item: 'Windows and Doors', status: 'pending' },
    { id: '5', category: 'Exterior', item: 'Sidewalks and Walkways', status: 'pending' },
    { id: '6', category: 'Exterior', item: 'Parking Areas', status: 'pending' },
    { id: '7', category: 'Exterior', item: 'Landscaping', status: 'pending' },
    
    // Common Areas
    { id: '8', category: 'Common Areas', item: 'Lobby/Entrance', status: 'pending' },
    { id: '9', category: 'Common Areas', item: 'Hallways', status: 'pending' },
    { id: '10', category: 'Common Areas', item: 'Elevators', status: 'pending' },
    { id: '11', category: 'Common Areas', item: 'Mailbox Area', status: 'pending' },
    { id: '12', category: 'Common Areas', item: 'Laundry Facilities', status: 'pending' },
    
    // Safety & Security
    { id: '13', category: 'Safety', item: 'Fire Extinguishers', status: 'pending' },
    { id: '14', category: 'Safety', item: 'Emergency Exits', status: 'pending' },
    { id: '15', category: 'Safety', item: 'Lighting', status: 'pending' },
    { id: '16', category: 'Safety', item: 'Security Systems', status: 'pending' },
    
    // Mechanical
    { id: '17', category: 'Mechanical', item: 'HVAC Systems', status: 'pending' },
    { id: '18', category: 'Mechanical', item: 'Plumbing', status: 'pending' },
    { id: '19', category: 'Mechanical', item: 'Electrical Systems', status: 'pending' },
    { id: '20', category: 'Mechanical', item: 'Water Heater', status: 'pending' }
  ]);

  const [activeTab, setActiveTab] = useState('checklist');

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          toast({
            title: "Location Captured",
            description: "GPS coordinates have been recorded for this inspection."
          });
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Unable to get current location. Please check GPS settings.",
            variant: "destructive"
          });
        }
      );
    } else {
      toast({
        title: "GPS Not Supported",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive"
      });
    }
  };

  const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setPhotos(prev => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const updateInspectionItem = (id: string, updates: Partial<InspectionItem>) => {
    setInspectionItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-500';
      case 'fail': return 'bg-red-500';
      case 'na': return 'bg-gray-500';
      default: return 'bg-yellow-500';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const startVoiceRecording = () => {
    setIsRecording(true);
    // Voice recording implementation would go here
    setTimeout(() => {
      setIsRecording(false);
      toast({
        title: "Voice Note Saved",
        description: "Your voice note has been attached to this inspection."
      });
    }, 3000);
  };

  const submitInspection = () => {
    const failedItems = inspectionItems.filter(item => item.status === 'fail').length;
    const passedItems = inspectionItems.filter(item => item.status === 'pass').length;
    const totalItems = inspectionItems.length;

    toast({
      title: "Inspection Submitted",
      description: `${passedItems}/${totalItems} items passed. ${failedItems} issues identified.`
    });
  };

  const categories = [...new Set(inspectionItems.map(item => item.category))];

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Property Inspection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="property">Property/Unit</Label>
                <Input
                  id="property"
                  placeholder="Scan QR code or enter property ID"
                  value={currentProperty}
                  onChange={(e) => setCurrentProperty(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="inspector">Inspector</Label>
                <Input
                  id="inspector"
                  placeholder="Your name"
                  value={inspector}
                  onChange={(e) => setInspector(e.target.value)}
                />
              </div>
            </div>

            {/* Location and Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={getCurrentLocation}>
                <MapPin className="h-4 w-4 mr-2" />
                Get Location
              </Button>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Camera className="h-4 w-4 mr-2" />
                Take Photo
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={startVoiceRecording}
                className={isRecording ? 'bg-red-100' : ''}
              >
                <Mic className={`h-4 w-4 mr-2 ${isRecording ? 'text-red-500' : ''}`} />
                {isRecording ? 'Recording...' : 'Voice Note'}
              </Button>
            </div>

            {location && (
              <div className="text-sm text-muted-foreground">
                📍 Location: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Inspection Interface */}
        <Card>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="checklist">Checklist</TabsTrigger>
                <TabsTrigger value="photos">Photos ({photos.length})</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
              </TabsList>

              <TabsContent value="checklist" className="p-4 space-y-4">
                {categories.map(category => (
                  <div key={category} className="space-y-2">
                    <h3 className="font-semibold text-lg border-b pb-2">{category}</h3>
                    {inspectionItems
                      .filter(item => item.category === category)
                      .map(item => (
                        <Card key={item.id} className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{item.item}</span>
                              <Badge className={getStatusColor(item.status)}>
                                {item.status.toUpperCase()}
                              </Badge>
                            </div>

                            {/* Status Buttons */}
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant={item.status === 'pass' ? 'default' : 'outline'}
                                onClick={() => updateInspectionItem(item.id, { status: 'pass' })}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Pass
                              </Button>
                              <Button
                                size="sm"
                                variant={item.status === 'fail' ? 'destructive' : 'outline'}
                                onClick={() => updateInspectionItem(item.id, { status: 'fail' })}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Fail
                              </Button>
                              <Button
                                size="sm"
                                variant={item.status === 'na' ? 'secondary' : 'outline'}
                                onClick={() => updateInspectionItem(item.id, { status: 'na' })}
                              >
                                N/A
                              </Button>
                            </div>

                            {/* Priority Selection (only for failed items) */}
                            {item.status === 'fail' && (
                              <Select
                                value={item.priority}
                                onValueChange={(value) => updateInspectionItem(item.id, { priority: value as any })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Low Priority</SelectItem>
                                  <SelectItem value="medium">Medium Priority</SelectItem>
                                  <SelectItem value="high">High Priority</SelectItem>
                                  <SelectItem value="critical">Critical</SelectItem>
                                </SelectContent>
                              </Select>
                            )}

                            {/* Notes */}
                            <Textarea
                              placeholder="Add notes for this item..."
                              value={item.notes || ''}
                              onChange={(e) => updateInspectionItem(item.id, { notes: e.target.value })}
                              className="min-h-[60px]"
                            />
                          </div>
                        </Card>
                      ))}
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="photos" className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo}
                        alt={`Inspection photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={() => setPhotos(prev => prev.filter((_, i) => i !== index))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    className="h-32 border-2 border-dashed"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-8 w-8 mb-2" />
                    Add Photo
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="summary" className="p-4 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {inspectionItems.filter(i => i.status === 'pass').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Passed</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {inspectionItems.filter(i => i.status === 'fail').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-gray-600">
                      {inspectionItems.filter(i => i.status === 'na').length}
                    </div>
                    <div className="text-sm text-muted-foreground">N/A</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {inspectionItems.filter(i => i.status === 'pending').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </Card>
                </div>

                {/* Failed Items Summary */}
                {inspectionItems.filter(i => i.status === 'fail').length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        Issues Found
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {inspectionItems
                          .filter(i => i.status === 'fail')
                          .map(item => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                              <div>
                                <div className="font-medium">{item.item}</div>
                                {item.notes && (
                                  <div className="text-sm text-muted-foreground">{item.notes}</div>
                                )}
                              </div>
                              {item.priority && (
                                <Badge className={getPriorityColor(item.priority)}>
                                  {item.priority.toUpperCase()}
                                </Badge>
                              )}
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button className="w-full" size="lg" onClick={submitInspection}>
                  <Upload className="h-4 w-4 mr-2" />
                  Submit Inspection Report
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handlePhotoCapture}
        />
      </div>
    </div>
  );
};

export default PropertyInspection;