
import React, { useState } from 'react';
import { Languages, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { translationService } from '@/services/translation-service';
import { toast } from 'sonner';

interface MultilingualOptionsProps {
  subject: string;
  content: string;
  onTranslated: (translatedSubject: string, translatedContent: string) => void;
}

const MultilingualOptions: React.FC<MultilingualOptionsProps> = ({
  subject,
  content,
  onTranslated
}) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const languages = translationService.getSupportedLanguages().filter(l => l.code !== 'en');
  
  const toggleLanguage = (code: string) => {
    setSelectedLanguages(prev => 
      prev.includes(code)
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };
  
  const handleTranslate = async () => {
    if (selectedLanguages.length === 0 || isTranslating) return;
    
    setIsTranslating(true);
    toast.loading('Preparing multilingual communication...');
    
    try {
      // Example of adding multilingual content to the message
      // In a real implementation, this would be handled by the backend
      // to send separate messages or include translations
      
      let translatedSubject = subject;
      let translatedContent = content;
      
      // For demo purposes, we're adding translations to the content
      for (const langCode of selectedLanguages) {
        const langName = languages.find(l => l.code === langCode)?.name || langCode;
        
        translatedContent += `\n\n--- ${langName} ---\n`;
        const translated = await translationService.translateText(content, langCode);
        translatedContent += translated;
      }
      
      onTranslated(translatedSubject, translatedContent);
      toast.success(`Added translations for ${selectedLanguages.length} language(s)`);
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Failed to generate translations');
    } finally {
      setIsTranslating(false);
    }
  };
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Languages className="h-4 w-4" />
          <span>Multilingual</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Add translations to your message</h4>
            <p className="text-sm text-muted-foreground">
              Select languages to include in your communication:
            </p>
          </div>
          
          <div className="space-y-2">
            {languages.map((lang) => (
              <div key={lang.code} className="flex items-center space-x-2">
                <Checkbox 
                  id={`lang-${lang.code}`}
                  checked={selectedLanguages.includes(lang.code)}
                  onCheckedChange={() => toggleLanguage(lang.code)}
                />
                <label
                  htmlFor={`lang-${lang.code}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {lang.name}
                </label>
              </div>
            ))}
          </div>
          
          <Button 
            onClick={handleTranslate} 
            disabled={selectedLanguages.length === 0 || isTranslating}
            className="w-full"
          >
            {isTranslating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Add Translations
              </>
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground">
            Translations are powered by AI and may not be 100% accurate. 
            For critical communications, professional review is recommended.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MultilingualOptions;
