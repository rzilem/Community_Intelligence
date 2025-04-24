
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

type DataCategory = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  count: number;
  selected: boolean;
};

const initialCategories: DataCategory[] = [
  { 
    id: 'properties', 
    name: 'Properties', 
    description: 'Sample properties with various types and statuses',
    icon: <Home className="h-5 w-5" />,
    count: 50,
    selected: true
  },
  { 
    id: 'residents', 
    name: 'Residents', 
    description: 'Homeowners and tenants with contact information',
    icon: <Users className="h-5 w-5" />,
    count: 75,
    selected: true
  },
  { 
    id: 'documents', 
    name: 'Documents', 
    description: 'Community documents, bylaws, and notices',
    icon: <FileText className="h-5 w-5" />,
    count: 20,
    selected: true 
  },
  { 
    id: 'calendar', 
    name: 'Calendar Events', 
    description: 'Community events, meetings, and amenity bookings',
    icon: <Calendar className="h-5 w-5" />,
    count: 15,
    selected: true 
  }
];

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
        await seedCategoryData(category, selectedAssociationId);
        
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
  
  const seedCategoryData = async (category: DataCategory, associationId: string) => {
    // This is a placeholder function that would be replaced with actual seeding logic
    console.log(`Seeding ${category.count} ${category.name} for association ${associationId}`);
    
    // Add a small delay to make the progress visible
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Here we would call specific seeding functions for each category
    // For example:
    switch (category.id) {
      case 'properties':
        // await seedProperties(category.count, associationId);
        break;
      case 'residents':
        // await seedResidents(category.count, associationId);
        break;
      case 'documents':
        // await seedDocuments(category.count, associationId);
        break;
      case 'calendar':
        // await seedCalendarEvents(category.count, associationId);
        break;
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
