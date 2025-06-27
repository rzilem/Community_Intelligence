
import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Eye, Zap, FileCheck } from 'lucide-react';
import { useUserPreferences } from '@/hooks/invoices/useUserPreferences';

interface PreferenceSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PreferenceSettings: React.FC<PreferenceSettingsProps> = ({
  isOpen,
  onClose
}) => {
  const { preferences, updatePreferences, isLoading } = useUserPreferences();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Preview Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preferred View Mode
            </Label>
            <Select
              value={preferences.preferredViewMode}
              onValueChange={(value: 'pdf' | 'html' | 'auto') => 
                updatePreferences({ preferredViewMode: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto (Smart Detection)</SelectItem>
                <SelectItem value="pdf">Always PDF First</SelectItem>
                <SelectItem value="html">Always Processed Content</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Auto Fallback
            </Label>
            <Switch
              checked={preferences.enableAutoFallback}
              onCheckedChange={(checked) => 
                updatePreferences({ enableAutoFallback: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              AI Validation Tools
            </Label>
            <Switch
              checked={preferences.showValidationTools}
              onCheckedChange={(checked) => 
                updatePreferences({ showValidationTools: checked })
              }
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
