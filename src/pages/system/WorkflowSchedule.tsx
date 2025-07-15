
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';
import { Clock, PlayCircle } from 'lucide-react';
import { useWorkflowSchedule } from '@/hooks/operations/useWorkflowSchedule';
import WorkflowScheduleTable from '@/components/operations/WorkflowScheduleTable';
import WorkflowScheduleFilters from '@/components/operations/WorkflowScheduleFilters';
import WorkflowScheduleStats from '@/components/operations/WorkflowScheduleStats';
import { WorkflowSchedule } from '@/types/operations-types';

const WorkflowSchedulePage = () => {
  const { schedules, loading, fetchSchedules, filterByType, filterByStatus } = useWorkflowSchedule();
  const [filteredSchedules, setFilteredSchedules] = useState<WorkflowSchedule[]>([]);
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('all');
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchSchedules();
  }, []);

  useEffect(() => {
    // Apply all filters
    let result = schedules;
    
    // Apply type filter
    if (activeTypeFilter !== 'all') {
      result = filterByType(activeTypeFilter);
    }
    
    // Apply status filter
    if (activeStatusFilter !== 'all') {
      result = filterByStatus(activeStatusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(schedule => 
        schedule.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredSchedules(result);
  }, [schedules, activeTypeFilter, activeStatusFilter, searchTerm]);

  // Handle filter changes
  const handleTypeFilter = (type: string) => {
    setActiveTypeFilter(type);
  };

  const handleStatusFilter = (status: string) => {
    setActiveStatusFilter(status);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleRefresh = () => {
    fetchSchedules();
  };

  return (
    <AppLayout>
      <PageTemplate 
        title="Workflow Schedule" 
        icon={<Clock className="h-8 w-8" />}
        description="Manage scheduled automated system workflows and background processes."
      >
        <div className="space-y-6">
          <WorkflowScheduleStats schedules={schedules} />
          
          <WorkflowScheduleFilters 
            onRefresh={handleRefresh}
            onFilterByType={handleTypeFilter}
            onFilterByStatus={handleStatusFilter}
            onSearch={handleSearch}
          />
          
          <WorkflowScheduleTable schedules={filteredSchedules} isLoading={loading} />
        </div>
      </PageTemplate>
    </AppLayout>
  );
};

export default WorkflowSchedulePage;
