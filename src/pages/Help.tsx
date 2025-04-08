
import React from 'react';
import PageTemplate from './PageTemplate';
import { HelpCircle } from 'lucide-react';

const Help = () => {
  return <PageTemplate title="Help" icon={<HelpCircle className="h-8 w-8" />} />;
};

export default Help;
