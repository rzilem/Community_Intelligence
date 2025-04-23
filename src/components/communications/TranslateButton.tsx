
import React from 'react';
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
  const languages = translationService.getSupportedLanguages();
  
  const handleTranslate = async (languageCode: string) => {
    // Translation functionality is temporarily disabled
    toast.info('Translation is temporarily disabled');
    // Still call the callback with the original content to maintain the UI flow
    onTranslated(content);
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
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
