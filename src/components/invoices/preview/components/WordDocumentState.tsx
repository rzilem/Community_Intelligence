
import React from 'react';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WordDocumentStateProps {
  onExternalOpen?: () => void;
}

export const WordDocumentState: React.FC<WordDocumentStateProps> = ({ onExternalOpen }) => (
  <div className="flex flex-col items-center justify-center h-full">
    <FileQuestion className="h-16 w-16 text-muted-foreground mb-4" />
    <p className="text-center mb-4">
      Word documents cannot be previewed directly.
    </p>
    {onExternalOpen && (
      <Button onClick={onExternalOpen} className="text-primary hover:underline flex items-center">
        Download document
      </Button>
    )}
  </div>
);

