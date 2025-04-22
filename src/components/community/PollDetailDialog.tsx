
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CommunityPoll } from '@/types/poll-types';
import { BarChart, Calendar, CheckCircle, Clock, User } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface PollDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  poll: CommunityPoll;
  userVote?: string;
  onVote: (pollId: string, option: string) => void;
}

const PollDetailDialog: React.FC<PollDetailDialogProps> = ({
  open,
  onOpenChange,
  poll,
  userVote,
  onVote
}) => {
  const hasVoted = !!userVote;
  const closingDate = poll.closes_at ? new Date(poll.closes_at) : null;
  const createdDate = new Date(poll.created_at);
  const isClosed = poll.is_closed || (closingDate && closingDate < new Date());
  
  // Mock vote counts for demonstration (in real app, these would come from database)
  const mockTotalVotes = Math.floor(Math.random() * 50) + 10;
  const optionsWithVotes = poll.options.map((option, index) => {
    const voteCount = Math.floor(Math.random() * mockTotalVotes);
    const percentage = mockTotalVotes > 0 ? Math.round((voteCount / mockTotalVotes) * 100) : 0;
    return {
      text: option,
      votes: voteCount,
      percentage
    };
  });
  
  const handleVote = (option: string) => {
    if (isClosed || hasVoted) return;
    onVote(poll.id, option);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{poll.title}</DialogTitle>
            <Badge variant={isClosed ? "outline" : "default"}>
              {isClosed ? "Closed" : "Active"}
            </Badge>
          </div>
          <DialogDescription>
            {poll.description || "No description provided"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              Created by: Admin
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Created: {format(createdDate, 'MMM d, yyyy')}
            </div>
            {closingDate && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {isClosed 
                  ? `Closed: ${format(closingDate, 'MMM d, yyyy')}` 
                  : `Closes: ${format(closingDate, 'MMM d, yyyy')}`}
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <h3 className="font-medium">Results</h3>
            
            <div className="space-y-4">
              {optionsWithVotes.map((option, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center text-base">
                      {userVote === option.text && (
                        <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                      )}
                      {option.text}
                    </span>
                    <span className="text-base font-semibold">{option.percentage}%</span>
                  </div>
                  <Progress value={option.percentage} className="h-3" />
                  <div className="text-sm text-muted-foreground text-right">
                    {option.votes} votes
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm flex items-center text-muted-foreground">
                <BarChart className="h-4 w-4 mr-1" />
                {mockTotalVotes} total votes
              </span>
              
              {hasVoted && (
                <span className="text-sm text-green-600 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  You voted: {userVote}
                </span>
              )}
            </div>
          </div>
          
          {!hasVoted && !isClosed && (
            <div className="space-y-3 pt-4 border-t">
              <h3 className="font-medium">Cast Your Vote</h3>
              
              <div className="space-y-2">
                {poll.options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3 font-normal"
                    onClick={() => handleVote(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PollDetailDialog;
