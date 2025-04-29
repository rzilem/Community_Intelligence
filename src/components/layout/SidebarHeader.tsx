
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarHeaderProps {
  isMobile: boolean;
  closeSidebar: () => void;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ isMobile, closeSidebar }) => {
  return (
    <div className="h-16 py-2.5 px-4 flex items-center justify-between border-b border-white/10">
      <div className="flex items-center gap-2">
        <h1 className="font-display font-bold text-lg text-white">
          Community<br />Intelligence
        </h1>
      </div>
      {isMobile && (
        <Button variant="ghost" size="icon" className="h-8 w-8 text-white" onClick={closeSidebar}>
          <X size={20} />
        </Button>
      )}
    </div>
  );
};

export default SidebarHeader;
