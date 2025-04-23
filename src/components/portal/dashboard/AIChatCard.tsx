
import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';
import { AiQueryInput } from '@/components/ai/AiQueryInput';
import { useTranslation } from '@/hooks/use-translation';

interface AIChatCardProps {
  translations: {
    askCommunityIntel: string;
    getInstantAnswers: string;
    [key: string]: string;
  };
}

export const AIChatCard: React.FC<AIChatCardProps> = ({ translations }) => {
  const [placeholder, setPlaceholder] = useState('Ask Community Intelligence anything...');
  const { preferredLanguage, translateText, translateVersion } = useTranslation();
  
  useEffect(() => {
    const updatePlaceholder = async () => {
      if (preferredLanguage === 'en') {
        setPlaceholder('Ask Community Intelligence anything...');
        return;
      }
      
      try {
        const translated = await translateText('Ask Community Intelligence anything...');
        setPlaceholder(translated);
      } catch (error) {
        console.error('Error translating placeholder:', error);
      }
    };
    
    updatePlaceholder();
  }, [preferredLanguage, translateText, translateVersion]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{translations.askCommunityIntel}</CardTitle>
        <CardDescription>{translations.getInstantAnswers}</CardDescription>
      </CardHeader>
      <CardContent>
        <AiQueryInput placeholder={placeholder} />
      </CardContent>
    </Card>
  );
};
