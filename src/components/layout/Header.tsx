
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
          <Button variant="ghost" size="icon" className="h-8 w-8 relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 font-normal"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.profile_image_url || undefined} />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
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
              <DropdownMenuItem onClick={() => navigate('/settings')}>
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
