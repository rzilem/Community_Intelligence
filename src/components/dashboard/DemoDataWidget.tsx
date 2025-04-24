
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DemoDataSeeder from '@/components/data-import/DemoDataSeeder';

const DemoDataWidget: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              Demo Data
            </span>
          </CardTitle>
          <CardDescription>Seed your system with sample data</CardDescription>
        </CardHeader>
        
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            To fully experience Community Intelligence, you'll need data in your system.
            Our demo data seeder can quickly populate your environment.
          </p>
          
          <Button 
            variant="outline" 
            className="w-full flex justify-between items-center"
            onClick={() => setIsDialogOpen(true)}
          >
            <span>Open Demo Data Seeder</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Demo Data Seeder</DialogTitle>
            <DialogDescription>
              Generate realistic sample data for your community
            </DialogDescription>
          </DialogHeader>
          
          <DemoDataSeeder />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DemoDataWidget;
