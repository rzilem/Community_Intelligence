
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, ExternalLink, Lock } from 'lucide-react';
import { Proposal } from '@/types/proposal-types';
import { toast } from 'sonner';
import { useProposals } from '@/hooks/proposals/useProposals';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ClientPortalLinkGeneratorProps {
  proposal: Proposal;
  onLinkGenerated: (link: string) => void;
}

const ClientPortalLinkGenerator: React.FC<ClientPortalLinkGeneratorProps> = ({
  proposal,
  onLinkGenerated,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [requireSignature, setRequireSignature] = useState(proposal.signature_required || false);
  const [passwordProtection, setPasswordProtection] = useState(false);
  const [password, setPassword] = useState('');
  const { updateProposal } = useProposals();

  const baseUrl = window.location.origin;
  const proposalLink = proposal.client_portal_link || 
    `${baseUrl}/client-portal/proposals/${proposal.id}`;

  const handleGenerateLink = async () => {
    try {
      setIsGenerating(true);
      
      const uniqueId = Math.random().toString(36).substring(2, 15);
      const newLink = `${baseUrl}/client-portal/proposals/${proposal.id}?access=${uniqueId}`;
      
      await updateProposal({
        id: proposal.id,
        data: {
          ...proposal,
          client_portal_link: newLink,
          signature_required: requireSignature
        }
      });
      
      onLinkGenerated(newLink);
      toast.success("Client portal link generated successfully");
    } catch (error: any) {
      toast.error(`Error generating link: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(proposalLink);
    toast.success("Link copied to clipboard");
  };

  const openClientPortal = () => {
    window.open(proposalLink, '_blank');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="client-portal-link">Client Portal Link</Label>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsSettingsOpen(true)}
          >
            Portal Settings
          </Button>
        </div>
        <div className="flex">
          <Input
            id="client-portal-link"
            value={proposalLink}
            readOnly
            className="flex-1 rounded-r-none"
          />
          <Button 
            variant="secondary" 
            className="rounded-l-none border-l-0"
            onClick={copyLink}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button 
            variant="default" 
            className="ml-2"
            onClick={openClientPortal}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View
          </Button>
        </div>
      </div>
      
      {!proposal.client_portal_link && (
        <Button 
          onClick={handleGenerateLink} 
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? 'Generating...' : 'Generate Client Portal Link'}
        </Button>
      )}
      
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Client Portal Settings</DialogTitle>
            <DialogDescription>
              Configure how clients interact with your proposal
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="require-signature">Require Signature</Label>
                <p className="text-sm text-muted-foreground">
                  Client must sign to accept the proposal
                </p>
              </div>
              <Switch
                id="require-signature"
                checked={requireSignature}
                onCheckedChange={setRequireSignature}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="password-protection">Password Protection</Label>
                <p className="text-sm text-muted-foreground">
                  Require a password to view the proposal
                </p>
              </div>
              <Switch
                id="password-protection"
                checked={passwordProtection}
                onCheckedChange={setPasswordProtection}
              />
            </div>
            
            {passwordProtection && (
              <div className="space-y-2">
                <Label htmlFor="portal-password">Password</Label>
                <div className="flex">
                  <Input
                    id="portal-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter a secure password"
                    className="flex-1"
                  />
                  <Lock className="h-4 w-4 ml-2 self-center text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                handleGenerateLink();
                setIsSettingsOpen(false);
              }}
            >
              Save & Generate Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientPortalLinkGenerator;
