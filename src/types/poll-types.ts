
export interface CommunityPoll {
  id: string;
  title: string;
  description?: string;
  options: string[];
  is_closed: boolean;
  closes_at?: string;
  created_at: string;
  association_id: string;
  created_by: string;
}

export interface PollResponse {
  id: string;
  poll_id: string;
  user_id: string;
  selected_option: string;
  created_at: string;
}

export interface PollResultsWithVotes {
  poll: CommunityPoll;
  results: {
    option: string;
    count: number;
    percentage: number;
  }[];
  totalVotes: number;
}
