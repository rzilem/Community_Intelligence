
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';

interface AIConfigActionsProps {
  onSave: () => void;
  onReload: () => void;
  isSaving: boolean;
  isLoading: boolean;
}

export function AIConfigActions({ onSave, onReload, isSaving, isLoading }: AIConfigActionsProps) {
  return (
    <div className="flex gap-2 pt-4">
      <Button
        onClick={onSave}
        disabled={isSaving}
        className="flex items-center gap-2"
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : null}
        {isSaving ? 'Saving...' : 'Save Configuration'}
      </Button>
      
      <Button
        variant="outline"
        onClick={onReload}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
        {isLoading ? 'Loading...' : 'Reload Configuration'}
      </Button>
    </div>
  );
}
