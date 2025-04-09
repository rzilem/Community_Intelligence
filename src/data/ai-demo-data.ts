
export interface AIDemoQuestion {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'financial' | 'community' | 'management' | 'compliance';
}

export const aiDemoQuestions: AIDemoQuestion[] = [
  {
    id: '1',
    question: "What reports can Community Intelligence generate for our HOA?",
    answer: "Community Intelligence can generate various financial reports (balance sheets, income statements, budget comparisons), compliance reports (violations, delinquencies), amenity usage statistics, maintenance schedule reports, and custom reports with configurable parameters. All reports can be exported to PDF, Excel, or CSV formats and scheduled for automatic delivery to specified recipients.",
    category: 'general'
  },
  {
    id: '2',
    question: "How do I create a new maintenance request?",
    answer: "To create a maintenance request, navigate to the Operations section, select 'Maintenance Requests', and click the '+ New Request' button. Fill in the details including property, issue description, priority, and attach any relevant photos. You can also assign the request to specific maintenance staff and set due dates for completion.",
    category: 'management'
  },
  {
    id: '3',
    question: "Can you show me all delinquent accounts over 60 days?",
    answer: "As of today, there are 7 accounts delinquent for over 60 days, totaling $12,450. The longest outstanding balance is from property #1042 (90 days, $2,800). I've generated a detailed delinquency report available in the Reports section, with payment history and automated communication logs for each account.",
    category: 'financial'
  },
  {
    id: '4',
    question: "When is the next board meeting scheduled?",
    answer: "The next board meeting is scheduled for May 15, 2025 at 7:00 PM in the Clubhouse Main Hall. The agenda includes budget approval for Q3, landscape vendor selection, and pool maintenance schedule. 12 residents have already RSVP'd to attend. Would you like me to send you a calendar invitation?",
    category: 'community'
  },
  {
    id: '5',
    question: "How many parking violations were issued last month?",
    answer: "In April 2025, 23 parking violations were issued across all properties. This represents a 15% decrease from March. The most common violation was 'parking in no-parking zones' (8 instances), followed by 'overnight parking without permit' (7 instances). All violations have been documented with photos in the Compliance section.",
    category: 'compliance'
  },
  {
    id: '6',
    question: "Can you predict our budget variance for maintenance this year?",
    answer: "Based on current trends and historical data, I project a 7% positive variance in the maintenance budget by year-end. While landscaping expenses are 4% over budget, plumbing repairs are significantly under budget (22%) due to the preventative maintenance program implemented in January. I recommend reallocating $5,000 from plumbing to cover anticipated HVAC expenses in Q3.",
    category: 'financial'
  },
  {
    id: '7',
    question: "How do I book the clubhouse for a private event?",
    answer: "To book the clubhouse, go to the Amenities section, select 'Clubhouse', and click 'Book Now'. Choose your desired date and time slot (up to 4 hours per booking), agree to the usage terms, and pay the $150 refundable deposit online. Your booking will be pending approval from management, which typically happens within 24 hours. You'll receive email confirmation once approved.",
    category: 'community'
  },
  {
    id: '8',
    question: "What's the current status of the pool renovation project?",
    answer: "The pool renovation project is currently in Phase 2 of 3, at 68% completion. Retiling is complete, and plumbing upgrades are 85% done. The project remains on budget but is 5 days behind schedule due to weather delays last week. The projected completion date has been adjusted to June 12, 2025. The full progress report with photos is available in the Projects section.",
    category: 'management'
  },
  {
    id: '9',
    question: "How many new residents joined our community this quarter?",
    answer: "In Q1 2025, 14 new households joined the community: 8 through property purchases and 6 as new tenants. The onboarding completion rate is 92%, with 13 of 14 having completed all required documentation. Welcome packages have been delivered to all new residents, and 9 have already participated in community events. The detailed demographics report is available in the Resident section.",
    category: 'community'
  },
  {
    id: '10',
    question: "What's the most effective way to communicate with all residents?",
    answer: "Based on resident preferences and response rates, the most effective communication channel is our mobile app push notifications (89% view rate within 4 hours), followed by email (72% open rate) and SMS (68% view rate). Physical mailbox notices are least effective (41% confirmed awareness). For critical announcements, I recommend using a combination of app notification and SMS for maximum reach.",
    category: 'management'
  }
];
