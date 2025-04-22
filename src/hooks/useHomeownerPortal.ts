
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useHomeownerPortal(residentId: string) {
  const [portalUrl, setPortalUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortalLink = async () => {
      try {
        const { data, error } = await supabase
          .from('residents')
          .select('client_portal_link')
          .eq('id', residentId)
          .single();

        if (error) throw error;
        setPortalUrl(data?.client_portal_link);
      } catch (err) {
        console.error('Error fetching portal link:', err);
        toast.error('Failed to fetch portal link');
      } finally {
        setLoading(false);
      }
    };

    if (residentId) {
      fetchPortalLink();
    }
  }, [residentId]);

  const generatePortalLink = async () => {
    try {
      // Generate a unique portal link
      const newPortalLink = `/portal/homeowner?id=${residentId}`;
      
      const { error } = await supabase
        .from('residents')
        .update({ client_portal_link: newPortalLink })
        .eq('id', residentId);

      if (error) throw error;
      
      setPortalUrl(newPortalLink);
      toast.success('Portal link generated successfully');
      return newPortalLink;
    } catch (err) {
      console.error('Error generating portal link:', err);
      toast.error('Failed to generate portal link');
      return null;
    }
  };

  return {
    portalUrl,
    loading,
    generatePortalLink
  };
}
