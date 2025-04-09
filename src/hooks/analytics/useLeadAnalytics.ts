
import { useSupabaseQuery } from '@/hooks/supabase';
import { 
  LeadSourceData, 
  ConversionRateData, 
  TimeSeriesData,
  LeadStatusDistribution,
  AnalyticsSummary
} from '@/types/analytics-types';
import { useMemo } from 'react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export const useLeadAnalytics = () => {
  // Get all leads to calculate analytics locally
  const { 
    data: leads = [],
    isLoading,
    error
  } = useSupabaseQuery<any[]>('leads', {
    select: 'id, name, email, source, status, created_at, updated_at'
  });

  // Calculate lead source distribution
  const sourceDistribution: LeadSourceData[] = useMemo(() => {
    if (!leads.length) return [];
    
    const sources: Record<string, number> = {};
    
    leads.forEach(lead => {
      const source = lead.source || 'Unknown';
      sources[source] = (sources[source] || 0) + 1;
    });
    
    return Object.entries(sources).map(([source, count]) => ({
      source,
      count,
      percentage: (count / leads.length) * 100
    })).sort((a, b) => b.count - a.count);
  }, [leads]);

  // Calculate lead status distribution
  const statusDistribution: LeadStatusDistribution[] = useMemo(() => {
    if (!leads.length) return [];
    
    const statuses: Record<string, number> = {};
    
    leads.forEach(lead => {
      const status = lead.status || 'Unknown';
      statuses[status] = (statuses[status] || 0) + 1;
    });
    
    return Object.entries(statuses).map(([status, count]) => ({
      status,
      count,
      percentage: (count / leads.length) * 100
    })).sort((a, b) => b.count - a.count);
  }, [leads]);

  // Calculate conversion rates between different lead stages
  const conversionRates: ConversionRateData[] = useMemo(() => {
    if (!leads.length) return [];
    
    const statusCounts: Record<string, number> = {
      new: 0,
      contacted: 0,
      qualified: 0,
      proposal: 0,
      converted: 0,
      lost: 0
    };
    
    leads.forEach(lead => {
      if (statusCounts[lead.status] !== undefined) {
        statusCounts[lead.status]++;
      }
    });
    
    const total = leads.length;
    const newToContacted = statusCounts.contacted / (statusCounts.new || 1);
    const contactedToQualified = statusCounts.qualified / (statusCounts.contacted || 1);
    const qualifiedToProposal = statusCounts.proposal / (statusCounts.qualified || 1);
    const proposalToConverted = statusCounts.converted / (statusCounts.proposal || 1);
    
    return [
      { stage: 'New to Contacted', rate: newToContacted * 100, count: statusCounts.contacted },
      { stage: 'Contacted to Qualified', rate: contactedToQualified * 100, count: statusCounts.qualified },
      { stage: 'Qualified to Proposal', rate: qualifiedToProposal * 100, count: statusCounts.proposal },
      { stage: 'Proposal to Converted', rate: proposalToConverted * 100, count: statusCounts.converted }
    ];
  }, [leads]);

  // Prepare time series data for leads over time
  const timeSeriesData: TimeSeriesData[] = useMemo(() => {
    if (!leads.length) return [];
    
    // Create a map for the last 6 months
    const monthsData: Record<string, { new_leads: number; converted_leads: number }> = {};
    const today = new Date();
    
    // Initialize data points for last 6 months
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(today, i);
      const monthKey = format(monthDate, 'MMM yyyy');
      monthsData[monthKey] = { new_leads: 0, converted_leads: 0 };
    }
    
    // Populate with actual data
    leads.forEach(lead => {
      const createDate = new Date(lead.created_at);
      const monthKey = format(createDate, 'MMM yyyy');
      
      if (monthsData[monthKey]) {
        monthsData[monthKey].new_leads++;
        
        if (lead.status === 'converted') {
          monthsData[monthKey].converted_leads++;
        }
      }
    });
    
    return Object.entries(monthsData).map(([date, data]) => ({
      date,
      new_leads: data.new_leads,
      converted_leads: data.converted_leads
    }));
  }, [leads]);

  // Calculate overall analytics summary
  const analyticsSummary: AnalyticsSummary = useMemo(() => {
    if (!leads.length) {
      return {
        total_leads: 0,
        leads_this_month: 0,
        conversion_rate: 0,
        average_time_to_convert: 0
      };
    }
    
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    
    const leadsThisMonth = leads.filter(lead => {
      const createDate = new Date(lead.created_at);
      return createDate >= monthStart && createDate <= monthEnd;
    }).length;
    
    const convertedLeads = leads.filter(lead => lead.status === 'converted');
    const conversionRate = (convertedLeads.length / leads.length) * 100;
    
    // Calculate average time to convert
    let totalDays = 0;
    let convertedCount = 0;
    
    convertedLeads.forEach(lead => {
      const createDate = new Date(lead.created_at);
      const updateDate = new Date(lead.updated_at);
      const daysToConvert = (updateDate.getTime() - createDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysToConvert > 0) {
        totalDays += daysToConvert;
        convertedCount++;
      }
    });
    
    const averageTimeToConvert = convertedCount ? totalDays / convertedCount : 0;
    
    return {
      total_leads: leads.length,
      leads_this_month: leadsThisMonth,
      conversion_rate: conversionRate,
      average_time_to_convert: averageTimeToConvert
    };
  }, [leads]);

  return {
    isLoading,
    error,
    sourceDistribution,
    statusDistribution,
    conversionRates,
    timeSeriesData,
    analyticsSummary
  };
};
