
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

interface LanguageSelectorProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  variant = 'outline',
  size = 'sm'
}) => {
  const { user } = useAuth();
  const languages = translationService.getSupportedLanguages();
  const [selectedLanguage, setSelectedLanguage] = React.useState('en');
  
  // Load user's language preference
  React.useEffect(() => {
    const loadLanguagePreference = async () => {
      if (!user?.id) return;
      
      try {
        const { data } = await supabase
          .from('profiles')
          .select('preferred_language')
          .eq('id', user.id)
          .single();
          
        if (data?.preferred_language) {
          setSelectedLanguage(data.preferred_language);
        }
      } catch (error) {
        console.error('Error loading language preference:', error);
      }
    };
    
    loadLanguagePreference();
  }, [user]);
  
  const handleLanguageChange = async (code: string) => {
    setSelectedLanguage(code);
    
    if (user?.id) {
      await translationService.updateUserLanguagePreference(user.id, code);
      toast.success(`Language changed to ${languages.find(l => l.code === code)?.name}`);
    }
    
    // Here we would trigger the app-wide language change
    // This would be implemented with i18n library
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:block">
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
