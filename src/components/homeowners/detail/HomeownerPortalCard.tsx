
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Loader2 } from 'lucide-react';
import { useHomeownerPortal } from '@/hooks/useHomeownerPortal';
import { useNavigate } from 'react-router-dom';

interface HomeownerPortalCardProps {
  residentId: string;
}

export const HomeownerPortalCard: React.FC<HomeownerPortalCardProps> = ({ residentId }) => {
  const { portalUrl, loading, generatePortalLink } = useHomeownerPortal(residentId);
  const navigate = useNavigate();

  const handlePortalAccess = async () => {
    if (portalUrl) {
      navigate(portalUrl);
    } else {
      const newUrl = await generatePortalLink();
      if (newUrl) {
        navigate(newUrl);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Portal Access</CardTitle>
        <CardDescription>
          Access or generate a portal link for this homeowner
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handlePortalAccess}
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <ExternalLink className="h-4 w-4 mr-2" />
          )}
          Access Customer Portal
        </Button>
      </CardContent>
    </Card>
  );
}
