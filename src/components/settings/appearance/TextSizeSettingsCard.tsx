
import React from 'react';
import { Type } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

interface TextSizeSettingsCardProps {
  value: number;
  onChange: (fontSize: number) => void;
}

const TextSizeSettingsCard: React.FC<TextSizeSettingsCardProps> = ({ value, onChange }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Type className="h-5 w-5 text-primary" />
          <CardTitle>Text Size</CardTitle>
        </div>
        <CardDescription>Adjust the size of text throughout the application</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs">A</span>
            <Slider 
              min={0.8} 
              max={1.2} 
              step={0.05} 
              value={[value]}
              onValueChange={(value) => onChange(value[0])}
              className="w-[calc(100%-4rem)]" 
            />
            <span className="text-lg">A</span>
          </div>
          <p className="text-muted-foreground" style={{ fontSize: `${value}rem` }}>
            Sample text size at {Math.round(value * 100)}%
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TextSizeSettingsCard;
