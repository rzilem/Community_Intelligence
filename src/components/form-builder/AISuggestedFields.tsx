
import React from 'react';
import { FormField } from '@/types/form-builder-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Plus, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AISuggestedFieldsProps {
  suggestedFields: FormField[];
  isLoading: boolean;
  error?: string | null;
  onAddField: (field: FormField) => void;
  onGenerateFields: () => void;
}

const AISuggestedFields: React.FC<AISuggestedFieldsProps> = ({
  suggestedFields,
  isLoading,
  error,
  onAddField,
  onGenerateFields
}) => {
  if (isLoading) {
    return (
      <Card className="border-dashed border-primary/50 bg-muted/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Field Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Generating field suggestions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-dashed border-destructive/50 bg-destructive/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            Error Generating Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={onGenerateFields}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (suggestedFields.length === 0) {
    return (
      <Card className="border-dashed border-primary/50 bg-muted/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Field Suggestions
          </CardTitle>
          <CardDescription className="text-xs">
            Get AI-generated field suggestions based on your form's title and type
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={onGenerateFields}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate AI Field Suggestions
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/40 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Field Suggestions
        </CardTitle>
        <CardDescription className="text-xs">
          Click on a field to add it to your form
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 py-0">
        <div className="max-h-96 overflow-y-auto p-2 space-y-2">
          {suggestedFields.map((field, index) => (
            <div 
              key={`ai-field-${index}`}
              className="border rounded-md p-3 hover:bg-muted/50 cursor-pointer flex justify-between items-center"
              onClick={() => onAddField(field)}
            >
              <div>
                <p className="font-medium text-sm">{field.label}</p>
                <p className="text-xs text-muted-foreground">{field.type}</p>
              </div>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="p-2 pt-4">
          <Button variant="outline" size="sm" className="w-full" onClick={onGenerateFields}>
            <Sparkles className="h-3 w-3 mr-1" />
            Regenerate Suggestions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AISuggestedFields;
