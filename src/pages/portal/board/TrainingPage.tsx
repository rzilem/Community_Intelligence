
import React from 'react';
import { PortalPageLayout } from '@/components/portal/PortalPageLayout';
import { BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PortalNavigation } from '@/components/portal/PortalNavigation';

const TrainingPage = () => {
  return (
    <PortalPageLayout 
      title="Board Portal Training" 
      icon={<BookOpen className="h-6 w-6" />}
      description="Access training materials for board members"
      portalType="board"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <PortalNavigation portalType="board" />
        </div>
        
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center min-h-[200px] text-center">
                <div>
                  <h3 className="text-lg font-medium mb-2">Board Portal Training</h3>
                  <p className="text-muted-foreground mb-4">This feature is coming soon.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalPageLayout>
  );
};

export default TrainingPage;
