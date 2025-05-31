
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Users, Bell } from 'lucide-react';
import PageTemplate from '@/components/layout/PageTemplate';
import MessageThreadList from '@/components/communications/MessageThreadList';
import MessageThread from '@/components/communications/MessageThread';
import CreateThreadDialog from '@/components/communications/CreateThreadDialog';
import { MessageThread as MessageThreadType } from '@/hooks/useMessages';

const Communications = () => {
  const [selectedThread, setSelectedThread] = useState<MessageThreadType | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // For demo purposes, using a default association ID
  const defaultAssociationId = 'demo-association-id';

  const handleSelectThread = (thread: MessageThreadType) => {
    setSelectedThread(thread);
  };

  const handleBack = () => {
    setSelectedThread(null);
  };

  const handleCreateThread = () => {
    setShowCreateDialog(true);
  };

  return (
    <PageTemplate
      title="Communications"
      icon={<MessageSquare className="h-8 w-8" />}
      description="Manage community communications and messages"
    >
      <div className="space-y-6">
        {/* Communication Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-sm text-muted-foreground">Active Threads</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">156</div>
                  <p className="text-sm text-muted-foreground">Community Members</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Bell className="h-8 w-8 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-sm text-muted-foreground">Unread Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Communication Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            {!selectedThread ? (
              <MessageThreadList
                associationId={defaultAssociationId}
                onSelectThread={handleSelectThread}
                onCreateThread={handleCreateThread}
              />
            ) : (
              <MessageThread
                thread={selectedThread}
                onBack={handleBack}
              />
            )}
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a thread to view messages</p>
                  <p className="text-sm">or create a new conversation</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Create Thread Dialog */}
        <CreateThreadDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          associationId={defaultAssociationId}
        />
      </div>
    </PageTemplate>
  );
};

export default Communications;
