
import React, { useState } from 'react';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { translationService } from '@/services/translation-service';
import { toast } from 'sonner';

interface TranslateButtonProps {
  content: string;
  onTranslated: (translatedText: string) => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

const TranslateButton: React.FC<TranslateButtonProps> = ({
  content,
  onTranslated,
  variant = 'ghost',
  size = 'sm'
}) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const languages = translationService.getSupportedLanguages();
  
  const handleTranslate = async (languageCode: string) => {
    if (!content || isTranslating) return;
    
    setIsTranslating(true);
    toast.loading('Translating content...');
    
    try {
      const translatedText = await translationService.translateText(content, languageCode);
      onTranslated(translatedText);
      toast.success(`Translated to ${languages.find(l => l.code === languageCode)?.name}`);
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={isTranslating}>
          <Languages className="h-4 w-4 mr-2" />
          Translate
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Select Language</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleTranslate(language.code)}
            disabled={isTranslating}
            className="cursor-pointer"
          >
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TranslateButton;
