
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { ClipboardList } from 'lucide-react';

const CondoQuestionnaire = () => {
  return <PageTemplate 
    title="Condo Questionnaire" 
    icon={<ClipboardList className="h-8 w-8" />}
    description="Generate and complete condominium questionnaires for lenders."
  />;
};

export default CondoQuestionnaire;
