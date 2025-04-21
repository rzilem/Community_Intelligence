
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export interface CollaboratorInfo {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  lastActive: string;
  cursor?: { x: number, y: number };
}

export const useCollaborationWidget = (widgetId: string) => {
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState<CollaboratorInfo[]>([]);
  const [channel, setChannel] = useState<any>(null);
  
  useEffect(() => {
    if (!user?.id || !widgetId) return;
    
    // Initialize the Supabase Realtime channel for this widget
    const widgetChannel = supabase.channel(`widget:${widgetId}`);
    
    // Track the current user's presence
    const userInfo: CollaboratorInfo = {
      userId: user.id,
      name: user.email?.split('@')[0] || 'Anonymous',
      email: user.email || '',
      lastActive: new Date().toISOString(),
      cursor: null
    };
    
    // Set up Presence (users currently viewing/editing the widget)
    const subscription = widgetChannel
      .on('presence', { event: 'sync' }, () => {
        // Get the current state whenever it syncs
        const state = widgetChannel.presenceState();
        const collaboratorsList: CollaboratorInfo[] = [];
        
        // Transform the state into a usable array
        Object.keys(state).forEach(key => {
          state[key].forEach((presence: any) => {
            if (presence.userId !== user.id) {
              collaboratorsList.push(presence as CollaboratorInfo);
            }
          });
        });
        
        setCollaborators(collaboratorsList);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }: { key: string, newPresences: any[] }) => {
        // Someone joined
        if (key !== user.id) {
          toast.info(`${newPresences[0]?.name || 'Someone'} is now viewing this widget`);
        }
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }: { key: string, leftPresences: any[] }) => {
        // Someone left
        if (key !== user.id) {
          toast.info(`${leftPresences[0]?.name || 'Someone'} has left this widget`);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track the current user once subscribed
          await widgetChannel.track(userInfo);
        }
      });
    
    setChannel(widgetChannel);
    
    // Clean up the subscription when the component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, widgetId]);
  
  // Function to update your cursor position
  const updateCursorPosition = async (x: number, y: number) => {
    if (!channel || !user?.id) return;
    
    await channel.track({
      userId: user.id,
      name: user.email?.split('@')[0] || 'Anonymous',
      email: user.email,
      lastActive: new Date().toISOString(),
      cursor: { x, y }
    });
  };
  
  // Function to send widget changes to collaborators
  const broadcastChange = async (changeType: string, data: any) => {
    if (!channel) return;
    
    await channel.send({
      type: 'broadcast',
      event: 'widget_change',
      payload: {
        changeType,
        data,
        userId: user?.id,
        timestamp: new Date().toISOString()
      }
    });
  };
  
  return {
    collaborators,
    updateCursorPosition,
    broadcastChange
  };
};
