
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Upload, Users, Home, FileText, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import AssociationSelector from '@/components/associations/AssociationSelector';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { DataCategory } from '@/types/demo-seeder-types';
import { seedProperties, seedResidents, seedDocuments, seedCalendarEvents } from '@/utils/demo-seeder-utils';
import { CategoryList } from './CategoryList';
import { SeedingProgress } from './SeedingProgress';
import { Label } from '@/components/ui/label';

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

const DemoDataSeeder: React.FC = () => {
  const { currentAssociation } = useAuth();
  const [categories, setCategories] = useState<DataCategory[]>(initialCategories);
  const [selectedAssociationId, setSelectedAssociationId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  
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
      
      for (let i = 0; i < selectedCategories.length; i++) {
        const category = selectedCategories[i];
        
        setProgress(Math.round((i / selectedCategories.length) * 100));
        
        await category.seedFunction(selectedAssociationId, category.count);
        
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
        
        <CategoryList 
          categories={categories}
          onToggleCategory={toggleCategory}
        />
        
        <SeedingProgress progress={progress} />
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
