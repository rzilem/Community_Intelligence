import React from 'react';
import { Bell, LogOut, Menu, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import ProfileImageUpload from '@/components/users/ProfileImageUpload';
import { useLeadNotifications } from '@/hooks/leads/useLeadNotifications';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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
  const { unreadLeadsCount, markAllAsRead } = useLeadNotifications();

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
  const handleProfileImageUpdated = (newUrl: string) => {
    // The image will be updated automatically since the Header component
    // will re-render with the new profile data from context
  };

  const handleNotificationsClick = () => {
    navigate('/lead-management/leads');
    markAllAsRead();
  };

  return (
    <header className="flex items-center justify-between h-16 px-4 border-b bg-white">
      {isMobile && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={toggleSidebar}
        >
          <Menu size={20} />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      )}
      
      <div className="flex-1 flex items-center justify-between">
        <h1 className="md:hidden font-display font-bold text-xl text-hoa-blue">Community Intelligence</h1>
        
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 relative" onClick={handleNotificationsClick}>
                <Bell size={20} />
                {unreadLeadsCount > 0 && (
                  <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                    {unreadLeadsCount > 9 ? '9+' : unreadLeadsCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-2">
                <h4 className="font-semibold">Notifications</h4>
                {unreadLeadsCount > 0 ? (
                  <div className="text-sm">
                    {unreadLeadsCount} new lead{unreadLeadsCount > 1 ? 's' : ''} received
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No new notifications</div>
                )}
              </div>
            </PopoverContent>
          </Popover>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 font-normal"
              >
                {user && profile ? (
                  <ProfileImageUpload
                    userId={user.id}
                    imageUrl={profile?.profile_image_url}
                    firstName={profile?.first_name}
                    lastName={profile?.last_name}
                    onImageUpdated={handleProfileImageUpdated}
                    size="sm"
                  />
                ) : (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                )}
                <span className="hidden md:inline-block">
                  {profile?.first_name ? 
                    `${profile.first_name} ${profile.last_name || ''}` : 
                    user?.email
                  }
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {profile?.role && <Badge className="ml-2">{profile.role}</Badge>}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/user/profile')}>
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Profile</span>
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
