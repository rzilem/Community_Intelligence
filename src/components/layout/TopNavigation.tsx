import React from 'react';
import { Bell, Plus, Search, Settings, User, LogOut } from 'lucide-react';
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
import {
  SidebarTrigger,
} from '@/components/ui/sidebar';

export function TopNavigation() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="top-nav flex items-center justify-between px-6 py-4 border-b">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-slate-600 hover:text-blue-600" />
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search properties, residents, or documents..."
            className="search-input pl-10 w-96 bg-slate-50 border-slate-200 focus:bg-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Actions */}
        <Button className="btn-blue px-4 py-2 rounded-lg">
          <Plus className="h-4 w-4 mr-2" />
          New HOA
        </Button>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-slate-600 hover:text-blue-600 hover:bg-blue-50"
          >
            <Bell className="h-5 w-5" />
            <span className="notification-badge">3</span>
          </Button>
        </div>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-slate-700 hover:text-blue-600 hover:bg-blue-50"
            >
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-sm font-medium">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                </div>
                <div className="text-xs text-slate-500">Administrator</div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="user-dropdown w-56" align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-slate-900">
                  {user?.user_metadata?.full_name || 'User Profile'}
                </p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Preferences</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer text-red-600 focus:text-red-600"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}