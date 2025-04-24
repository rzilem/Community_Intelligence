
import { useState } from 'react';
import { useSupabaseQuery } from '@/hooks/supabase';
import { Lead, LEAD_COLUMN_DEFINITIONS } from '@/types/lead-types';
import { useTableColumns } from './useTableColumns';

export const useLeadOperations = () => {
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  
  const { 
    data: leads = [], 
    isLoading,
    error,
    refetch: refreshLeadsData
  } = useSupabaseQuery<Lead[]>(
    'leads' as any,
    {
      select: '*',
      order: { column: 'created_at', ascending: false }
    }
  );
  
  const { 
    columns, 
    visibleColumnIds, 
    updateVisibleColumns,
    reorderColumns,
    resetToDefaults 
  } = useTableColumns(
    LEAD_COLUMN_DEFINITIONS,
    'leads-visible-columns'
  );
  
  const refreshLeads = async () => {
    try {
      console.log('Refreshing leads data...');
      await refreshLeadsData();
      setLastRefreshed(new Date());
      console.log('Leads refresh completed');
    } catch (error) {
      console.error('Error refreshing leads:', error);
      throw error;
    }
  };

  if (leads.length > 0) {
    console.log('Leads data loaded:', leads.length, 'leads');
    console.log('Sample lead:', leads[0]);
  } else if (!isLoading) {
    console.log('No leads found in the database');
  }
  
  if (error) {
    console.error('Error fetching leads:', error);
  }

  return {
    leads,
    isLoading,
    error,
    lastRefreshed,
    refreshLeads,
    columns,
    visibleColumnIds,
    updateVisibleColumns,
    reorderColumns,
    resetToDefaults
  };
};
