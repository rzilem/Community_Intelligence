import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useParams } from 'react-router-dom';
import { HomePropertyImage } from '@/components/homeowners/HomePropertyImage';
import { HomeownerHeader } from '@/components/homeowners/detail/HomeownerHeader';
import { HomeownerInfo } from '@/components/homeowners/detail/HomeownerInfo';
import { HomeownerTabs } from '@/components/homeowners/detail/HomeownerTabs';
import { useHomeownerData } from '@/hooks/homeowners/useHomeownerData';
import HomeownerEditForm from '@/components/homeowners/detail/HomeownerEditForm';
import { useAuth } from '@/contexts/auth/useAuth';
import { Homeowner, NoteType } from '@/components/homeowners/detail/types';
import { toast } from 'sonner';
import { HomeownerPortalCard } from '@/components/homeowners/detail/HomeownerPortalCard';

const HomeownerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('Summary');
  const [activeNotesTab, setActiveNotesTab] = useState('Manual Notes');
  const [isEditing, setIsEditing] = useState(false);
  const { isAdmin } = useAuth();
  
  const { homeowner, loading, error, updateHomeownerImage, updateHomeownerData, addHomeownerNote } = useHomeownerData(id || '');

  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
  };
  
  const handleSaveEdit = async (data: Partial<Homeowner>) => {
    await updateHomeownerData(data);
    setIsEditing(false);
  };

  const handleAddNote = async (note: Omit<NoteType, 'date'>) => {
    try {
      if (!id) {
        toast.error('Cannot add note: Missing homeowner ID');
        return;
      }
      
      await addHomeownerNote(note);
      
      setActiveTab('Notes');
      setActiveNotesTab('Manual Notes');
    } catch (error) {
      console.error('Error adding note from page component:', error);
      toast.error('Failed to add note');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6">Loading homeowner data...</div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="p-6">Error loading homeowner data: {error}</div>
      </AppLayout>
    );
  }

  const getViolationsCount = (): number => {
    if (!homeowner?.violations) return 0;
    
    if (typeof homeowner.violations === 'number') {
      return homeowner.violations;
    }
    
    if (Array.isArray(homeowner.violations)) {
      return homeowner.violations.length;
    }
    
    return 0;
  };

  const getLastContactString = () => {
    if (!homeowner?.lastContact) return '';
    
    if (typeof homeowner.lastContact === 'string') {
      return homeowner.lastContact;
    }
    
    const dates = [
      homeowner.lastContact.called,
      homeowner.lastContact.visit,
      homeowner.lastContact.email
    ].filter(Boolean);
    
    if (dates.length === 0) return '';
    
    return dates.sort((a, b) => new Date(b!).getTime() - new Date(a!).getTime())[0] || '';
  };

  const lastContactValue = getLastContactString();
  const violationsCount = getViolationsCount();

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-4">
            <HomeownerHeader 
              id={id || homeowner?.id || ''}
              name={homeowner?.name}
              status={homeowner?.status}
              tags={homeowner?.tags || []}
              violations={violationsCount}
              avatarUrl={homeowner?.avatarUrl}
              onProfileImageUpdated={updateHomeownerImage}
              onEditClick={isAdmin ? handleEdit : undefined}
            />
            
            {isEditing && isAdmin ? (
              <HomeownerEditForm 
                homeowner={homeowner}
                onSave={handleSaveEdit}
                onCancel={handleCancelEdit}
              />
            ) : (
              <HomeownerInfo 
                id={homeowner?.id}
                email={homeowner?.email}
                phone={homeowner?.phone}
                moveInDate={homeowner?.moveInDate}
                property={homeowner?.property}
                unit={homeowner?.unit}
                balance={homeowner?.balance}
                lastContact={lastContactValue}
              />
            )}
          </div>
          
          <div className="ml-6">
            <HomePropertyImage 
              address={`${homeowner?.property || ''} ${homeowner?.unit || ''}, Austin, TX`}
              propertyId={homeowner?.id || ''}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <HomeownerPortalCard residentId={id || homeowner?.id || ''} />
        </div>

        <HomeownerTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeNotesTab={activeNotesTab}
          setActiveNotesTab={setActiveNotesTab}
          notes={homeowner?.notes || []}
          onAddNote={handleAddNote}
          homeownerId={id || homeowner?.id || ''}
          email={homeowner?.email}
          lastLoginDate={homeowner?.lastLoginDate || undefined}
        />
      </div>
    </AppLayout>
  );
};

export default HomeownerDetailPage;
