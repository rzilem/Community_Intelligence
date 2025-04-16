
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Building2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchAssociationById } from '@/services/association-service';
import { AssociationAIIssue } from '@/types/association-types';
import PageTemplate from '@/components/layout/PageTemplate';

// Import refactored components
import { AssociationHeader } from '@/components/associations/profile/AssociationHeader';
import { AssociationStats } from '@/components/associations/profile/AssociationStats';
import { AssociationPhotos } from '@/components/associations/profile/AssociationPhotos';
import { AssociationTabs } from '@/components/associations/profile/AssociationTabs';
import { NotFoundCard } from '@/components/associations/profile/NotFoundCard';

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

  useEffect(() => {
    if (error) {
      console.error('Error fetching association:', error);
      toast.error('Failed to load association data');
    }
  }, [error]);
  
  // Mock AI issues - in a real app, these would be fetched from an API
  const aiIssues: AssociationAIIssue[] = [
    {
      id: '1',
      title: 'Invoice Approval Pending',
      description: 'There are 5 invoices awaiting approval for more than 7 days.',
      severity: 'high',
      created_at: '2025-01-15T10:30:00Z',
      updated_at: '2025-01-15T10:30:00Z',
      status: 'open',
      association_id: id || ''
    },
    {
      id: '2',
      title: 'Security Certificates Expiring',
      description: 'SSL certificates for the resident portal will expire in 14 days.',
      severity: 'critical',
      created_at: '2025-01-20T14:45:00Z',
      updated_at: '2025-01-20T14:45:00Z',
      status: 'in-progress',
      association_id: id || ''
    },
    {
      id: '3',
      title: 'Compliance Notices Due',
      description: 'Annual compliance notices need to be sent to all homeowners by the end of the month.',
      severity: 'medium',
      created_at: '2025-01-10T09:15:00Z',
      updated_at: '2025-01-10T09:15:00Z',
      status: 'open',
      association_id: id || ''
    },
    {
      id: '4',
      title: 'Resident Portal Usage Declining',
      description: 'Resident portal logins have decreased by 30% over the past month.',
      severity: 'low',
      created_at: '2025-01-05T16:20:00Z',
      updated_at: '2025-01-05T16:20:00Z',
      status: 'open',
      association_id: id || ''
    }
  ];

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
        <div className="flex justify-center items-center h-64">
          <p>Loading association data...</p>
        </div>
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

      {/* Association Photos Section */}
      <AssociationPhotos />

      {/* Association Tabs Content */}
      <AssociationTabs 
        association={association} 
        aiIssues={aiIssues} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
    </PageTemplate>
  );
};

export default AssociationProfile;
