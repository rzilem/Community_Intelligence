
import { useState, useEffect } from 'react';
import { mockResidents } from '../resident-data';
import { useAssociationsList } from '@/hooks/associations';

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

  return {
    residents,
    loading: loading || loadingAssociations,
    associations,
    fetchResidentsData
  };
};
