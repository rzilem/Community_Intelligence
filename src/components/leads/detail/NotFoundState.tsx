
import React from 'react';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageTemplate from '@/components/layout/PageTemplate';
import { Button } from '@/components/ui/button';

const NotFoundState: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <PageTemplate 
      title="Lead Not Found" 
      icon={<User className="h-8 w-8" />}
      description="The requested lead could not be found."
    >
      <div className="flex justify-center">
        <Button onClick={() => navigate('/lead-management/dashboard')}>
          Back to Leads
        </Button>
      </div>
    </PageTemplate>
  );
};

export default NotFoundState;
