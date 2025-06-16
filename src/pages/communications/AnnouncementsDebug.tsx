import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, RefreshCw } from 'lucide-react';
import { useAnnouncementsDebug } from '@/hooks/communications/useAnnouncementsDebug';
import { useAuth } from '@/contexts/auth';
import TooltipButton from '@/components/ui/tooltip-button';

const AnnouncementsDebug = () => {
  const { currentAssociation, user } = useAuth();
  const { 
    announcements, 
    isLoading, 
    error, 
    fetchAnnouncements, 
    createAnnouncement,
    logDebugInfo 
  } = useAnnouncementsDebug();

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  console.log('[AnnouncementsDebug] Component render:', {
    currentAssociation: currentAssociation?.name,
    user: user?.email,
    announcementsCount: announcements.length,
    isLoading,
    error: error?.message
  });

  const handleCreateAnnouncement = async () => {
    if (!newTitle.trim() || !user || !currentAssociation) {
      console.log('[AnnouncementsDebug] Cannot create announcement:', {
        hasTitle: !!newTitle.trim(),
        hasUser: !!user,
        hasAssociation: !!currentAssociation
      });
      return;
    }

    setIsCreating(true);
    try {
      await createAnnouncement({
        title: newTitle,
        content: newContent,
        priority: 'normal',
        association_id: currentAssociation.id,
        author_id: user.id,
        is_published: true,
        publish_date: new Date().toISOString(),
        expiry_date: null
      });
      
      setNewTitle('');
      setNewContent('');
    } catch (error) {
      console.error('[AnnouncementsDebug] Failed to create announcement:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Error Loading Announcements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-red-700">{error.message}</p>
            <div className="flex gap-2">
              <Button onClick={fetchAnnouncements} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={logDebugInfo} variant="ghost">
                Log Debug Info
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Debug Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Current Association:</strong> {currentAssociation?.name || 'None'}
            </div>
            <div>
              <strong>User:</strong> {user?.email || 'None'}
            </div>
            <div>
              <strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Announcements Count:</strong> {announcements.length}
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={logDebugInfo} variant="outline" size="sm">
              Log Debug Info
            </Button>
            <Button onClick={fetchAnnouncements} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create Announcement Card */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Announcement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Announcement title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <Textarea
            placeholder="Announcement content"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />
          <TooltipButton
            onClick={handleCreateAnnouncement}
            disabled={!newTitle.trim() || isCreating}
            tooltip="Create a new announcement"
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Create Announcement
          </TooltipButton>
        </CardContent>
      </Card>

      {/* Announcements List */}
      <Card>
        <CardHeader>
          <CardTitle>Announcements ({announcements.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading announcements...</span>
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No announcements found.</p>
              <p className="text-sm mt-2">Create your first announcement above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{announcement.title}</h3>
                    <Badge variant="outline">{announcement.priority}</Badge>
                  </div>
                  {announcement.content && (
                    <p className="text-muted-foreground mb-2">{announcement.content}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Created: {new Date(announcement.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnnouncementsDebug;
