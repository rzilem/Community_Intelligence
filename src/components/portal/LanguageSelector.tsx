
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
import { toast } from 'sonner';

const LanguageSelector: React.FC = () => {
  const { user, profile } = useAuth();
  const languages = translationService.getSupportedLanguages();
  const [selectedLanguage, setSelectedLanguage] = React.useState(profile?.preferred_language || 'en');
  
  const handleLanguageChange = async (code: string) => {
    if (!user?.id) {
      toast.error('Please log in to change language preference');
      return;
    }
    
    try {
      await translationService.updateUserLanguagePreference(user.id, code);
      setSelectedLanguage(code);
      toast.success(`Language changed to ${languages.find(l => l.code === code)?.name}`);
    } catch (error) {
      toast.error('Failed to update language preference');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span>
            {languages.find(l => l.code === selectedLanguage)?.name || 'Language'}
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
              {selectedLanguage === language.code && (
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
