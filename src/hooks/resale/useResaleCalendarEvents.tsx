import { useState, useMemo } from 'react';
import { useSupabaseQuery } from '@/hooks/supabase';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useAuth } from '@/contexts/auth';

export const useResaleCalendarEvents = () => {
  const { currentAssociation } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = useMemo(() => startOfMonth(currentMonth), [currentMonth]);
  const monthEnd = useMemo(() => endOfMonth(currentMonth), [currentMonth]);

  const { data: resaleEvents, isLoading: resaleEventsLoading } = useSupabaseQuery<any[]>(
    'resale_calendar_events',
    {
      select: '*',
      filter: currentAssociation ? [
        { column: 'association_id', value: currentAssociation.id },
        { column: 'date', operator: 'gte', value: format(monthStart, 'yyyy-MM-dd') },
        { column: 'date', operator: 'lte', value: format(monthEnd, 'yyyy-MM-dd') }
      ] : [],
    },
    !!currentAssociation
  );

  return { resaleEvents, resaleEventsLoading, currentMonth, setCurrentMonth };
};
