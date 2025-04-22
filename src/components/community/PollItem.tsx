
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CommunityPoll } from '@/types/poll-types';
import { BarChart, Calendar, CheckCircle, Clock, Eye, Vote } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';

interface PollItemProps {
  poll: CommunityPoll;
  userVote?: string;
  onVote: (pollId: string, option: string) => void;
  onViewDetails: () => void;
  isVoting: boolean;
  isReadOnly?: boolean;
}

const PollItem: React.FC<PollItemProps> = ({
  poll,
  userVote,
  onVote,
  onViewDetails,
  isVoting,
  isReadOnly = false
}) => {
  const hasVoted = !!userVote;
  const closingDate = poll.closes_at ? new Date(poll.closes_at) : null;
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
    if (isClosed || hasVoted || isReadOnly) return;
    onVote(poll.id, option);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{poll.title}</CardTitle>
          <Badge variant={isClosed ? "outline" : "default"}>
            {isClosed ? "Closed" : "Active"}
          </Badge>
        </div>
        <CardDescription>
          {poll.description || "No description provided"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="space-y-4">
          {(hasVoted || isReadOnly || isClosed) ? (
            // Show results view
            <div className="space-y-3">
              {optionsWithVotes.map((option, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center">
                      {userVote === option.text && (
                        <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                      )}
                      {option.text}
                    </span>
                    <span>{option.percentage}%</span>
                  </div>
                  <Progress value={option.percentage} className="h-2" />
                  <div className="text-xs text-muted-foreground text-right">
                    {option.votes} votes
                  </div>
                </div>
              ))}
              
              <div className="text-sm text-muted-foreground mt-2 flex items-center">
                <BarChart className="h-4 w-4 mr-1" />
                {mockTotalVotes} total votes
              </div>
            </div>
          ) : (
            // Show voting view
            <div className="space-y-2">
              {poll.options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3 font-normal"
                  onClick={() => handleVote(option)}
                  disabled={isVoting}
                >
                  {option}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-sm text-muted-foreground flex items-center">
          {closingDate ? (
            <>
              <Calendar className="h-4 w-4 mr-1" />
              {isClosed 
                ? `Closed ${formatDistanceToNow(closingDate, { addSuffix: true })}` 
                : `Closes ${formatDistanceToNow(closingDate, { addSuffix: true })}`}
            </>
          ) : (
            <>
              <Clock className="h-4 w-4 mr-1" />
              No closing date
            </>
          )}
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={onViewDetails}
        >
          <Eye className="h-4 w-4" />
          Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PollItem;
