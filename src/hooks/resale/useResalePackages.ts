import { useState, useEffect } from 'react';

export interface ResalePackage {
  id: string;
  property_id: string;
  requester_name: string;
  requester_email: string;
  requester_phone?: string;
  buyer_name?: string;
  buyer_email?: string;
  closing_date?: string;
  package_type: string;
  status: string;
  request_date: string;
  completed_date?: string;
  documents_generated?: string[];
  fees_collected: number;
  notes?: string;
  association_id: string;
  created_at: string;
  updated_at: string;
  properties?: {
    unit_number: string;
    address: string;
  };
}

export const useResalePackages = (associationId?: string) => {
  const [packages, setPackages] = useState<ResalePackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResalePackages();
  }, [associationId]);

  const fetchResalePackages = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Mock: Return sample resale packages
      const mockPackages: ResalePackage[] = [
        {
          id: '1',
          property_id: 'prop-1',
          requester_name: 'John Smith',
          requester_email: 'john@example.com',
          requester_phone: '555-0123',
          buyer_name: 'Jane Doe',
          buyer_email: 'jane@example.com',
          closing_date: '2024-01-15',
          package_type: 'Standard',
          status: 'pending',
          request_date: '2023-12-01',
          documents_generated: ['Certificate of Compliance', 'Financial Statement'],
          fees_collected: 350,
          notes: 'Standard resale package request',
          association_id: associationId || 'assoc-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          properties: {
            unit_number: '101',
            address: '123 Main St'
          }
        }
      ];

      console.log('Mock: Fetching resale packages for association:', associationId);
      setPackages(associationId ? mockPackages.filter(p => p.association_id === associationId) : mockPackages);

    } catch (err) {
      console.error('Error fetching resale packages:', err);
      setError('Failed to load resale packages');
    } finally {
      setIsLoading(false);
    }
  };

  const createResalePackage = async (packageData: Omit<ResalePackage, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Mock: Create new resale package
      const newPackage: ResalePackage = {
        ...packageData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Mock: Creating resale package', newPackage);
      setPackages(prev => [newPackage, ...prev]);
      return newPackage;
    } catch (err) {
      console.error('Error creating resale package:', err);
      throw err;
    }
  };

  const updateResalePackage = async (id: string, updates: Partial<ResalePackage>) => {
    try {
      // Mock: Update resale package
      const updatedPackage = packages.find(p => p.id === id);
      if (!updatedPackage) throw new Error('Package not found');

      const updated = {
        ...updatedPackage,
        ...updates,
        updated_at: new Date().toISOString()
      };

      console.log('Mock: Updating resale package', updated);
      setPackages(prev => prev.map(pkg => pkg.id === id ? updated : pkg));
      return updated;
    } catch (err) {
      console.error('Error updating resale package:', err);
      throw err;
    }
  };

  return {
    packages,
    isLoading,
    error,
    refetch: fetchResalePackages,
    createResalePackage,
    updateResalePackage
  };
};