
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UseFormReturn } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSupabaseQuery } from '@/hooks/supabase';

interface RequestDialogTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  children: React.ReactNode;
  form: UseFormReturn<any>;
}

const RequestDialogTabs: React.FC<RequestDialogTabsProps> = ({
  activeTab,
  setActiveTab,
  children,
  form
}) => {
  // Query staff members from profiles table
  const { data: staffMembers = [], isLoading } = useSupabaseQuery<any[]>(
    'profiles',
    {
      select: 'id, first_name, last_name, email',
    }
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
        <TabsList className="h-9">
          <TabsTrigger value="details" className="text-sm px-3">Details</TabsTrigger>
          <TabsTrigger value="comments" className="text-sm px-3">Comments</TabsTrigger>
          <TabsTrigger value="email" className="text-sm px-3">Original Email</TabsTrigger>
          <TabsTrigger value="attachments" className="text-sm px-3">Attachments</TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-3 ml-auto">
          <Select
            value={form.watch('assigned_to') || 'unassigned'}
            onValueChange={(value) => form.setValue('assigned_to', value)}
          >
            <SelectTrigger className="w-[200px] h-9 bg-white text-sm">
              <SelectValue placeholder="Assign to..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {staffMembers.map((staff) => (
                <SelectItem key={staff.id} value={staff.id}>
                  {staff.first_name || ''} {staff.last_name || ''} {staff.email ? `(${staff.email})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {children}
    </div>
  );
};

export default RequestDialogTabs;
