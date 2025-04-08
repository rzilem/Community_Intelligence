
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Users2, Plus, Search, Filter, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSupabaseQuery } from '@/hooks/supabase';
import { ResidentWithProfile } from '@/types/app-types';
import { useAuth } from '@/contexts/AuthContext';
import { ResidentCard } from '@/components/residents/ResidentCard';
import { ResidentDialog } from '@/components/residents/ResidentDialog';
import TooltipButton from '@/components/ui/tooltip-button';

const Residents = () => {
  const { currentAssociation } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState<ResidentWithProfile | null>(null);

  const { data: residentsData = [], isLoading, error } = useSupabaseQuery<ResidentWithProfile[]>(
    'residents',
    {
      select: '*, user:user_id(profile:profiles(*))',
      filter: [],
      order: { column: 'name', ascending: true },
    },
    !!currentAssociation
  );

  // Ensure residents is always an array
  const residents = residentsData;

  const filteredResidents = residents.filter(resident => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (resident.name && resident.name.toLowerCase().includes(searchLower)) || 
      (resident.email && resident.email.toLowerCase().includes(searchLower)) ||
      (resident.phone && resident.phone.toLowerCase().includes(searchLower))
    );
  });

  const handleAddResident = () => {
    setSelectedResident(null);
    setIsDialogOpen(true);
  };

  const handleEditResident = (resident: ResidentWithProfile) => {
    setSelectedResident(resident);
    setIsDialogOpen(true);
  };

  return (
    <PageTemplate 
      title="Residents" 
      icon={<Users2 className="h-8 w-8" />}
      description="Manage resident information, contacts, and communication preferences."
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search residents..." 
                className="pl-8"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <TooltipButton
                variant="outline"
                size="sm"
                tooltip="Filter residents"
              >
                <Filter className="h-4 w-4 mr-2" /> Filter
              </TooltipButton>
              
              <TooltipButton
                variant="outline"
                size="sm" 
                tooltip="Export resident data"
              >
                <Download className="h-4 w-4 mr-2" /> Export
              </TooltipButton>
              
              <TooltipButton
                variant="default"
                size="sm"
                onClick={handleAddResident}
                tooltip="Add a new resident"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Resident
              </TooltipButton>
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse bg-muted rounded-lg p-4 h-48"></div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500">Error loading residents. Please try again later.</p>
            </div>
          ) : filteredResidents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResidents.map(resident => (
                <ResidentCard 
                  key={resident.id} 
                  resident={resident}
                  onEdit={() => handleEditResident(resident)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? "No residents match your search criteria." 
                  : "No residents found in this community."}
              </p>
              <Button onClick={handleAddResident}>
                <Plus className="h-4 w-4 mr-2" /> Add Your First Resident
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <ResidentDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        resident={selectedResident} 
      />
    </PageTemplate>
  );
};

export default Residents;
