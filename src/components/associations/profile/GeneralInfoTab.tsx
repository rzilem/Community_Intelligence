
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Association, AssociationAIIssue } from '@/types/association-types';
import { AIAnalysisSection } from './AIAnalysisSection';
import { GeneralInformation } from './sections/GeneralInformation';
import { CriticalDates } from './sections/CriticalDates';

interface GeneralInfoTabProps {
  association: Association;
  aiIssues: AssociationAIIssue[];
}

export const GeneralInfoTab: React.FC<GeneralInfoTabProps> = ({ association, aiIssues }) => {
  return (
    <div className="space-y-6">
      {/* General Information */}
      <Card>
        <CardContent className="pt-6">
          <GeneralInformation association={association} />
        </CardContent>
      </Card>

      {/* Critical Dates */}
      <Card>
        <CardContent className="pt-6">
          <CriticalDates association={association} />
        </CardContent>
      </Card>

      {/* AI Analysis */}
      <AIAnalysisSection aiIssues={aiIssues} />
    </div>
  );
};
