
import React from 'react';
import { Languages } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LanguageSettingsCardProps {
  value: string;
  onChange: (value: string) => void;
}

const LanguageSettingsCard: React.FC<LanguageSettingsCardProps> = ({ value, onChange }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Languages className="h-5 w-5 text-primary" />
          <CardTitle>Language</CardTitle>
        </div>
        <CardDescription>
          Set the default language for the application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select 
          value={value} 
          onValueChange={onChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Spanish</SelectItem>
            <SelectItem value="fr">French</SelectItem>
            <SelectItem value="de">German</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};

export default LanguageSettingsCard;
