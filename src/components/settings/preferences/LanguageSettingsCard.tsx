
import React from 'react';
import { Languages, Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { translationService } from '@/services/translation-service';

interface LanguageSettingsCardProps {
  value: string;
  onChange: (value: string) => void;
}

const LanguageSettingsCard: React.FC<LanguageSettingsCardProps> = ({ value, onChange }) => {
  const languages = translationService.getSupportedLanguages();
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <CardTitle>Language</CardTitle>
        </div>
        <CardDescription>
          Set the default language for the application interface and communications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Interface Language</label>
            <Select 
              value={value} 
              onValueChange={onChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              This will change the language of buttons, menus, and other interface elements
            </p>
          </div>
          
          <div className="border-t pt-3">
            <p className="text-sm font-medium mb-2">Automatic Translation</p>
            <p className="text-sm text-muted-foreground">
              Communications will be automatically translated to your preferred language when available.
              You can update your translation preferences in your profile settings.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LanguageSettingsCard;
