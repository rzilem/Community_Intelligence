
import { useState, useMemo } from 'react';
import { EmailCampaign } from '@/types/email-campaign-types';

export const useCampaignFilters = (campaigns: EmailCampaign[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'send_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredCampaigns = useMemo(() => {
    let filtered = campaigns.filter(campaign => {
      const matchesSearch = campaign.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           campaign.subject?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Sort campaigns
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      if (sortBy === 'created_at' || sortBy === 'send_at') {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [campaigns, searchTerm, statusFilter, sortBy, sortOrder]);

  const campaignCounts = useMemo(() => {
    return {
      total: campaigns.length,
      draft: campaigns.filter(c => c.status === 'draft').length,
      scheduled: campaigns.filter(c => c.status === 'scheduled').length,
      sent: campaigns.filter(c => c.status === 'sent').length,
      sending: campaigns.filter(c => c.status === 'sending').length
    };
  }, [campaigns]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredCampaigns,
    campaignCounts
  };
};
