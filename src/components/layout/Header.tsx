import React from 'react';
import { LogOut, Menu, UserCircle } from 'lucide-react';
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
import NotificationCenter from './NotificationCenter';

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

  const handleProfileImageUpdated = () => {
    // No need to do anything specific here, as the image will update via context
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
          <NotificationCenter />
          
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
                <span className="hidden md:inline-block truncate max-w-[120px]">
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
