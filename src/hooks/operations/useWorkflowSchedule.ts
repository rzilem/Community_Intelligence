
import { useState } from 'react';
import { WorkflowSchedule } from '@/types/operations-types';

// Demo data for workflow schedules
const demoSchedules: WorkflowSchedule[] = [
  {
    id: '1',
    name: 'Monthly Assessment Billing',
    type: 'payment',
    status: 'active',
    scheduleDate: '2025-04-01',
    scheduledTime: '01:00 AM',
    lastRun: '2025-03-01T01:00:00Z',
    nextRun: '2025-04-01T01:00:00Z',
    endRun: '2026-04-01T01:00:00Z',
  },
  {
    id: '2',
    name: 'Weekly Violation Report',
    type: 'report',
    status: 'active',
    scheduleDate: '2025-04-10',
    scheduledTime: '07:00 AM',
    lastRun: '2025-04-03T07:00:00Z',
    nextRun: '2025-04-10T07:00:00Z',
    endRun: '2026-04-10T07:00:00Z',
  },
  {
    id: '3',
    name: 'Database Maintenance',
    type: 'maintenance',
    status: 'paused',
    scheduleDate: '2025-04-15',
    scheduledTime: '02:00 AM',
    lastRun: '2025-03-15T02:00:00Z',
    nextRun: '2025-04-15T02:00:00Z',
    endRun: '2026-04-15T02:00:00Z',
  },
  {
    id: '4',
    name: 'Payment Processing',
    type: 'payment',
    status: 'error',
    scheduleDate: '2025-04-02',
    scheduledTime: '03:00 AM',
    lastRun: '2025-04-02T03:00:00Z',
    nextRun: '2025-04-03T03:00:00Z',
    endRun: '2026-04-02T03:00:00Z',
  },
  {
    id: '5',
    name: 'Document Sync',
    type: 'sync',
    status: 'completed',
    scheduleDate: '2025-04-05',
    scheduledTime: '04:00 AM',
    lastRun: '2025-04-05T04:00:00Z',
    nextRun: null,
    endRun: '2025-04-05T04:00:00Z',
  }
];

export const useWorkflowSchedule = () => {
  const [schedules, setSchedules] = useState<WorkflowSchedule[]>(demoSchedules);
  const [loading, setLoading] = useState(false);

  const fetchSchedules = async () => {
    setLoading(true);
    // Simulating API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);

    // In a real implementation, this would fetch from Supabase
    // const { data, error } = await supabase.from('workflow_schedules').select('*');
    // if (error) throw error;
    // return data;
  };

  const filterByType = (type: string) => {
    if (type === 'all') return schedules;
    return schedules.filter(schedule => schedule.type === type);
  };

  const filterByStatus = (status: string) => {
    if (status === 'all') return schedules;
    return schedules.filter(schedule => schedule.status === status);
  };

  return {
    schedules,
    loading,
    fetchSchedules,
    filterByType,
    filterByStatus
  };
};
