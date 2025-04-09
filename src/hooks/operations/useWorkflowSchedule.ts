
import { useState } from 'react';
import { WorkflowSchedule } from '@/types/operations-types';

export const useWorkflowSchedule = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<WorkflowSchedule[]>([]);

  const fetchSchedules = () => {
    setLoading(true);
    setError(null);
    
    // This would be replaced with an actual API call in production
    setTimeout(() => {
      const mockSchedules: WorkflowSchedule[] = [
        {
          id: '1',
          name: 'Post Paylease Payments',
          scheduleDate: '2019-12-17',
          scheduledTime: '12:00 AM (CST)',
          timezone: 'CST',
          lastRun: '2019-12-17T08:34:13.000Z',
          nextRun: '2020-04-27T12:00:06.000Z',
          endRun: '2020-04-27T12:00:07.000Z',
          status: 'active',
          type: 'payment'
        },
        {
          id: '2',
          name: 'Charge Generation',
          scheduleDate: '2022-03-29',
          scheduledTime: '1:00 AM (CST)',
          timezone: 'CST',
          lastRun: '2022-03-29T21:57:29.000Z',
          nextRun: '2022-07-19T01:00:16.000Z',
          endRun: '2022-07-19T01:01:51.000Z',
          status: 'active',
          type: 'payment'
        },
        {
          id: '3',
          name: 'Homewise Assoc Summary',
          scheduleDate: '2022-08-10',
          scheduledTime: '1:00 AM (CST)',
          timezone: 'CST',
          lastRun: '2022-08-10T10:47:03.000Z',
          nextRun: '2023-08-15T01:00:59.000Z',
          endRun: '2023-08-15T01:03:32.000Z',
          status: 'active',
          type: 'report'
        },
        {
          id: '4',
          name: 'Homewise Assoc Summary',
          scheduleDate: '2022-08-10',
          scheduledTime: '1:00 AM (CST)',
          timezone: 'CST',
          lastRun: '2022-08-10T10:47:04.000Z',
          nextRun: '2023-07-12T01:00:26.000Z',
          endRun: '2023-07-12T01:03:00.000Z',
          status: 'completed',
          type: 'report'
        },
        {
          id: '5',
          name: 'Geocode Addresses',
          scheduleDate: '2019-10-15',
          scheduledTime: '2:00 AM (CST)',
          timezone: 'CST',
          lastRun: '2018-05-07T12:21:30.000Z',
          nextRun: '2025-04-08T02:00:08.000Z',
          endRun: '2025-04-08T02:00:08.000Z',
          status: 'active',
          type: 'sync'
        },
        {
          id: '6',
          name: 'MoB Validation File',
          scheduleDate: '2019-10-14',
          scheduledTime: '3:00 AM (CST)',
          timezone: 'CST',
          lastRun: '2018-05-16T16:47:14.000Z',
          nextRun: '2024-08-20T03:01:30.000Z',
          endRun: '2024-08-20T03:02:05.000Z',
          status: 'active',
          type: 'file'
        },
        {
          id: '7',
          name: 'Recurring Transfer',
          scheduleDate: '2019-10-15',
          scheduledTime: '3:00 AM (CST)',
          timezone: 'CST',
          lastRun: '2018-05-01T14:14:58.000Z',
          nextRun: '2025-04-08T03:00:09.000Z',
          endRun: '2025-04-08T03:00:13.000Z',
          status: 'active',
          type: 'payment'
        },
        {
          id: '8',
          name: 'MoB Validation File',
          scheduleDate: '2018-05-02',
          scheduledTime: '3:45 AM (CST)',
          timezone: 'CST',
          lastRun: '2018-05-01T14:14:58.000Z',
          nextRun: '',
          endRun: '',
          status: 'completed',
          type: 'file'
        },
        {
          id: '9',
          name: 'Recurring GL',
          scheduleDate: '2019-10-15',
          scheduledTime: '4:00 AM (CST)',
          timezone: 'CST',
          lastRun: '2018-05-01T14:14:58.000Z',
          nextRun: '2025-04-08T04:00:24.000Z',
          endRun: '2025-04-08T04:00:26.000Z',
          status: 'active',
          type: 'report'
        },
        {
          id: '10',
          name: 'Update Current Tenant',
          scheduleDate: '2019-10-23',
          scheduledTime: '4:00 AM (CST)',
          timezone: 'CST',
          lastRun: '2019-10-30T21:57:09.000Z',
          nextRun: '2025-04-08T04:00:24.000Z',
          endRun: '2025-04-08T04:00:27.000Z',
          status: 'active',
          type: 'sync'
        },
        {
          id: '11',
          name: 'Post Service Contract Invoices',
          scheduleDate: '2019-10-15',
          scheduledTime: '4:30 AM (CST)',
          timezone: 'CST',
          lastRun: '2018-05-01T14:14:58.000Z',
          nextRun: '2025-04-08T04:30:33.000Z',
          endRun: '2025-04-08T04:30:34.000Z',
          status: 'active',
          type: 'payment'
        },
        {
          id: '12',
          name: 'Action Items',
          scheduleDate: '2022-03-29',
          scheduledTime: '5:00 AM (CST)',
          timezone: 'CST',
          lastRun: '2022-03-29T21:57:29.000Z',
          nextRun: '2025-04-08T05:01:58.000Z',
          endRun: '2025-04-08T05:02:18.000Z',
          status: 'error',
          type: 'notification'
        },
        {
          id: '13',
          name: 'Auto-Waive Fees',
          scheduleDate: '2022-01-20',
          scheduledTime: '5:30 AM (CST)',
          timezone: 'CST',
          lastRun: '2018-05-01T14:14:58.000Z',
          nextRun: '2025-04-08T05:31:12.000Z',
          endRun: '2025-04-08T05:31:15.000Z',
          status: 'paused',
          type: 'payment'
        },
      ];
      
      setSchedules(mockSchedules);
      setLoading(false);
    }, 800);
  };

  // Filter schedules by type
  const filterByType = (type: string) => {
    if (type === 'all') {
      return schedules;
    }
    return schedules.filter(schedule => schedule.type === type);
  };

  // Filter schedules by status
  const filterByStatus = (status: string) => {
    if (status === 'all') {
      return schedules;
    }
    return schedules.filter(schedule => schedule.status === status);
  };

  return {
    schedules,
    loading,
    error,
    fetchSchedules,
    filterByType,
    filterByStatus
  };
};
