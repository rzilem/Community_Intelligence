
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';

interface LeadStats {
  all: number;
  new: number;
  contacted: number;
  qualified: number;
  proposal: number;
  converted: number;
  lost: number;
}

interface LeadStatCardsProps {
  leadCounts: LeadStats;
}

const LeadStatCards: React.FC<LeadStatCardsProps> = ({ leadCounts }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">New Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{leadCounts.new}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Qualified Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{leadCounts.qualified}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Proposals Sent</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{leadCounts.proposal}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Converted</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{leadCounts.converted}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadStatCards;
