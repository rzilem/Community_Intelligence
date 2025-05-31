
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { CheckSquare } from 'lucide-react';

const AssessmentManager: React.FC = () => {
  return (
    <PageTemplate
      title="Assessment Manager"
      icon={<CheckSquare className="h-8 w-8" />}
      description="Manage billing and assessments"
    >
      <div className="space-y-6">
        <p>Assessment manager functionality coming soon...</p>
      </div>
    </PageTemplate>
  );
};

export default AssessmentManager;
