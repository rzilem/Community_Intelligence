
import React from 'react';
import { LogOut, Menu, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from 'react-router-dom';
import CompactProfileImageUpload from '@/components/users/CompactProfileImageUpload';
import NotificationCenter from './NotificationCenter';
import ThemeToggle from './ThemeToggle';
import InlineGlobalSearch from './InlineGlobalSearch';
import QuickActions from './QuickActions';
import StatusIndicators from './StatusIndicators';

interface HeaderProps {
  isMobile: boolean;
  user: any;
  profile: any;
  toggleSidebar: () => void;
  handleSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({
  isMobile,
  user,
  profile,
  toggleSidebar,
  handleSignOut
}) => {
  const navigate = useNavigate();

  const getUserInitials = (): string => {
    if (!profile) return 'U';
    
    const firstName = profile.first_name || '';
    const lastName = profile.last_name || '';
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`;
    } else if (firstName) {
      return firstName.charAt(0);
    } else if (profile.email) {
      return profile.email.charAt(0).toUpperCase();
    }
    
    return 'U';
  };

  // Handle profile image update
  const handleProfileImageUpdate = async (newUrl: string): Promise<void> => {
    // The image will be updated automatically since the Header component
    // will re-render with the new profile data from context
  };

  return (
    <header className="flex items-center justify-between h-16 px-4 border-b bg-gradient-to-r from-background to-background/95 backdrop-blur-sm shadow-sm">
      {/* Sidebar Toggle - Always visible */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8"
        onClick={toggleSidebar}
      >
        <Menu size={20} />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
      
      <div className="flex-1 flex items-center justify-between">
        {/* Left section - Logo/Brand on mobile */}
        <div className="flex items-center gap-4">
          <h1 className="md:hidden font-display font-bold text-xl text-hoa-blue">Community Intelligence</h1>
          
          {/* Inline Global Search - Desktop - Made twice as wide */}
          <div className="hidden md:block flex-1 max-w-5xl">
            <InlineGlobalSearch />
          </div>
        </div>
        
        {/* Right section - Actions and User */}
        <div className="flex items-center gap-3">
          {/* Status Indicators - Desktop only */}
          <div className="hidden lg:block">
            <StatusIndicators />
          </div>
          
          {/* Quick Actions */}
          <QuickActions />
          
          {/* Inline Global Search - Mobile - Made twice as wide */}
          <div className="md:hidden flex-1 max-w-lg">
            <InlineGlobalSearch />
          </div>
          
          {/* Notifications */}
          <NotificationCenter />
          
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 font-normal hover:bg-accent/50"
              >
                {user && profile ? (
                  <CompactProfileImageUpload
                    userId={user.id}
                    currentImageUrl={profile?.profile_image_url}
                    onImageUpdate={handleProfileImageUpdate}
                    userInitials={getUserInitials()}
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-medium">{getUserInitials()}</span>
                  </div>
                )}
                <span className="hidden md:inline-block truncate max-w-[120px]">
                  {profile?.first_name ? 
                    `${profile.first_name} ${profile.last_name || ''}` : 
                    user?.email
                  }
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>My Account</span>
                {profile?.role && <Badge variant="secondary" className="text-xs">{profile.role}</Badge>}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/user/profile')}>
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
