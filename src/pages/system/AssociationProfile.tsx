
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Building2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchAssociationById } from '@/services/association-service';
import PageTemplate from '@/components/layout/PageTemplate';

// Import refactored components
import { AssociationHeader } from '@/components/associations/profile/AssociationHeader';
import { AssociationStats } from '@/components/associations/profile/AssociationStats';
import { AssociationPhotos } from '@/components/associations/profile/AssociationPhotos';
import { AssociationTabs } from '@/components/associations/profile/AssociationTabs';
import { NotFoundCard } from '@/components/associations/profile/NotFoundCard';
import { useAssociationAIIssues } from '@/hooks/associations/useAssociationAIIssues';
import { LoadingState } from '@/components/ui/loading-state';

const AssociationProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  
  // Fetch the association data based on the ID parameter
  const { data: association, isLoading, error } = useQuery({
    queryKey: ['association', id],
    queryFn: () => fetchAssociationById(id || ''),
    enabled: !!id,
  });

  // Fetch real AI issues based on association data
  const { 
    data: aiIssues = [], 
    isLoading: aiIssuesLoading,
    error: aiIssuesError
  } = useAssociationAIIssues(id);

  useEffect(() => {
    if (error) {
      console.error('Error fetching association:', error);
      toast.error('Failed to load association data');
    }
  }, [error]);

  const handleBack = () => {
    navigate('/system/associations');
  };

  if (isLoading) {
    return (
      <PageTemplate 
        title="Association Profile" 
        icon={<Building2 className="h-8 w-8" />}
        description="Loading association details..."
      >
        <LoadingState text="Loading association data..." />
      </PageTemplate>
    );
  }

  if (!association) {
    return (
      <PageTemplate 
        title="Association Not Found" 
        icon={<Building2 className="h-8 w-8" />}
        description="The requested association could not be found."
      >
        <NotFoundCard handleBack={handleBack} />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate 
      title={association?.name || 'Association Profile'} 
      icon={<Building2 className="h-8 w-8" />}
      description={`Manage ${association?.name} association details, properties, and settings.`}
    >
      {/* Association Header */}
      <AssociationHeader association={association} handleBack={handleBack} />

      {/* Association Stats */}
      <AssociationStats association={association} />

      {/* Association Photos Section - Now with real functionality */}
      <AssociationPhotos associationId={association.id} />

      {/* Association Tabs Content */}
      <AssociationTabs 
        association={association} 
        aiIssues={aiIssues} 
        aiIssuesLoading={aiIssuesLoading}
        aiIssuesError={aiIssuesError as Error}
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
    </PageTemplate>
  );
};

export default AssociationProfile;
