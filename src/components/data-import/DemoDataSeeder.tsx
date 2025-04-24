
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Database, Upload, Users, Home, FileText, Calendar, ArrowRight } from 'lucide-react';
import AssociationSelector from '@/components/associations/AssociationSelector';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { faker } from '@faker-js/faker';

type DataCategory = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  count: number;
  selected: boolean;
  seedFunction: (associationId: string, count: number) => Promise<void>;
};

const initialCategories: DataCategory[] = [
  { 
    id: 'properties', 
    name: 'Properties', 
    description: 'Sample properties with various types and statuses',
    icon: <Home className="h-5 w-5" />,
    count: 50,
    selected: true,
    seedFunction: seedProperties
  },
  { 
    id: 'residents', 
    name: 'Residents', 
    description: 'Homeowners and tenants with contact information',
    icon: <Users className="h-5 w-5" />,
    count: 75,
    selected: true,
    seedFunction: seedResidents
  },
  { 
    id: 'documents', 
    name: 'Documents', 
    description: 'Community documents, bylaws, and notices',
    icon: <FileText className="h-5 w-5" />,
    count: 20,
    selected: true,
    seedFunction: seedDocuments
  },
  { 
    id: 'calendar', 
    name: 'Calendar Events', 
    description: 'Community events, meetings, and amenity bookings',
    icon: <Calendar className="h-5 w-5" />,
    count: 15,
    selected: true,
    seedFunction: seedCalendarEvents
  }
];

// Seeding functions
async function seedProperties(associationId: string, count: number) {
  const propertiesToInsert = Array.from({ length: count }, () => ({
    association_id: associationId,
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    zip: faker.location.zipCode(),
    property_type: faker.helpers.arrayElement(['Single Family', 'Townhouse', 'Condo', 'Apartment']),
    square_feet: faker.number.int({ min: 800, max: 3000 }),
    bedrooms: faker.number.int({ min: 1, max: 5 }),
    bathrooms: faker.number.float({ min: 1, max: 3, precision: 0.5 }),
    year_built: faker.number.int({ min: 1950, max: 2023 }),
    status: 'active'
  }));

  const { data, error } = await supabase
    .from('properties')
    .insert(propertiesToInsert);

  if (error) {
    throw error;
  }
}

async function seedResidents(associationId: string, count: number) {
  const residentProperties = await supabase
    .from('properties')
    .select('id')
    .eq('association_id', associationId);

  const propertyIds = residentProperties.data?.map(p => p.id) || [];

  const residentsToInsert = Array.from({ length: count }, () => ({
    association_id: associationId,
    property_id: faker.helpers.arrayElement(propertyIds),
    name: `${faker.person.firstName()} ${faker.person.lastName()}`,
    email: faker.internet.email(),
    phone: faker.phone.number(),
    resident_type: faker.helpers.arrayElement(['owner', 'tenant']),
    move_in_date: faker.date.past(),
    preferences: {}
  }));

  const { error } = await supabase
    .from('residents')
    .insert(residentsToInsert);

  if (error) {
    throw error;
  }
}

async function seedDocuments(associationId: string, count: number) {
  const documentsToInsert = Array.from({ length: count }, () => ({
    association_id: associationId,
    name: faker.lorem.words(3),
    description: faker.lorem.sentence(),
    file_type: faker.helpers.arrayElement(['pdf', 'docx', 'txt']),
    url: faker.internet.url(),
    is_public: faker.datatype.boolean(),
    category: faker.helpers.arrayElement(['bylaws', 'minutes', 'financial', 'other'])
  }));

  const { error } = await supabase
    .from('documents')
    .insert(documentsToInsert);

  if (error) {
    throw error;
  }
}

async function seedCalendarEvents(associationId: string, count: number) {
  const calendarEventsToInsert = Array.from({ length: count }, () => ({
    hoa_id: associationId,
    title: faker.lorem.words(3),
    description: faker.lorem.sentence(),
    start_time: faker.date.future(),
    end_time: faker.date.future(),
    event_type: faker.helpers.arrayElement(['meeting', 'social', 'maintenance', 'other']),
    visibility: faker.helpers.arrayElement(['public', 'private'])
  }));

  const { error } = await supabase
    .from('calendar_events')
    .insert(calendarEventsToInsert);

  if (error) {
    throw error;
  }
}

const DemoDataSeeder: React.FC = () => {
  const { currentAssociation } = useAuth();
  const [categories, setCategories] = useState<DataCategory[]>(initialCategories);
  const [selectedAssociationId, setSelectedAssociationId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Set default association when available
  React.useEffect(() => {
    if (currentAssociation?.id) {
      setSelectedAssociationId(currentAssociation.id);
    }
  }, [currentAssociation]);

  const handleAssociationChange = (associationId: string) => {
    setSelectedAssociationId(associationId);
  };

  const toggleCategory = (categoryId: string) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId ? { ...cat, selected: !cat.selected } : cat
    ));
  };

  const handleSeedData = async () => {
    if (!selectedAssociationId) {
      toast.error("Please select an association first");
      return;
    }
    
    const selectedCategories = categories.filter(cat => cat.selected);
    
    if (selectedCategories.length === 0) {
      toast.error("Please select at least one data category");
      return;
    }

    setIsLoading(true);
    setProgress(0);
    
    try {
      toast.info("Starting to seed demo data...");
      
      // Process each selected category
      for (let i = 0; i < selectedCategories.length; i++) {
        const category = selectedCategories[i];
        
        // Update progress
        setProgress(Math.round((i / selectedCategories.length) * 100));
        
        // Seed data for this category
        await category.seedFunction(selectedAssociationId, category.count);
        
        // Log seeding history
        await supabase.from('history').insert({
          association_id: selectedAssociationId,
          user_id: currentAssociation?.user_id,
          action: 'demo_data_seeding',
          category: category.id,
          count: category.count
        });
        
        toast.success(`Created ${category.count} ${category.name.toLowerCase()}`);
      }
      
      setProgress(100);
      toast.success("Demo data seeded successfully! Refresh the page to see results.");
      
    } catch (error) {
      console.error("Error seeding data:", error);
      toast.error("An error occurred while seeding data");
    } finally {
      setIsLoading(false);
      // Reset progress after a delay
      setTimeout(() => setProgress(0), 3000);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Demo Data Seeder
        </CardTitle>
        <CardDescription>
          Populate your system with realistic demo data for testing and presentation
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Select Association</Label>
          <AssociationSelector
            onAssociationChange={handleAssociationChange}
            label={false}
          />
        </div>
        
        <div className="space-y-3 mt-4">
          <Label>Select Data Categories</Label>
          {categories.map(category => (
            <div key={category.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50">
              <Checkbox 
                id={`category-${category.id}`}
                checked={category.selected}
                onCheckedChange={() => toggleCategory(category.id)}
                className="mt-1"
              />
              <div className="space-y-1 flex-1">
                <Label 
                  htmlFor={`category-${category.id}`}
                  className="flex items-center gap-2 cursor-pointer font-medium"
                >
                  {category.icon}
                  {category.name} ({category.count})
                </Label>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        {progress > 0 && (
          <div className="space-y-2 mt-4">
            <Label>Progress</Label>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-center text-muted-foreground">{progress}% complete</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleSeedData} 
          disabled={isLoading || !selectedAssociationId} 
          className="w-full"
        >
          {isLoading ? (
            <>Processing...</>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Seed Demo Data
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DemoDataSeeder;
