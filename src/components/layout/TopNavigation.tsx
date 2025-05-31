import React from 'react';
import { Bell, Plus, Search, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const TopNavigation = () => {
  const { profile, signOut } = useAuth();

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'DU';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <header className="top-nav bg-white border-b border-blue-100 px-6 py-4 flex items-center justify-between">
      {/* Left side - Search */}
      <div className="flex items-center space-x-4 flex-1">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="search"
            placeholder="Search communities, residents, or documents..."
            className="pl-10 pr-4 py-2 w-96 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Right side - Actions and Profile */}
      <div className="flex items-center space-x-4">
        {/* New HOA Button */}
        <Button className="btn-blue">
          <Plus className="h-4 w-4 mr-2" />
          New HOA
        </Button>

        {/* View All Button */}
        <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
          View All
          <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
            0
          </span>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            3
          </span>
        </Button>

        {/* Settings */}
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5 text-gray-600" />
        </Button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage 
                  src={profile?.profile_image_url || ''} 
                  alt={`${profile?.first_name || 'User'} ${profile?.last_name || ''}`} 
                />
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {getInitials(profile?.first_name, profile?.last_name)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {profile?.first_name} {profile?.last_name}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {profile?.email}
                </p>
                <p className="text-xs leading-none text-blue-600 capitalize">
                  {profile?.role}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              Billing
            </DropdownMenuItem>
            <DropdownMenuItem>
              Team
            </DropdownMenuItem>
            <DropdownMenuItem>
              Subscription
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={signOut}
              className="text-red-600 focus:text-red-600"
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};