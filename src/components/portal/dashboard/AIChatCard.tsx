
import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';
import { AiQueryInput } from '@/components/ai/AiQueryInput';

interface AIChatCardProps {
  translations: {
    askCommunityIntel: string;
    getInstantAnswers: string;
  };
}

export const AIChatCard: React.FC<AIChatCardProps> = ({ translations }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{translations.askCommunityIntel}</CardTitle>
        <CardDescription>{translations.getInstantAnswers}</CardDescription>
      </CardHeader>
      <CardContent>
        <AiQueryInput />
      </CardContent>
    </Card>
  );
};
