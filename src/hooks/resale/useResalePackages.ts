import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

      let query = supabase
        .from('resale_packages')
        .select(`
          *,
          properties!inner(
            unit_number,
            address
          )
        `);

      if (associationId) {
        query = query.eq('association_id', associationId);
      }

      const { data, error: fetchError } = await query
        .order('request_date', { ascending: false });

      if (fetchError) throw fetchError;

      setPackages(data || []);

    } catch (err) {
      console.error('Error fetching resale packages:', err);
      setError('Failed to load resale packages');
    } finally {
      setIsLoading(false);
    }
  };

  const createResalePackage = async (packageData: Omit<ResalePackage, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('resale_packages')
        .insert([packageData])
        .select(`
          *,
          properties!inner(
            unit_number,
            address
          )
        `)
        .single();

      if (error) throw error;

      if (data) {
        setPackages(prev => [data, ...prev]);
        return data;
      }
    } catch (err) {
      console.error('Error creating resale package:', err);
      throw err;
    }
  };

  const updateResalePackage = async (id: string, updates: Partial<ResalePackage>) => {
    try {
      const { data, error } = await supabase
        .from('resale_packages')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          properties!inner(
            unit_number,
            address
          )
        `)
        .single();

      if (error) throw error;

      if (data) {
        setPackages(prev => prev.map(pkg => 
          pkg.id === id ? data : pkg
        ));
        return data;
      }
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