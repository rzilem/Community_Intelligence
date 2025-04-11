
import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useParams } from 'react-router-dom';
import { HomePropertyImage } from '@/components/homeowners/HomePropertyImage';
import { HomeownerHeader } from '@/components/homeowners/detail/HomeownerHeader';
import { HomeownerInfo } from '@/components/homeowners/detail/HomeownerInfo';
import { HomeownerTabs } from '@/components/homeowners/detail/HomeownerTabs';
import { useHomeownerData } from '@/hooks/homeowners/useHomeownerData';

const HomeownerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('Summary');
  const [activeNotesTab, setActiveNotesTab] = useState('Manual Notes');
  
  const { homeowner, updateHomeownerImage } = useHomeownerData(id || '');

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-4">
            <HomeownerHeader 
              id={id || homeowner.id}
              name={homeowner.name}
              status={homeowner.status}
              tags={homeowner.tags}
              violations={homeowner.violations}
              avatarUrl={homeowner.avatarUrl}
              onProfileImageUpdated={updateHomeownerImage}
            />

            <HomeownerInfo 
              id={homeowner.id}
              email={homeowner.email}
              phone={homeowner.phone}
              moveInDate={homeowner.moveInDate}
              property={homeowner.property}
              unit={homeowner.unit}
              balance={homeowner.balance}
              lastContact={homeowner.lastContact}
            />
          </div>
          
          <div className="ml-6">
            <HomePropertyImage 
              address={`${homeowner.property} ${homeowner.unit}, Austin, TX`}
              propertyId={homeowner.id}
            />
          </div>
        </div>

        <HomeownerTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeNotesTab={activeNotesTab}
          setActiveNotesTab={setActiveNotesTab}
          notes={homeowner.notes}
        />
      </div>
    </AppLayout>
  );
};

export default HomeownerDetailPage;
