
import { useState, useEffect } from 'react';
import { Homeowner } from '@/components/homeowners/detail/types';
import { toast } from 'sonner';

// Mock data for now, would be replaced with actual API calls
const mockHomeowner = {
  id: '101',
  name: 'Alice Johnson',
  email: 'alice.j@example.com',
  phone: '(555) 123-4567',
  moveInDate: '2021-03-15',
  property: 'Oakwood Heights',
  unit: 'Unit 301',
  balance: 1250.00,
  tags: ['Board Member', 'New Resident', 'Delinquent'],
  violations: ['Landscaping Violation', 'ARC Pending'],
  lastContact: {
    called: '2023-06-05',
    visit: '2023-05-20',
    email: '2023-06-02'
  },
  status: 'Active',
  avatarUrl: '',
  notes: [
    {
      type: 'system',
      author: 'System',
      content: 'Late payment notice automatically sent',
      date: '2023-05-16'
    },
    {
      type: 'manual',
      author: 'Jane Smith',
      content: 'Homeowner called about maintenance request for kitchen sink',
      date: '2023-05-02'
    },
    {
      type: 'manual',
      author: 'John Doe',
      content: 'Homeowner mentioned they might renew for another year',
      date: '2023-04-10'
    }
  ]
};

export const useHomeownerData = (homeownerId: string) => {
  const [homeowner, setHomeowner] = useState<Homeowner>(mockHomeowner);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHomeowner = async () => {
      // In a real implementation, this would fetch from an API
      setLoading(true);
      try {
        // Simulating API fetch
        setTimeout(() => {
          setHomeowner(mockHomeowner);
          setLoading(false);
        }, 500);
      } catch (err) {
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
