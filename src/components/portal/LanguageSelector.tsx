
import React from 'react';
import { Globe } from 'lucide-react';
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
import { useAuth } from '@/contexts/auth';
import { useTranslation } from '@/hooks/use-translation';
import { toast } from 'sonner';

interface LanguageSelectorProps {
  onLanguageChange?: (code: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onLanguageChange }) => {
  const { user } = useAuth();
  const { preferredLanguage, setPreferredLanguage } = useTranslation();
  const languages = translationService.getSupportedLanguages();
  
  const handleLanguageChange = async (code: string) => {
    if (code === preferredLanguage) return; // Skip if same language
    
    try {
      // Show toast to indicate language is changing
      toast.success(`Switching to ${languages.find(l => l.code === code)?.name || code}...`);
      
      // Update language state for immediate feedback
      setPreferredLanguage(code);
      
      // Update database preference if user is logged in
      if (user?.id) {
        await translationService.updateUserLanguagePreference(user.id, code);
      }
      
      // Call the optional callback if provided
      if (onLanguageChange) {
        onLanguageChange(code);
      }
    } catch (error) {
      console.error('Error updating language:', error);
      toast.error('Failed to update language preference');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span>
            {languages.find(l => l.code === preferredLanguage)?.name || 'Language'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Select Language</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <span>{language.name}</span>
              {preferredLanguage === language.code && (
                <span className="text-primary">✓</span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
