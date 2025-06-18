
import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AIZipProcessor } from '@/services/import-export/ai-zip-processor';

interface ImportResult {
  totalFiles: number;
  associations: Set<string>;
  properties: number;
  owners: number;
  financials: number;
  documents: number;
  processingTime: number;
  errors: string[];
}

const AISmartImport: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.zip')) {
      setSelectedFile(file);
      await processZipFile(file);
    } else {
      toast.error('Please select a ZIP file');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.zip')) {
      setSelectedFile(file);
      await processZipFile(file);
    } else {
      toast.error('Please select a ZIP file');
    }
  };

  const processZipFile = async (file: File) => {
    setIsProcessing(true);
    setResult(null);

    try {
      toast.info('AI analyzing your ZIP file...');
      const processor = new AIZipProcessor();
      const processingResult = await processor.processZipFile(file);
      
      setResult(processingResult);
      
      if (processingResult.errors.length === 0) {
        toast.success(`Import complete! Processed ${processingResult.totalFiles} files in ${(processingResult.processingTime / 1000).toFixed(1)}s`);
      } else {
        toast.warning(`Import completed with ${processingResult.errors.length} warnings`);
      }
    } catch (error) {
      console.error('AI import error:', error);
      toast.error('Failed to process ZIP file');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetImport = () => {
    setResult(null);
    setSelectedFile(null);
    setIsProcessing(false);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-blue-500" />
          AI-Powered Bulk Import
        </CardTitle>
        <CardDescription>
          Upload a ZIP file containing your HOA data. AI will automatically detect associations, 
          map columns, and import everything with 90% less manual work.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Drop Zone */}
        {!isProcessing && !result && (
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Drop your ZIP file here</h3>
            <p className="text-gray-600 mb-4">
              AI will automatically process all files, detect associations, and map data
            </p>
            <label className="inline-block">
              <input
                type="file"
                accept=".zip"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button variant="outline">
                Browse ZIP Files
              </Button>
            </label>
            
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">What happens during AI processing:</h4>
              <ul className="text-xs text-blue-800 space-y-1 text-left">
                <li>• Extracts all CSV and Excel files from your ZIP</li>
                <li>• Auto-detects data types (properties, owners, financials)</li>
                <li>• Smart column mapping with 85%+ accuracy</li>
                <li>• Identifies associations from folder names or data</li>
                <li>• Bulk imports everything in minutes</li>
              </ul>
            </div>
          </div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <div className="text-center py-12">
            <Loader className="w-16 h-16 mx-auto mb-4 animate-spin text-blue-600" />
            <h3 className="text-lg font-semibold mb-2">AI is analyzing your files...</h3>
            <p className="text-gray-600">
              Detecting associations, mapping columns, and preparing import
            </p>
            {selectedFile && (
              <p className="text-sm text-gray-500 mt-2">
                Processing: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                <h3 className="text-xl font-semibold">AI Import Complete!</h3>
              </div>
              <p className="text-gray-700 mb-4">
                Processed {result.totalFiles} files in {(result.processingTime / 1000).toFixed(1)} seconds
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="text-3xl font-bold text-blue-600">{result.associations.size}</div>
                  <div className="text-sm text-gray-600">Associations</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-3xl font-bold text-green-600">{result.properties}</div>
                  <div className="text-sm text-gray-600">Properties</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-3xl font-bold text-purple-600">{result.owners}</div>
                  <div className="text-sm text-gray-600">Owners</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-3xl font-bold text-orange-600">{result.financials}</div>
                  <div className="text-sm text-gray-600">Financials</div>
                </div>
              </div>
            </div>

            {/* Association Details */}
            <div className="bg-white border rounded-lg p-6">
              <h4 className="font-semibold mb-3">Detected Associations</h4>
              <div className="space-y-2">
                {Array.from(result.associations).map((assoc, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-400 mr-2" />
                      <span>{assoc}</span>
                      <Badge variant="secondary" className="ml-2">Auto-detected</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Errors (if any) */}
            {result.errors.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <AlertCircle className="w-6 h-6 text-yellow-600 mr-2" />
                  <h4 className="font-semibold">Some files need attention</h4>
                </div>
                <ul className="space-y-1">
                  {result.errors.map((error, idx) => (
                    <li key={idx} className="text-sm text-yellow-700">• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <Button onClick={resetImport} className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Import More Files
              </Button>
              <Button variant="outline">
                View Detailed Results
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AISmartImport;
