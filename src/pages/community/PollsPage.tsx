
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Check, PieChart, Plus, UserCheck, Vote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AssociationSelector from '@/components/associations/AssociationSelector';
import { useSupabaseQuery } from '@/hooks/supabase';
import CreatePollDialog from '@/components/community/CreatePollDialog';
import PollItem from '@/components/community/PollItem';
import PollDetailDialog from '@/components/community/PollDetailDialog';
import { usePollVote } from '@/hooks/polls/usePollVote';
import { CommunityPoll } from '@/types/poll-types';
import { useAuth } from '@/hooks/auth/useAuth';

const PollsPage = () => {
  const { user } = useAuth();
  const [selectedAssociationId, setSelectedAssociationId] = useState<string>();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState<CommunityPoll | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { castVote, isVoting } = usePollVote();

  // Fetch polls data
  const { 
    data: polls = [], 
    isLoading: isLoadingPolls,
    refetch: refetchPolls
  } = useSupabaseQuery<CommunityPoll[]>({
    tableName: 'community_polls',
    select: '*',
    filter: [
      ...(selectedAssociationId ? [{ column: 'association_id', value: selectedAssociationId }] : []),
    ],
    orderBy: { column: 'created_at', ascending: false }
  },
  !!selectedAssociationId
  );

  // Fetch user's votes
  const { 
    data: userVotes = [], 
    isLoading: isLoadingVotes
  } = useSupabaseQuery<{ poll_id: string, selected_option: string }[]>({
    tableName: 'poll_responses',
    select: 'poll_id, selected_option',
    filter: [
      { column: 'user_id', value: user?.id || '' }
    ]
  },
  !!user?.id
  );

  const handleAssociationChange = (associationId: string) => {
    setSelectedAssociationId(associationId);
  };

  const handleCreatePoll = () => {
    setIsCreateDialogOpen(true);
  };

  const handleViewDetails = (poll: CommunityPoll) => {
    setSelectedPoll(poll);
    setDetailsOpen(true);
  };

  const handleVote = async (pollId: string, option: string) => {
    if (!user?.id) return;
    
    await castVote({
      pollId,
      userId: user.id,
      selectedOption: option
    });
    
    refetchPolls();
  };

  const activePolls = polls.filter(poll => !poll.is_closed);
  const closedPolls = polls.filter(poll => poll.is_closed);

  const isLoading = isLoadingPolls || isLoadingVotes;

  return (
    <PageTemplate 
      title="Community Polls" 
      icon={<Vote className="h-8 w-8" />}
      description="Vote on community matters and see poll results"
    >
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <AssociationSelector 
            className="w-full md:w-[250px]" 
            onAssociationChange={handleAssociationChange}
          />
          <Button 
            onClick={handleCreatePoll}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Create Poll
          </Button>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-8">
              <div className="flex justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            </CardContent>
          </Card>
        ) : polls.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Vote className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Polls Available</h3>
              <p className="text-muted-foreground mb-4">
                There are no active polls for this association.
              </p>
              <Button onClick={handleCreatePoll}>Create a Poll</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Active Polls */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <UserCheck className="h-5 w-5" /> Active Polls
              </h2>
              {activePolls.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activePolls.map((poll) => (
                    <PollItem
                      key={poll.id}
                      poll={poll}
                      userVote={userVotes.find(v => v.poll_id === poll.id)?.selected_option}
                      onVote={handleVote}
                      onViewDetails={() => handleViewDetails(poll)}
                      isVoting={isVoting}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No active polls at the moment.</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Closed Polls */}
            {closedPolls.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Check className="h-5 w-5" /> Closed Polls
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {closedPolls.map((poll) => (
                    <PollItem
                      key={poll.id}
                      poll={poll}
                      userVote={userVotes.find(v => v.poll_id === poll.id)?.selected_option}
                      onVote={handleVote}
                      onViewDetails={() => handleViewDetails(poll)}
                      isVoting={isVoting}
                      isReadOnly={true}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Dialogs */}
      <CreatePollDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        associationId={selectedAssociationId || ''}
        onSuccess={() => refetchPolls()}
      />

      {selectedPoll && (
        <PollDetailDialog
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          poll={selectedPoll}
          userVote={userVotes.find(v => v.poll_id === selectedPoll.id)?.selected_option}
          onVote={handleVote}
        />
      )}
    </PageTemplate>
  );
};

export default PollsPage;
