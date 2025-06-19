
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FileArchive, Upload, FolderOpen, CheckCircle, AlertCircle, Info, XCircle, Clock, FileText } from 'lucide-react';
import { useDocumentStorageImport } from '@/hooks/import-export/useDocumentStorageImport';

interface DocumentStorageUploaderProps {
  onComplete?: (result: any) => void;
}

const DocumentStorageUploader: React.FC<DocumentStorageUploaderProps> = ({ onComplete }) => {
  const { isProcessing, progress, result, processDocumentZip, cancelImport, resetImport } = useDocumentStorageImport();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const zipFile = acceptedFiles[0];
    if (zipFile && zipFile.type === 'application/zip') {
      const importResult = await processDocumentZip(zipFile);
      if (importResult && onComplete) {
        onComplete(importResult);
      }
    }
  }, [processDocumentZip, onComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip']
    },
    maxFiles: 1,
    disabled: isProcessing
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Document Import Complete
          </CardTitle>
          <CardDescription>
            Successfully processed hierarchical document archive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{result.documentsImported}</div>
              <div className="text-sm text-gray-600">Documents Imported</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{result.unitsProcessed}</div>
              <div className="text-sm text-gray-600">Units Processed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{result.categoriesFound.length}</div>
              <div className="text-sm text-gray-600">Categories Found</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{result.errors.length}</div>
              <div className="text-sm text-gray-600">Errors</div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Association Details</h4>
            <p className="text-sm text-gray-600">
              <strong>Name:</strong> {result.associationName}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Total Documents Processed:</strong> {result.totalDocuments}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Document Categories</h4>
            <div className="flex flex-wrap gap-2">
              {result.categoriesFound.map((category) => (
                <Badge key={category} variant="secondary">
                  {category} ({result.summary[category] || 0})
                </Badge>
              ))}
            </div>
          </div>

          {result.skippedFiles.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Skipped Files ({result.skippedFiles.length}):</strong>
                <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                  {result.skippedFiles.slice(0, 10).map((file, index) => (
                    <li key={index} className="text-sm flex items-center gap-2">
                      <FileText className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{file.name}</span>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {file.size ? formatFileSize(file.size) : ''} - {file.reason}
                      </span>
                    </li>
                  ))}
                  {result.skippedFiles.length > 10 && (
                    <li className="text-sm text-gray-500">
                      ... and {result.skippedFiles.length - 10} more files
                    </li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {result.errors.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Errors encountered:</strong>
                <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                  {result.errors.slice(0, 5).map((error, index) => (
                    <li key={index} className="text-sm">• {error}</li>
                  ))}
                  {result.errors.length > 5 && (
                    <li className="text-sm text-gray-500">
                      ... and {result.errors.length - 5} more errors
                    </li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <Button onClick={resetImport} className="w-full">
            Import Another Archive
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileArchive className="h-5 w-5" />
          Document Storage Import
        </CardTitle>
        <CardDescription>
          Import hierarchical document archives organized by association and units
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Expected Structure:</strong> Association Folder → Unit Folders → Category Folders → Documents
            <br />
            <span className="text-sm text-gray-600">
              Example: GOC/Unit101/Emails/correspondence.pdf • Max file size: 300 MB per file
            </span>
          </AlertDescription>
        </Alert>

        {isProcessing && progress && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{progress.message}</span>
              <span className="text-sm text-gray-500">{progress.progress}%</span>
            </div>
            <Progress value={progress.progress} className="w-full" />
            
            {/* Detailed progress information */}
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Files:</span>
                  <span>{progress.filesProcessed} / {progress.totalFiles}</span>
                </div>
                <div className="flex justify-between">
                  <span>Units:</span>
                  <span>{progress.unitsProcessed} / {progress.totalUnits}</span>
                </div>
              </div>
              <div className="space-y-1">
                {progress.currentUnit && (
                  <div className="flex items-center gap-1">
                    <FolderOpen className="h-3 w-3" />
                    <span className="truncate">{progress.currentUnit}</span>
                  </div>
                )}
                {progress.currentFile && (
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    <span className="truncate">{progress.currentFile}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={cancelImport}
                className="flex items-center gap-1"
              >
                <XCircle className="h-4 w-4" />
                Cancel Import
              </Button>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                Processing large files...
              </div>
            </div>
          </div>
        )}

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          {isDragActive ? (
            <p className="text-lg">Drop the document archive here...</p>
          ) : (
            <div className="space-y-2">
              <p className="text-lg">
                {isProcessing ? 'Processing...' : 'Drag & drop a ZIP file here'}
              </p>
              <p className="text-sm text-gray-500">
                Or click to select a hierarchical document archive
              </p>
              <Button variant="outline" disabled={isProcessing} className="mt-4">
                <Upload className="h-4 w-4 mr-2" />
                Select ZIP File
              </Button>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Supported formats:</strong> ZIP archives only</p>
          <p><strong>Document types:</strong> PDF, DOC, DOCX, TXT, Images (JPG, PNG, GIF)</p>
          <p><strong>File size limit:</strong> 300 MB per individual file</p>
          <p><strong>Auto-detection:</strong> Associations, units, and document categories</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentStorageUploader;
