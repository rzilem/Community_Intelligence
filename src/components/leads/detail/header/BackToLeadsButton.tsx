
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

const BackToLeadsButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="absolute top-4 left-4 z-10">
      <Button 
        variant="outline"
        onClick={() => navigate('/lead-management/dashboard')}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back to Leads
      </Button>
    </div>
  );
};

export default BackToLeadsButton;
