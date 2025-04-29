
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import Header from './Header';
import { User } from '@supabase/supabase-js';
import { Profile } from '@/contexts/auth/types';

interface AppLayoutHeaderProps {
  user: User | null;
  profile: Profile | null;
  toggleSidebar: () => void;
  handleSignOut: () => void;
}

export const AppLayoutHeader: React.FC<AppLayoutHeaderProps> = ({
  user,
  profile,
  toggleSidebar,
  handleSignOut
}) => {
  const isMobile = useIsMobile();

  return (
    <Header 
      isMobile={isMobile}
      user={user}
      profile={profile}
      toggleSidebar={toggleSidebar}
      handleSignOut={handleSignOut}
    />
  );
};

export default AppLayoutHeader;
