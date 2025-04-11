
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users2, Calendar, FileText, Zap } from 'lucide-react';
import { Association } from '@/types/association-types';

interface AssociationStatsProps {
  association: Association;
}

export const AssociationStats: React.FC<AssociationStatsProps> = ({ association }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users2 className="h-5 w-5" />
              <span>Units</span>
            </div>
            <h3 className="text-2xl font-bold">{association.total_units || 'N/A'}</h3>
            <span className="text-sm text-muted-foreground">Total residential units</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="h-5 w-5" />
              <span>Onboarding Date</span>
            </div>
            <h3 className="text-2xl font-bold">{association.founded_date || 'N/A'}</h3>
            <span className="text-sm text-muted-foreground">
              {association.founded_date ? `Client since ${new Date(association.founded_date).getFullYear()}` : 'No date available'}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <FileText className="h-5 w-5" />
              <span>Legal Property Type</span>
            </div>
            <h3 className="text-lg font-bold">{association.property_type || 'Not specified'}</h3>
            <span className="text-sm text-muted-foreground">Property classification</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Zap className="h-5 w-5" />
                <span>Association Workflows</span>
              </div>
            </div>
            <div className="mt-2">
              <Button className="flex items-center gap-2 w-full">
                <Calendar className="h-4 w-4" />
                <span>Schedule Workflow</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
