
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VoteParams {
  pollId: string;
  userId: string;
  selectedOption: string;
}

export function usePollVote() {
  const [isVoting, setIsVoting] = useState(false);

  const castVote = async (params: VoteParams) => {
    setIsVoting(true);
    try {
      // Check if the user has already voted on this poll
      const { data: existingVote, error: checkError } = await supabase
        .from('poll_responses')
        .select('*')
        .eq('poll_id', params.pollId)
        .eq('user_id', params.userId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingVote) {
        // If user already voted, update their vote
        const { error: updateError } = await supabase
          .from('poll_responses')
          .update({ selected_option: params.selectedOption })
          .eq('id', existingVote.id);

        if (updateError) throw updateError;
        toast.success('Your vote has been updated');
      } else {
        // If this is a new vote
        const { error: insertError } = await supabase
          .from('poll_responses')
          .insert({
            poll_id: params.pollId,
            user_id: params.userId,
            selected_option: params.selectedOption
          });

        if (insertError) throw insertError;
        toast.success('Your vote has been recorded');
      }

      return true;
    } catch (error: any) {
      console.error('Error casting vote:', error);
      toast.error(`Failed to cast vote: ${error.message}`);
      return false;
    } finally {
      setIsVoting(false);
    }
  };

  return {
    castVote,
    isVoting
  };
}
