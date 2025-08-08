
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileArchive, Loader2 } from 'lucide-react';
import { SmartImportErrorBoundary } from './SmartImportErrorBoundary';
import { toast } from 'sonner';
import { useSmartImport } from '@/hooks/import-export/useSmartImport';
import { zipParserService } from '@/services/import-export/zip-parser-service';
import { enhancedDataImportService } from '@/services/import-export/enhanced-data-import-service';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const ZipFileUploader: React.FC = () => {
  // Local helper types
  type ZipFileEntry = { filename: string; detectedType: string; data: any[]; confidence?: number };
  type Association = { id: string; name: string };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [associations, setAssociations] = useState<Association[]>([]);
  const [associationId, setAssociationId] = useState<string>('');

  const [zipFiles, setZipFiles] = useState<ZipFileEntry[]>([]);

  const { isProcessing, smartImportResult, processZipFile, resetSmartImport } = useSmartImport();
  const MappingModal = React.lazy(() => import('./ImportDataMappingModal'));

  const [manualFiles, setManualFiles] = useState<ZipFileEntry[]>([]);
  const [mappingOpen, setMappingOpen] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [isManualImporting, setIsManualImporting] = useState(false);

  useEffect(() => {
    // Load associations current user can access
    (async () => {
      try {
        const { data, error } = await supabase.rpc('get_user_associations');
        if (error) throw error;
        if (data && Array.isArray(data)) {
          setAssociations(data.map((a: any) => ({ id: a.id, name: a.name })));
        }
      } catch (e) {
        console.error('Failed to load associations', e);
        toast.error('Unable to load associations');
      }
    })();
  }, []);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.toLowerCase().endsWith('.zip')) {
      setSelectedFile(file);
      resetSmartImport();
      try {
        const analysis = await zipParserService.parseZipFile(file);
        setZipFiles(analysis.files as ZipFileEntry[]);
        toast.success(`Loaded ${analysis.files.length} files from archive`);
      } catch (err) {
        console.error('ZIP parse failed', err);
        toast.error('Could not read ZIP contents');
      }
    } else if (file) {
      toast.error('Please select a .zip file');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  const handleSmartImport = async () => {
    if (!selectedFile) return;
    if (!associationId) {
      toast.error('Please select an association');
      return;
    }

    const result = await processZipFile(selectedFile, {
      associationId,
      autoImportThreshold: 0.85,
      batchConfidenceThreshold: 0.75
    });

    if (result && result.skippedFiles > 0) {
      const candidates = zipFiles.filter((f) => (f.data?.length ?? 0) > 0);
      setManualFiles(candidates);
      setCurrentFileIndex(0);
      setMappingOpen(true);
      toast.info(`Manual mapping required for ${candidates.length} file(s)`);
    }
  };

  const handleConfirmMapping = async (mappings: Record<string, string>) => {
    const file = manualFiles[currentFileIndex];
    if (!file) return;
    if (!associationId) {
      toast.error('Missing association');
      return;
    }

    setIsManualImporting(true);
    try {
      const res = await enhancedDataImportService.importData({
        associationId,
        dataType: file.detectedType,
        data: file.data,
        mappings
      });

      if (res.success) {
        toast.success(`Imported ${res.successfulImports}/${res.totalProcessed} from ${file.filename}`);
      } else {
        toast.warning(`Completed with issues for ${file.filename}`);
      }

      const next = currentFileIndex + 1;
      if (next < manualFiles.length) {
        setCurrentFileIndex(next);
      } else {
        setMappingOpen(false);
        toast.success('Manual mapping complete');
      }
    } catch (err) {
      console.error('Manual import failed', err);
      toast.error(err instanceof Error ? err.message : 'Manual import failed');
    } finally {
      setIsManualImporting(false);
    }
  };
  return (
    <SmartImportErrorBoundary fallbackMessage="Error loading ZIP file uploader">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileArchive className="h-5 w-5" />
            Smart ZIP Import
          </CardTitle>
          <CardDescription>
            Upload a ZIP file containing multiple data files. AI will analyze and import them automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="association">Association</Label>
              <Select value={associationId} onValueChange={setAssociationId}>
                <SelectTrigger id="association">
                  <SelectValue placeholder="Select association" />
                </SelectTrigger>
                <SelectContent>
                  {associations.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <p className="text-sm text-muted-foreground">Choose the target association to route imported data correctly.</p>
            </div>
          </div>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {selectedFile ? (
              <div className="space-y-2">
                <FileArchive className="h-8 w-8 mx-auto text-primary" />
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Select a ZIP file to upload</p>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleUploadClick}
              variant="outline"
              className="flex-1"
              disabled={isProcessing}
            >
              <Upload className="h-4 w-4 mr-2" />
              {selectedFile ? 'Change File' : 'Select ZIP File'}
            </Button>
            
            {selectedFile && (
              <Button
                onClick={handleSmartImport}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Start Smart Import'
                )}
              </Button>
            )}
          </div>

          {smartImportResult && (
            <div className="rounded-lg border p-4 space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Files Processed</p>
                  <p className="text-lg font-medium">{smartImportResult.processedFiles}/{smartImportResult.totalFiles}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Records Imported</p>
                  <p className="text-lg font-medium">{smartImportResult.importedRecords}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Skipped Files</p>
                  <p className="text-lg font-medium">{smartImportResult.skippedFiles}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Warnings</p>
                  <p className="text-lg font-medium">{smartImportResult.warnings?.length ?? 0}</p>
                </div>
              </div>

              {smartImportResult.job_id && (
                <p className="text-xs text-muted-foreground">Job ID: <span className="font-mono">{smartImportResult.job_id}</span></p>
              )}

              {smartImportResult.success && smartImportResult.importedRecords === 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-2 text-amber-800 text-sm">
                  No records were imported. If your ZIP contains mostly documents (PDFs, images), this is expected. Try including CSV/XLSX files with tabular data.
                </div>
              )}

                <div className="mt-2">
                  <p className="text-sm font-medium mb-2">Per-file results</p>
                  <div className="space-y-2 max-h-48 overflow-auto pr-1">
                    {smartImportResult.details.map((d, idx) => (
                      <div key={idx} className="flex items-start justify-between text-sm border rounded-md p-2">
                        <div className="min-w-0">
                          <p className="truncate font-medium">{d.filename || `Item ${idx+1}`}</p>
                          <p className="text-xs text-muted-foreground truncate">{d.message}</p>
                        </div>
                        <div className="flex items-center gap-2 pl-2 shrink-0">
                          <Badge variant={d.status === 'success' ? 'default' : d.status === 'warning' ? 'secondary' : d.status === 'skipped' ? 'outline' : 'destructive'}>
                            {d.status}
                          </Badge>
                          <span className="text-xs tabular-nums text-muted-foreground">{d.recordsProcessed}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              {smartImportResult.errors?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {smartImportResult.errors.slice(0, 4).map((e, idx) => (
                    <Badge key={idx} variant="destructive">{e}</Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Coming Soon:</strong> AI-powered analysis of mixed data files, automatic format detection, and intelligent import routing.
            </p>
          </div>
        </CardContent>
    </Card>

      {mappingOpen && manualFiles[currentFileIndex] && (
        <React.Suspense fallback={null}>
          <MappingModal
            open={mappingOpen}
            onOpenChange={setMappingOpen}
            validationResults={null}
            fileData={manualFiles[currentFileIndex].data || []}
            importType={manualFiles[currentFileIndex].detectedType || ''}
            associationId={associationId}
            associations={associations}
            onConfirmMapping={handleConfirmMapping}
            isImporting={isManualImporting}
          />
        </React.Suspense>
      )}
  </SmartImportErrorBoundary>
  );
};

export default ZipFileUploader;
