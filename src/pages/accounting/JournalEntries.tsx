
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { BookOpen } from 'lucide-react';

const JournalEntries = () => {
  return <PageTemplate 
    title="Journal Entries" 
    icon={<BookOpen className="h-8 w-8" />}
    description="Create and manage accounting journal entries for financial adjustments."
  />;
};

export default JournalEntries;
