
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSupabaseQuery, useSupabaseUpdate } from '@/hooks/supabase';
import { Mail, Clock, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import InviteResidentDialog from './InviteResidentDialog';

interface AdminInvitationManagementProps {
  associationId: string;
}

const AdminInvitationManagement: React.FC<AdminInvitationManagementProps> = ({ associationId }) => {
  const { data: invitations = [], refetch } = useSupabaseQuery(
    'resident_invitations',
    {
      select: `
        *,
        properties(address, unit_number),
        invited_by_profile:profiles!invited_by(first_name, last_name)
      `,
      filter: [{ column: 'association_id', value: associationId }],
      order: { column: 'created_at', ascending: false }
    }
  );

  const updateInvitation = useSupabaseUpdate('resident_invitations', {
    onSuccess: () => {
      toast.success('Invitation updated successfully');
      refetch();
    }
  });

  const getStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();
    
    if (isExpired && status === 'sent') {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    switch (status) {
      case 'sent':
        return <Badge variant="secondary">Pending</Badge>;
      case 'accepted':
        return <Badge variant="default" className="bg-green-500">Accepted</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const cancelInvitation = (invitationId: string) => {
    updateInvitation.mutate({
      id: invitationId,
      data: { status: 'cancelled' }
    });
  };

  const resendInvitation = (invitationId: string) => {
    updateInvitation.mutate({
      id: invitationId,
      data: { 
        status: 'sent',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Resident Invitations</h3>
        <InviteResidentDialog associationId={associationId} />
      </div>

      <div className="grid gap-4">
        {invitations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No invitations sent yet</p>
            </CardContent>
          </Card>
        ) : (
          invitations.map((invitation: any) => (
            <Card key={invitation.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{invitation.email}</h4>
                      {getStatusBadge(invitation.status, invitation.expires_at)}
                    </div>
                    
                    {invitation.properties && (
                      <p className="text-sm text-muted-foreground">
                        Property: {invitation.properties.address}
                        {invitation.properties.unit_number && 
                          ` Unit ${invitation.properties.unit_number}`
                        }
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Sent: {new Date(invitation.created_at).toLocaleDateString()}
                      </span>
                      
                      {invitation.invited_by_profile && (
                        <span>
                          By: {invitation.invited_by_profile.first_name} {invitation.invited_by_profile.last_name}
                        </span>
                      )}
                      
                      <span>
                        Expires: {new Date(invitation.expires_at).toLocaleDateString()}
                      </span>
                    </div>

                    {invitation.accepted_at && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Accepted on {new Date(invitation.accepted_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {invitation.status === 'sent' && new Date(invitation.expires_at) > new Date() && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cancelInvitation(invitation.id)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                    
                    {(invitation.status === 'sent' && new Date(invitation.expires_at) < new Date()) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resendInvitation(invitation.id)}
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Resend
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminInvitationManagement;
