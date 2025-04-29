
import React from 'react';
import { LogOut } from 'lucide-react';

interface SidebarFooterProps {
  handleSignOut: () => void;
}

const SidebarFooter: React.FC<SidebarFooterProps> = ({ handleSignOut }) => {
  return (
    <div className="p-2 border-t border-white/10">
      <button 
        onClick={handleSignOut} 
        className="w-full flex items-center gap-2 py-2 px-3 rounded-md text-white/80 hover:bg-white/10"
      >
        <LogOut size={20} />
        <span>Sign Out</span>
      </button>
    </div>
  );
};

export default SidebarFooter;
