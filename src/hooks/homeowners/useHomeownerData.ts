
import { useState, useEffect } from 'react';
import { Homeowner, NoteType } from '@/components/homeowners/detail/types';
import { toast } from 'sonner';
import { mockHomeowners } from '@/pages/homeowners/homeowner-data';

export const useHomeownerData = (homeownerId: string) => {
  const [homeowner, setHomeowner] = useState<Homeowner>({
    id: '',
    name: '',
    email: '',
    phone: '',
    moveInDate: '',
    property: '',
    unit: '',
    balance: 0,
    tags: [],
    violations: [],
    lastContact: {
      called: '',
      visit: '',
      email: ''
    },
    status: '',
    avatarUrl: '',
    notes: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHomeowner = async () => {
      setLoading(true);
      try {
        // First check if the homeowner exists in the mockHomeowners data
        const foundHomeowner = mockHomeowners.find(h => h.id === homeownerId);
        
        if (foundHomeowner) {
          // Convert the mockHomeowners data to match Homeowner type
          const convertedHomeowner: Homeowner = {
            id: foundHomeowner.id,
            name: foundHomeowner.name,
            email: foundHomeowner.email,
            phone: foundHomeowner.phone || '',
            moveInDate: foundHomeowner.moveInDate,
            property: foundHomeowner.property || foundHomeowner.propertyAddress || '',
            unit: foundHomeowner.unit || foundHomeowner.unitNumber || '',
            balance: foundHomeowner.balance || 0,
            tags: foundHomeowner.tags || [],
            violations: foundHomeowner.violations || [],
            lastContact: {
              called: foundHomeowner.lastContact?.called || '',
              visit: foundHomeowner.lastContact?.visit || '',
              email: foundHomeowner.lastContact?.email || ''
            },
            status: foundHomeowner.status,
            avatarUrl: foundHomeowner.avatarUrl || '',
            notes: (foundHomeowner.notes || []).map(note => ({
              type: (note.type === 'system' ? 'system' : 'manual') as NoteType['type'],
              author: note.author || '',
              content: note.content || '',
              date: note.date || ''
            })),
            // Add additional fields for compatibility
            type: foundHomeowner.type,
            propertyId: foundHomeowner.propertyId,
            propertyAddress: foundHomeowner.propertyAddress,
            association: foundHomeowner.association,
            moveOutDate: foundHomeowner.moveOutDate,
            lastPayment: foundHomeowner.lastPayment,
            aclStartDate: foundHomeowner.aclStartDate
          };
          
          setHomeowner(convertedHomeowner);
        } else {
          // If not found in mock data, use mock data for now
          console.warn(`Homeowner with id ${homeownerId} not found, using mock data instead`);
          // Here we'd normally show an error or fallback, but for demo we'll show mock data
          setHomeowner(prevState => ({...prevState, id: homeownerId}));
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching homeowner data:", err);
        setError('Failed to fetch homeowner data');
        setLoading(false);
      }
    };

    if (homeownerId) {
      fetchHomeowner();
    }
  }, [homeownerId]);

  const updateHomeownerImage = (newUrl: string) => {
    setHomeowner(prev => ({
      ...prev,
      avatarUrl: newUrl
    }));
    toast.success('Profile image updated successfully');
  };

  return {
    homeowner,
    loading,
    error,
    updateHomeownerImage
  };
};
