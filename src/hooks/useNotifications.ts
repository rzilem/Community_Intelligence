
import { useState, useEffect } from 'react';
import { useInvoiceNotifications } from '@/hooks/invoices/useInvoiceNotifications';
import { useLeadNotifications } from '@/hooks/leads/useLeadNotifications';

export interface SectionNotifications {
  [key: string]: number;
}

export const useNotifications = () => {
  const [sectionCounts, setSectionCounts] = useState<SectionNotifications>({});
  const { unreadLeadsCount } = useLeadNotifications();
  const { unreadInvoicesCount } = useInvoiceNotifications();
  
  useEffect(() => {
    const counts: SectionNotifications = {
      // Mapping section names to their notification counts
      'lead-management': unreadLeadsCount,
      'accounting': unreadInvoicesCount,
      'communications': 3, // Mock value for demonstration purposes
      'homeowner-requests': 2 // Mock value for demonstration purposes
    };
    
    setSectionCounts(counts);
  }, [unreadLeadsCount, unreadInvoicesCount]);

  // Get the count for a specific section
  const getCountForSection = (section: string): number => {
    return sectionCounts[section] || 0;
  };
  
  // Get the total count across all sections
  const getTotalCount = (): number => {
    return Object.values(sectionCounts).reduce((total, count) => total + count, 0);
  };

  return {
    sectionCounts,
    getCountForSection,
    getTotalCount
  };
};
