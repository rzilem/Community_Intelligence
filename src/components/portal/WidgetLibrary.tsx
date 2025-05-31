
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Megaphone, CreditCard, Wrench, FileText, Cloud, Phone, MapPin } from 'lucide-react';
import { WidgetType } from '@/types/portal-types';

interface WidgetTemplate {
  type: WidgetType;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  isPremium?: boolean;
}

const widgetTemplates: WidgetTemplate[] = [
  {
    type: 'calendar',
    name: 'Calendar Widget',
    description: 'Display upcoming events and bookings',
    icon: <Calendar className="h-6 w-6" />,
    category: 'Events'
  },
  {
    type: 'announcements',
    name: 'Announcements',
    description: 'Show latest community news and updates',
    icon: <Megaphone className="h-6 w-6" />,
    category: 'Communication'
  },
  {
    type: 'payments',
    name: 'Payment Widget',
    description: 'Display balance and quick payment options',
    icon: <CreditCard className="h-6 w-6" />,
    category: 'Financial'
  },
  {
    type: 'maintenance',
    name: 'Maintenance Requests',
    description: 'Show request status and submit new requests',
    icon: <Wrench className="h-6 w-6" />,
    category: 'Maintenance'
  },
  {
    type: 'documents',
    name: 'Important Documents',
    description: 'Quick access to important HOA documents',
    icon: <FileText className="h-6 w-6" />,
    category: 'Documents'
  },
  {
    type: 'weather',
    name: 'Weather Widget',
    description: 'Local weather information',
    icon: <Cloud className="h-6 w-6" />,
    category: 'Utility',
    isPremium: true
  },
  {
    type: 'contacts',
    name: 'Contact Directory',
    description: 'Important HOA contacts and emergency numbers',
    icon: <Phone className="h-6 w-6" />,
    category: 'Communication'
  },
  {
    type: 'amenities',
    name: 'Amenity Booking',
    description: 'View availability and book amenities',
    icon: <MapPin className="h-6 w-6" />,
    category: 'Amenities'
  }
];

interface WidgetLibraryProps {
  onAddWidget: (type: WidgetType) => void;
}

export const WidgetLibrary: React.FC<WidgetLibraryProps> = ({ onAddWidget }) => {
  const categories = [...new Set(widgetTemplates.map(w => w.category))];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Widget Library</h3>
      
      {categories.map(category => (
        <div key={category} className="space-y-3">
          <h4 className="text-md font-medium text-muted-foreground">{category}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {widgetTemplates
              .filter(widget => widget.category === category)
              .map(widget => (
                <Card key={widget.type} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {widget.icon}
                        <CardTitle className="text-sm">{widget.name}</CardTitle>
                      </div>
                      {widget.isPremium && (
                        <Badge variant="secondary" className="text-xs">Pro</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {widget.description}
                    </p>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => onAddWidget(widget.type)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Widget
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};
