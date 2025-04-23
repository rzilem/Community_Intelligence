
import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';

interface CommunityUpdatesCardProps {
  translations: {
    communityUpdates: string;
    latestAnnouncements: string;
    annualMeeting: string;
    annualMeetingDesc: string;
    poolClosing: string;
    poolClosingDesc: string;
    [key: string]: string; // Add index signature for flexibility
  };
}

export const CommunityUpdatesCard: React.FC<CommunityUpdatesCardProps> = ({ translations }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{translations.communityUpdates}</CardTitle>
        <CardDescription>{translations.latestAnnouncements}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border-b pb-2">
            <p className="font-medium">{translations.annualMeeting}</p>
            <p className="text-sm text-muted-foreground">{translations.annualMeetingDesc}</p>
          </div>
          <div className="border-b pb-2">
            <p className="font-medium">{translations.poolClosing}</p>
            <p className="text-sm text-muted-foreground">{translations.poolClosingDesc}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
