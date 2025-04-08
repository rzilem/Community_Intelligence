
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Clock } from 'lucide-react';

const WorkflowSchedule = () => {
  return <PageTemplate 
    title="Workflow Schedule" 
    icon={<Clock className="h-8 w-8" />}
    description="Schedule and manage automated system workflows."
  />;
};

export default WorkflowSchedule;
