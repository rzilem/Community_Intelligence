
import React from 'react';
import { cn } from '@/lib/utils';

interface AppLayoutContentProps {
  children: React.ReactNode;
  isMobile: boolean;
  isSidebarOpen: boolean;
}

export const AppLayoutContent: React.FC<AppLayoutContentProps> = ({
  children,
  isMobile,
  isSidebarOpen
}) => {
  return (
    <div 
      className={cn(
        "flex flex-col w-full transition-all duration-300 ease-in-out",
        !isMobile && isSidebarOpen ? "md:ml-64" : ""
      )}
    >
      {children}
    </div>
  );
};

export default AppLayoutContent;
