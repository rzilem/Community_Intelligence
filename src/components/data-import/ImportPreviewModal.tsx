import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertTriangle,
  CheckCircle,
  Database,
  Settings,
  Eye,
  Upload
} from 'lucide-react';

interface ImportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (defaults: Record<string, any>) => void;
  analysisResult: any;
  previewData: any[];
  requiredFieldsErrors: string[];
  warnings: string[];
}

const ImportPreviewModal: React.FC<ImportPreviewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  analysisResult,
  previewData,
  requiredFieldsErrors,
  warnings
}) => {
  const [userDefaults, setUserDefaults] = useState<Record<string, any>>({
    property_type: 'Residential',
    status: 'active',
    priority: 'medium'
  });

  const handleDefaultChange = (field: string, value: string) => {
    setUserDefaults(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConfirm = () => {
    onConfirm(userDefaults);
  };

  const hasErrors = requiredFieldsErrors.length > 0;
  const hasWarnings = warnings.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Import Preview & Configuration
          </DialogTitle>
          <DialogDescription>
            Review your import settings and provide defaults for missing required fields.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-6 p-1">
              {/* Error Section */}
              {hasErrors && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Required Fields Missing:</p>
                      <ul className="text-sm space-y-1">
                        {requiredFieldsErrors.map((error, i) => (
                          <li key={i}>• {error}</li>
                        ))}
                      </ul>
                      <p className="text-sm">Please provide default values below to continue.</p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Warning Section */}
              {hasWarnings && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Warnings:</p>
                      <ul className="text-sm space-y-1">
                        {warnings.map((warning, i) => (
                          <li key={i}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Target Tables */}
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Target Tables
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {analysisResult.targetTables.map((table: string) => (
                    <Badge key={table} variant="secondary">
                      {table}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Field Mappings */}
              <div>
                <h3 className="font-medium mb-3">Field Mappings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {(Object.entries(analysisResult.fieldMappings) as [string, string][]).map(([source, target]) => (
                    <div key={source} className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
                      <span className="font-medium">{source}</span>
                      <span className="text-muted-foreground">→</span>
                      <span>{target}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Default Values Configuration */}
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Default Values Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="property_type">Property Type Default</Label>
                    <Input
                      id="property_type"
                      value={userDefaults.property_type}
                      onChange={(e) => handleDefaultChange('property_type', e.target.value)}
                      placeholder="e.g., Residential, Commercial"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status Default</Label>
                    <Input
                      id="status"
                      value={userDefaults.status}
                      onChange={(e) => handleDefaultChange('status', e.target.value)}
                      placeholder="e.g., active, inactive"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority Default</Label>
                    <Input
                      id="priority"
                      value={userDefaults.priority}
                      onChange={(e) => handleDefaultChange('priority', e.target.value)}
                      placeholder="e.g., low, medium, high"
                    />
                  </div>
                </div>
              </div>

              {/* Data Preview */}
              <div>
                <h3 className="font-medium mb-3">Data Preview ({previewData.length} records)</h3>
                <div className="border rounded-lg overflow-hidden">
                  <ScrollArea className="h-48">
                    <div className="p-4">
                      {previewData.slice(0, 5).map((row, i) => (
                        <div key={i} className="mb-4 last:mb-0">
                          <div className="text-sm font-medium mb-2">Record {i + 1}</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            {Object.entries(row).slice(0, 6).map(([key, value]) => (
                              <div key={key} className="flex">
                                <span className="font-medium w-24 flex-shrink-0">{key}:</span>
                                <span className="text-muted-foreground truncate">{String(value ?? '')}</span>
                              </div>
                            ))}
                          </div>
                          {i < 4 && <Separator className="mt-2" />}
                        </div>
                      ))}
                      {previewData.length > 5 && (
                        <div className="text-sm text-muted-foreground text-center pt-2">
                          ... and {previewData.length - 5} more records
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={hasErrors && Object.keys(userDefaults).length === 0}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Confirm Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportPreviewModal;