
import { useState, useEffect } from 'react';
import { mockResidents } from '../resident-data';
import { useAssociationsList } from '@/hooks/associations';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useResidentsData = () => {
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { associations, isLoading: loadingAssociations } = useAssociationsList();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real app, you would fetch from Supabase here
        // For now, we're using mock data
        const enhancedResidents = mockResidents.map(resident => {
          // Check if the association exists in our list of valid associations
          const hasValidAssociation = associations.some(
            assoc => assoc.name === resident.association
          );
          
          return {
            ...resident,
            hasValidAssociation
          };
        });
        
        setTimeout(() => {
          setResidents(enhancedResidents);
          setLoading(false);
        }, 500); // Simulate network delay
      } catch (error) {
        console.error('Error fetching residents:', error);
        setLoading(false);
      }
    };

    if (!loadingAssociations) {
      fetchData();
    }
  }, [associations, loadingAssociations]);

  const fetchResidentsData = () => {
    setLoading(true);
    // Simulate refetching data
    setTimeout(() => {
      setResidents(mockResidents);
      setLoading(false);
    }, 500);
  };

  // Export residents as CSV
  const exportResidentsAsCSV = () => {
    try {
      // Convert residents to CSV format
      const headers = ['Name', 'Email', 'Property Address', 'Association', 'Type', 'Status'];
      const csvData = [
        headers.join(','),
        ...residents.map(resident => [
          `"${resident.name}"`,
          `"${resident.email}"`,
          `"${resident.propertyAddress}"`,
          `"${resident.association}"`,
          `"${resident.type}"`,
          `"${resident.status}"`
        ].join(','))
      ].join('\n');

      // Create a blob and download
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'residents.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Residents exported successfully as CSV');
      return true;
    } catch (error) {
      console.error('Error exporting residents:', error);
      toast.error('Failed to export residents');
      return false;
    }
  };

  // Export residents as PDF (mock implementation)
  const exportResidentsAsPDF = () => {
    try {
      toast.success('Residents exported successfully as PDF');
      // In a real implementation, you would use a PDF library like jsPDF
      // to generate a PDF file from the residents data
      return true;
    } catch (error) {
      console.error('Error exporting residents:', error);
      toast.error('Failed to export residents');
      return false;
    }
  };

  return {
    residents,
    loading: loading || loadingAssociations,
    associations,
    fetchResidentsData,
    exportResidentsAsCSV,
    exportResidentsAsPDF
  };
};
