
import React from 'react';
import { Homeowner } from './homeowner-types';
import StandaloneHomeownerCard from './StandaloneHomeownerCard';

interface HomeownerGridProps {
  homeowners: Homeowner[];
}

const HomeownerGrid: React.FC<HomeownerGridProps> = ({ homeowners }) => {
  if (homeowners.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No homeowners found matching your search.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {homeowners.map(homeowner => (
        <StandaloneHomeownerCard key={homeowner.id} homeowner={homeowner} />
      ))}
    </div>
  );
};

export default HomeownerGrid;
