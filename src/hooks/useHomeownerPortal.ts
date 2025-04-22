
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth/useAuth';
import { useResidentNotes } from '@/hooks/homeowners/resident/useResidentNotes';
import { UserWithProfile } from '@/types/user-types';

export function useHomeownerPortal(residentId: string) {
  const [portalUrl, setPortalUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addNote } = useResidentNotes(residentId);

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

  const logPortalAccess = async () => {
    if (!user || !residentId) return;
    
    try {
      // Cast the user to UserWithProfile to access profile properties safely
      const currentUser = user as unknown as UserWithProfile;
      const userName = currentUser.profile?.first_name && currentUser.profile?.last_name 
        ? `${currentUser.profile.first_name} ${currentUser.profile.last_name}`
        : currentUser.email || 'Customer Service';
      
      await addNote({
        type: 'system',
        content: `Customer portal accessed by ${userName}`,
        author: 'System'
      });
      
      return true;
    } catch (error) {
      console.error('Error logging portal access:', error);
      return false;
    }
  };

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
    generatePortalLink,
    logPortalAccess
  };
}
