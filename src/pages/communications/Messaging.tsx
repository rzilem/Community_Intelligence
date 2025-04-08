
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Send } from 'lucide-react';

const Messaging = () => {
  return <PageTemplate 
    title="Messaging" 
    icon={<Send className="h-8 w-8" />}
    description="Send and manage communications with residents and board members."
  />;
};

export default Messaging;
