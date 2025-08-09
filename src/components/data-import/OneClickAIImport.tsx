import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  FileText, 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Sparkles,
  Database,
  FileSpreadsheet,
  Archive,
  Eye,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import Papa from 'papaparse';
import { aiImportExecutor, type ImportExecutionResult } from '@/services/ai-import/ai-import-executor';
import { ImportErrorBoundary } from './ImportErrorBoundary';
import ImportPreviewModal from './ImportPreviewModal';

interface OneClickAIImportProps {
  associationId: string;
  onImportComplete?: (results: any) => void;
}

interface AIAnalysisResult {
  dataType: string;
  confidence: number;
  targetTables: string[];
  fieldMappings: Record<string, string>;
  tableAssignments?: Record<string, string[]>;
  dataQuality: {
    issues: string[];
    warnings: string[];
    suggestions: string[];
  };
  transformations: Array<{
    field: string;
    action: string;
    description: string;
  }>;
  requiredFields: string[];
  missingFields: string[];
  suggestedDefaults: Record<string, any>;
  relationships: Array<{
    type: string;
    description: string;
  }>;
  summary: string;
}

const OneClickAIImport: React.FC<OneClickAIImportProps> = ({ 
  associationId, 
  onImportComplete 
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [userDescription, setUserDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AIAnalysisResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [importResults, setImportResults] = useState<ImportExecutionResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
    setAnalysisResults(null);
    toast.success(`${acceptedFiles.length} file(s) uploaded successfully`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 250 * 1024 * 1024, // 250MB
    accept: {
      'text/csv': ['.csv'],
      'text/tab-separated-values': ['.tsv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/zip': ['.zip'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt', '.tsv']
    }
  });

  const parseFileContent = async (file: File): Promise<any> => {
    if (file.name.endsWith('.csv')) {
      const text = await file.text();
      return text;
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      return XLSX.utils.sheet_to_json(worksheet);
    } else if (file.name.endsWith('.zip')) {
      return await parseZipFileWithFolders(file);
    } else {
      return await file.text();
    }
  };

  const parseZipFileWithFolders = async (file: File): Promise<any> => {
    const buffer = await file.arrayBuffer();
    const zip = new JSZip();
    const zipFile = await zip.loadAsync(buffer);
    
    // Simplified ZIP processing optimized for AI analysis
    const result = {
      type: 'zip_archive',
      files: {} as Record<string, any>,
      structure: {
        folders: [] as string[],
        filesByFolder: {} as Record<string, string[]>,
        totalFiles: 0,
        processedFiles: 0
      },
      summary: {
        primaryDataType: '',
        confidence: 0,
        folderTypes: {} as Record<string, string>
      }
    };

    // Step 1: Quick folder analysis
    const folders = new Set<string>();
    const allFiles = Object.keys(zipFile.files).filter(f => !zipFile.files[f].dir);
    
    for (const filename of allFiles) {
      const folderPath = filename.includes('/') ? filename.substring(0, filename.lastIndexOf('/')) : 'root';
      folders.add(folderPath);
      
      if (!result.structure.filesByFolder[folderPath]) {
        result.structure.filesByFolder[folderPath] = [];
      }
      result.structure.filesByFolder[folderPath].push(filename);
    }

    result.structure.folders = Array.from(folders);
    result.structure.totalFiles = allFiles.length;

    // Step 2: Categorize folders and prioritize files
    const prioritizedFiles = [];
    let processedCount = 0;
    const maxFilesToProcess = 10; // Limit to prevent AI overload
    
    for (const folderPath of result.structure.folders) {
      const folderFiles = result.structure.filesByFolder[folderPath];
      const folderCategory = categorizeFolderByName(folderPath, folderFiles);
      result.summary.folderTypes[folderPath] = folderCategory;
      
      // Process most important files from each folder
      const sortedFiles = folderFiles
        .filter(f => isSupportedFileType(f))
        .sort((a, b) => getFileRelevanceScore(b.toLowerCase()) - getFileRelevanceScore(a.toLowerCase()))
        .slice(0, 3); // Max 3 files per folder
        
      prioritizedFiles.push(...sortedFiles);
      
      if (prioritizedFiles.length >= maxFilesToProcess) break;
    }

    // Step 3: Process prioritized files with size limits
    for (const filename of prioritizedFiles.slice(0, maxFilesToProcess)) {
      const zipEntry = zipFile.files[filename];
      
      if (zipEntry.dir) continue;
      
      try {
        const fileData = await processZipEntryOptimized(zipEntry, filename);
        
        if (fileData) {
          const simplifiedName = filename.replace(/^.*\//, ''); // Remove path for simplicity
          result.files[simplifiedName] = fileData;
          processedCount++;
        }
      } catch (error) {
        console.warn(`Failed to process file ${filename} in ZIP:`, error);
      }
    }

    result.structure.processedFiles = processedCount;
    
    // Fallback: deep scan the entire ZIP for any CSV/XLS/XLSX if none were captured above
    const hasStructured = Object.values(result.files).some((f: any) => f?.type === 'excel' || f?.type === 'csv' || f?.type === 'delimited');
    if (!hasStructured) {
      const structuredCandidates = allFiles.filter(fn => {
        const lower = fn.toLowerCase();
        return lower.endsWith('.csv') || lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.txt');
      });

      for (const filename of structuredCandidates) {
        if ((Object.keys(result.files).length >= 5)) break; // cap additions
        const zipEntry = zipFile.files[filename];
        if (!zipEntry || zipEntry.dir) continue;
        try {
          const fileData = await processZipEntryOptimized(zipEntry, filename);
          if (fileData && (fileData.type === 'excel' || fileData.type === 'csv' || fileData.type === 'delimited')) {
            const simplifiedName = filename.replace(/^.*\//, '');
            if (!result.files[simplifiedName]) {
              result.files[simplifiedName] = fileData;
              processedCount++;
            }
          }
        } catch (e) {
          console.warn('Deep scan failed for', filename, e);
        }
      }
      result.structure.processedFiles = processedCount;
    }
    
    // Step 4: Determine primary data type
    const folderTypes = Object.values(result.summary.folderTypes);
    const typeCount = folderTypes.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    result.summary.primaryDataType = Object.entries(typeCount).reduce((a, b) => a[1] > b[1] ? a : b)[0] || 'mixed';
    result.summary.confidence = Math.min(90, 60 + (processedCount * 5));

    return result;
  };

  const categorizeFolderByName = (folderPath: string, files: string[]): string => {
    const lowerPath = folderPath.toLowerCase();
    
    // Check folder name patterns
    if (lowerPath.includes('property') || lowerPath.includes('unit') || lowerPath.includes('address')) {
      return 'properties';
    }
    if (lowerPath.includes('owner') || lowerPath.includes('resident') || lowerPath.includes('tenant')) {
      return 'residents';
    }
    if (lowerPath.includes('financial') || lowerPath.includes('assessment') || lowerPath.includes('payment') || lowerPath.includes('billing')) {
      return 'financial';
    }
    if (lowerPath.includes('maintenance') || lowerPath.includes('repair') || lowerPath.includes('work') || lowerPath.includes('service')) {
      return 'maintenance';
    }
    if (lowerPath.includes('compliance') || lowerPath.includes('violation') || lowerPath.includes('fine') || lowerPath.includes('arc')) {
      return 'compliance';
    }
    if (lowerPath.includes('association') || lowerPath.includes('hoa') || lowerPath.includes('community') || lowerPath.includes('board')) {
      return 'associations';
    }
    
    // Analyze file names within folder
    const fileTypes = files.map(f => {
      const fileName = f.toLowerCase();
      if (fileName.includes('property') || fileName.includes('unit')) return 'properties';
      if (fileName.includes('owner') || fileName.includes('resident')) return 'residents';
      if (fileName.includes('financial') || fileName.includes('assessment')) return 'financial';
      if (fileName.includes('maintenance')) return 'maintenance';
      if (fileName.includes('compliance')) return 'compliance';
      return 'mixed';
    });
    
    // Return most common type or 'mixed' if diverse
    const typeCounts = fileTypes.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const dominantType = Object.entries(typeCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    return dominantType === 'mixed' && Object.keys(typeCounts).length > 2 ? 'mixed' : dominantType;
  };

  const prioritizeFilesForProcessing = (files: string[], folderStructure: Record<string, string[]>, folderCategories: Record<string, string>): string[] => {
    // Priority order: properties > residents > financial > associations > maintenance > compliance > mixed
    const priorityOrder = ['properties', 'residents', 'financial', 'associations', 'maintenance', 'compliance', 'mixed'];
    
    const prioritized: string[] = [];
    
    // Process by folder category priority
    for (const category of priorityOrder) {
      for (const [folderPath, folderFiles] of Object.entries(folderStructure)) {
        if (folderCategories[folderPath] === category) {
          // Within each folder, prioritize by file importance
          const sortedFiles = folderFiles.sort((a, b) => {
            const aName = a.toLowerCase();
            const bName = b.toLowerCase();
            
            // Prioritize main/master files
            if (aName.includes('main') || aName.includes('master')) return -1;
            if (bName.includes('main') || bName.includes('master')) return 1;
            
            // Prioritize by file type relevance
            const aScore = getFileRelevanceScore(aName);
            const bScore = getFileRelevanceScore(bName);
            
            return bScore - aScore;
          });
          
          prioritized.push(...sortedFiles);
        }
      }
    }
    
    // Add any remaining files
    const processedFiles = new Set(prioritized);
    files.forEach(file => {
      if (!processedFiles.has(file)) {
        prioritized.push(file);
      }
    });
    
    return prioritized;
  };

  const getFileRelevanceScore = (fileName: string): number => {
    let score = 0;
    
    // Higher score for more important file types
    if (fileName.includes('property') || fileName.includes('unit')) score += 10;
    if (fileName.includes('owner') || fileName.includes('resident')) score += 9;
    if (fileName.includes('financial') || fileName.includes('assessment')) score += 8;
    if (fileName.includes('association') || fileName.includes('hoa')) score += 7;
    if (fileName.includes('maintenance')) score += 6;
    if (fileName.includes('compliance')) score += 5;
    
    // Bonus for CSV/Excel files
    if (fileName.endsWith('.csv')) score += 3;
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) score += 2;
    
    return score;
  };

  // Detect delimiter for delimited text files
  const detectDelimiter = (sample: string): string | null => {
    const first = sample.split('\n').slice(0, 5).join('\n');
    const candidates = [',', '\t', '|', ';'];
    let bestDelim: string | null = null;
    let bestCount = 0;
    for (const d of candidates) {
      const re = new RegExp(`\\${d}`, 'g');
      const count = (first.match(re) || []).length;
      if (count > bestCount) {
        bestCount = count;
        bestDelim = d;
      }
    }
    return bestCount >= 2 ? bestDelim : null;
  };

  const processZipEntryOptimized = async (zipEntry: any, filename: string): Promise<any> => {
    const folderPath = filename.includes('/') ? filename.substring(0, filename.lastIndexOf('/')) : 'root';
    
    try {
      if (filename.toLowerCase().endsWith('.csv')) {
        const text = await zipEntry.async('text');
        // Soft limit: if very large, still sample without throwing
        if (text.length > 15 * 1024 * 1024) {
          console.warn('Large CSV inside ZIP detected, sampling first 200 lines');
        }
        
        // Return only essential data for AI analysis and richer preview
        const lines = text.split('\n');
        const sampleLines = lines.slice(0, 200); // Up to 200 lines for better preview
        
        return {
          type: 'csv',
          content: sampleLines.join('\n'),
          rowCount: Math.max(0, lines.length - 1),
          folderPath
        };
      } else if (filename.toLowerCase().endsWith('.xlsx') || filename.toLowerCase().endsWith('.xls')) {
        const buffer = await zipEntry.async('arraybuffer');
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Return only sample data for AI analysis and richer preview
        return {
          type: 'excel',
          content: jsonData.slice(0, 200), // Up to 200 rows for better preview
          rowCount: jsonData.length,
          folderPath,
          sheets: workbook.SheetNames
        };
      } else if (filename.toLowerCase().endsWith('.txt') || filename.toLowerCase().endsWith('.tsv')) {
        const text = await zipEntry.async('text');
        // Soft limit: allow big files, just sample
        if (text.length > 10 * 1024 * 1024) {
          console.warn('Large TXT/TSV inside ZIP detected, sampling first 200 lines');
        }
        const lines = text.split('\n');
        const sample = lines.slice(0, 200).join('\n');
        const delim = detectDelimiter(sample) || '\t';
        if (delim) {
          return {
            type: 'delimited',
            content: sample,
            delimiter: delim,
            rowCount: Math.max(0, lines.length - 1),
            folderPath
          };
        }
        return {
          type: 'text',
          content: text.substring(0, 500), // fallback: only first 500 chars
          folderPath
        };
      }
    } catch (error) {
      throw new Error(`Processing failed: ${error.message}`);
    }
    
    return null;
  };

  const suggestDataTypeFromContext = (filename: string, fileData: any, folderCategories: Record<string, string>): string => {
    const folderPath = filename.includes('/') ? filename.substring(0, filename.lastIndexOf('/')) : 'root';
    const folderCategory = folderCategories[folderPath];
    
    // Start with folder category as base suggestion
    let suggestion = folderCategory || 'mixed';
    
    // Refine based on file content if available
    if (fileData && fileData.content) {
      const content = Array.isArray(fileData.content) ? fileData.content : [];
      if (content.length > 0) {
        const firstRow = content[0];
        const columns = Object.keys(firstRow || {}).map(k => k.toLowerCase());
        
        // Analyze column names for more specific typing
        if (columns.some(col => col.includes('address') || col.includes('unit') || col.includes('property'))) {
          if (columns.some(col => col.includes('owner') || col.includes('name'))) {
            suggestion = 'properties_with_owners';
          } else {
            suggestion = 'properties';
          }
        } else if (columns.some(col => col.includes('owner') || col.includes('resident') || col.includes('tenant'))) {
          suggestion = 'residents';
        } else if (columns.some(col => col.includes('amount') || col.includes('payment') || col.includes('assessment'))) {
          suggestion = 'financial';
        }
      }
    }
    
    return suggestion;
  };

  const identifyFileRelationships = (files: Record<string, any>): Array<{from: string, to: string, type: string}> => {
    const relationships: Array<{from: string, to: string, type: string}> = [];
    const fileNames = Object.keys(files);
    
    // Look for common relationship patterns
    for (let i = 0; i < fileNames.length; i++) {
      for (let j = i + 1; j < fileNames.length; j++) {
        const file1 = fileNames[i];
        const file2 = fileNames[j];
        const data1 = files[file1];
        const data2 = files[file2];
        
        // Check for property-owner relationships
        if ((file1.toLowerCase().includes('property') && file2.toLowerCase().includes('owner')) ||
            (file1.toLowerCase().includes('owner') && file2.toLowerCase().includes('property'))) {
          relationships.push({
            from: file1,
            to: file2,
            type: 'property_owner'
          });
        }
        
        // Check for financial relationships
        if ((file1.toLowerCase().includes('property') && file2.toLowerCase().includes('assessment')) ||
            (file1.toLowerCase().includes('owner') && file2.toLowerCase().includes('payment'))) {
          relationships.push({
            from: file1,
            to: file2,
            type: 'financial_link'
          });
        }
      }
    }
    
    return relationships;
  };

  const isSupportedFileType = (filename: string): boolean => {
    const supportedExtensions = ['.csv', '.tsv', '.xlsx', '.xls', '.txt'];
    const lowerFilename = filename.toLowerCase();
    
    // Skip system files and unsupported types
    if (lowerFilename.startsWith('__macosx') || 
        lowerFilename.includes('.ds_store') ||
        lowerFilename.endsWith('.pdf') ||
        lowerFilename.endsWith('.jpg') ||
        lowerFilename.endsWith('.jpeg') ||
        lowerFilename.endsWith('.png') ||
        lowerFilename.endsWith('.gif') ||
        lowerFilename.endsWith('.doc') ||
        lowerFilename.endsWith('.docx')) {
      return false;
    }
    
    return supportedExtensions.some(ext => lowerFilename.endsWith(ext));
  };

  const analyzeWithAI = async () => {
    if (files.length === 0) {
      toast.error('Please upload at least one file');
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setCurrentStep('Parsing files...');

    try {
      // Parse all files with enhanced error tracking
      const fileContents: Array<{ name: string; content: any; type: string }> = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress((i / files.length) * 50);
        setCurrentStep(`Parsing ${file.name}...`);
        
        console.log(`Processing file ${i + 1}/${files.length}: ${file.name} (${file.size} bytes)`);
        
        try {
          const content = await parseFileContent(file);
          
          // Enhanced logging for ZIP files
          if (file.name.endsWith('.zip')) {
            console.log('ZIP file structure:', {
              type: content.type,
              totalFiles: content.structure?.totalFiles,
              processedFiles: content.structure?.processedFiles,
              folders: content.structure?.folders,
              primaryDataType: content.summary?.primaryDataType,
              confidence: content.summary?.confidence
            });
          }
          
          fileContents.push({
            name: file.name,
            content,
            type: file.type
          });
          
          console.log(`Successfully parsed ${file.name}`);
        } catch (parseError) {
          console.error(`Failed to parse ${file.name}:`, parseError);
          toast.error(`Failed to parse ${file.name}: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
          throw parseError;
        }
      }

      setProgress(60);
      setCurrentStep('Analyzing with AI...');

      console.log('Sending to AI processor:', {
        fileCount: fileContents.length,
        totalSize: fileContents.reduce((sum, f) => sum + JSON.stringify(f.content).length, 0),
        types: fileContents.map(f => f.type)
      });

      // Send to AI for analysis
      const { data, error } = await supabase.functions.invoke('ai-import-processor', {
        body: {
          fileContent: fileContents.length === 1 ? fileContents[0].content : fileContents,
          fileName: fileContents.length === 1 ? fileContents[0].name : `${files.length} files`,
          fileType: fileContents.length === 1 ? fileContents[0].type : 'mixed',
          associationId,
          userDescription
        }
      });

      if (error) {
        console.error('AI processor error:', error);
        throw error;
      }

      if (!data || !data.analysisResult) {
        console.error('Invalid AI processor response:', data);
        throw new Error('Invalid response from AI processor');
      }

      setProgress(100);
      setCurrentStep('Analysis complete!');
      setAnalysisResults(data.analysisResult);
      
      console.log('AI analysis completed successfully:', {
        confidence: data.analysisResult.confidence,
        targetTables: data.analysisResult.targetTables,
        fieldMappings: Object.keys(data.analysisResult.fieldMappings || {}).length
      });
      
      toast.success('AI analysis completed successfully!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const showImportPreview = async () => {
    if (!analysisResults) {
      toast.error('Please complete AI analysis first');
      return;
    }

    // Validate analysis results have required fields
    if (!analysisResults.targetTables || !analysisResults.fieldMappings) {
      toast.error('Analysis results are incomplete. Please retry analysis.');
      return;
    }

    try {
      setCurrentStep('Preparing preview...');

      const MAX_PREVIEW_ROWS = 200;
      const aggregatedRows: any[] = [];
      let zipHadStructured = false;

      // Parse file content for preview, including ZIP archives
      for (const file of files) {
        const content = await parseFileContent(file);

        if (content && typeof content === 'object' && content.type === 'zip_archive') {
          const filesMap = (content.files || {}) as Record<string, any>;
          for (const entry of Object.values(filesMap)) {
            if (aggregatedRows.length >= MAX_PREVIEW_ROWS) break;

            if (entry?.type === 'excel' && Array.isArray(entry.content)) {
              zipHadStructured = true;
              const rows = entry.content as any[];
              for (const row of rows) {
                aggregatedRows.push(row);
                if (aggregatedRows.length >= MAX_PREVIEW_ROWS) break;
              }
            } else if (entry?.type === 'csv' && typeof entry.content === 'string') {
              zipHadStructured = true;
              const parsed = Papa.parse(entry.content, { header: true, skipEmptyLines: true });
              const rows = (parsed.data as any[]).filter(Boolean);
              for (const row of rows) {
                aggregatedRows.push(row);
                if (aggregatedRows.length >= MAX_PREVIEW_ROWS) break;
              }
            } else if (entry?.type === 'delimited' && typeof entry.content === 'string') {
              zipHadStructured = true;
              const parsed = Papa.parse(entry.content, { header: true, skipEmptyLines: true, delimiter: entry.delimiter });
              const rows = (parsed.data as any[]).filter(Boolean);
              for (const row of rows) {
                aggregatedRows.push(row);
                if (aggregatedRows.length >= MAX_PREVIEW_ROWS) break;
              }
            }
          }
        } else if (Array.isArray(content)) {
          for (const row of content) {
            aggregatedRows.push(row);
            if (aggregatedRows.length >= MAX_PREVIEW_ROWS) break;
          }
        } else if (typeof content === 'string') {
          const delim = detectDelimiter(content) || undefined;
          const parsed = Papa.parse(content, { header: true, skipEmptyLines: true, delimiter: delim });
          const rows = (parsed.data as any[]).filter(Boolean);
          for (const row of rows) {
            aggregatedRows.push(row);
            if (aggregatedRows.length >= MAX_PREVIEW_ROWS) break;
          }
        }

        if (aggregatedRows.length >= MAX_PREVIEW_ROWS) break;
      }

      if (aggregatedRows.length === 0) {
        const hasZip = files.some(f => f.name.toLowerCase().endsWith('.zip'));
        if (hasZip && !zipHadStructured) {
          toast.error('ZIP analyzed but no CSV/Excel tables were found to preview. Please include CSV/XLSX files or select a ZIP with tabular data.');
        } else {
          toast.error('No data found to preview');
        }
        return;
      }

      setPreviewData(aggregatedRows);

      // Run validation to get errors and warnings
      const validationResult = await aiImportExecutor.executeImport(
        analysisResults,
        aggregatedRows,
        associationId
      );

      setValidationErrors(validationResult.validationErrors || []);
      setValidationWarnings(validationResult.warnings || []);
      setShowPreviewModal(true);

    } catch (error) {
      console.error('Preview error:', error);
      toast.error(`Failed to prepare preview: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  const confirmImport = async (userDefaults: Record<string, any>) => {
    if (!analysisResults) return;

    setShowPreviewModal(false);
    setIsImporting(true);
    setProgress(0);
    setCurrentStep('Starting import...');

    try {
      setProgress(30);
      setCurrentStep('Executing AI-guided import...');

      // Execute the actual import using AI analysis
      const importResult = await aiImportExecutor.executeImport(
        analysisResults,
        previewData,
        associationId
      );

      setProgress(90);
      setCurrentStep('Finalizing import...');
      setImportResults(importResult);

      if (importResult.success) {
        setProgress(100);
        setCurrentStep('Import complete!');
        
        toast.success(`Successfully imported ${importResult.importedRecords} records!`);
        
        if (importResult.warnings.length > 0) {
          toast.warning(`Import completed with ${importResult.warnings.length} warnings`);
        }
        
        onImportComplete?.(importResult);
      } else {
        toast.error(`Import failed: ${importResult.errors.join(', ')}`);
      }
      
    } catch (error) {
      console.error('Import error:', error);
      toast.error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Set error result
      setImportResults({
        success: false,
        importedRecords: 0,
        failedRecords: previewData.length,
        totalRecords: previewData.length,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: [],
        validationErrors: [],
        requiredFieldsErrors: [],
        details: []
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleRetry = () => {
    setAnalysisResults(null);
    setImportResults(null);
    setValidationErrors([]);
    setValidationWarnings([]);
    setPreviewData([]);
    setProgress(0);
    setCurrentStep('');
  };

  const handleReset = () => {
    setFiles([]);
    setUserDescription('');
    setAnalysisResults(null);
    setImportResults(null);
    setValidationErrors([]);
    setValidationWarnings([]);
    setPreviewData([]);
    setProgress(0);
    setCurrentStep('');
    setShowPreviewModal(false);
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.csv')) return <FileText className="h-5 w-5" />;
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) return <FileSpreadsheet className="h-5 w-5" />;
    if (fileName.endsWith('.zip')) return <Archive className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-500';
    if (confidence >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <ImportErrorBoundary 
      fallbackTitle="Import System Error"
      fallbackMessage="The import system encountered an error. Please try again or contact support if the problem persists."
      onRetry={handleRetry}
      onReset={handleReset}
    >
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              One-Click AI Import
            </CardTitle>
            <CardDescription>
              Upload any file type and let AI automatically analyze, map, and import your data. 
              Supports CSV, Excel, ZIP files up to 250MB each.
            </CardDescription>
          </CardHeader>
        </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-lg">Drop files here...</p>
            ) : (
              <div>
                <p className="text-lg mb-2">Drag & drop files here, or click to select</p>
                <p className="text-sm text-muted-foreground">
                  Supports CSV, Excel, ZIP, PDF, TXT • Up to 250MB per file
                </p>
              </div>
            )}
          </div>

          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="font-medium">Uploaded Files ({files.length})</h4>
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  {getFileIcon(file.name)}
                  <div className="flex-1">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">
              Describe your data (optional)
            </label>
            <Textarea
              placeholder="e.g., 'Property list with current owners' or 'Financial data from last quarter'"
              value={userDescription}
              onChange={(e) => setUserDescription(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="mt-4 flex justify-end">
            <Button 
              onClick={analyzeWithAI} 
              disabled={files.length === 0 || isAnalyzing}
              className="gap-2"
            >
              <Brain className="h-4 w-4" />
              {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      {(isAnalyzing || isImporting) && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{currentStep}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Analysis Results */}
      {analysisResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Confidence & Summary */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getConfidenceColor(analysisResults.confidence)}`} />
                <span className="font-medium">{analysisResults.confidence}% Confidence</span>
              </div>
              <Badge variant="outline" className="capitalize">
                {analysisResults.dataType}
              </Badge>
            </div>

            <p className="text-muted-foreground">{analysisResults.summary}</p>

            <Separator />

            {/* Data Quality */}
            <div>
              <h4 className="font-medium mb-3">Data Quality Assessment</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analysisResults.dataQuality.issues.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">Issues ({analysisResults.dataQuality.issues.length})</span>
                    </div>
                    <ul className="text-sm space-y-1">
                      {analysisResults.dataQuality.issues.map((issue, i) => (
                        <li key={i} className="text-muted-foreground">• {issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysisResults.dataQuality.warnings.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-yellow-600">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Warnings ({analysisResults.dataQuality.warnings.length})</span>
                    </div>
                    <ul className="text-sm space-y-1">
                      {analysisResults.dataQuality.warnings.map((warning, i) => (
                        <li key={i} className="text-muted-foreground">• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysisResults.dataQuality.suggestions.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">Suggestions ({analysisResults.dataQuality.suggestions.length})</span>
                    </div>
                    <ul className="text-sm space-y-1">
                      {analysisResults.dataQuality.suggestions.map((suggestion, i) => (
                        <li key={i} className="text-muted-foreground">• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Field Mappings */}
            <div>
              <h4 className="font-medium mb-3">Automatic Field Mappings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(analysisResults.fieldMappings).map(([sourceField, targetField]) => (
                  <div key={sourceField} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <span className="text-sm font-medium">{sourceField}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-sm text-muted-foreground">{targetField}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Tables */}
            <div>
              <h4 className="font-medium mb-3">Target Database Tables</h4>
              <div className="flex gap-2 flex-wrap">
                {analysisResults.targetTables.map((table) => (
                  <Badge key={table} variant="secondary" className="gap-1">
                    <Database className="h-3 w-3" />
                    {table}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setAnalysisResults(null)}>
                Analyze Again
              </Button>
              <Button 
                onClick={showImportPreview} 
                disabled={isImporting || analysisResults.confidence < 50}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                {isImporting ? 'Importing...' : 'Preview & Import'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Results */}
      {importResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {importResults.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {importResults.importedRecords}
                </div>
                <div className="text-sm text-muted-foreground">Imported</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {importResults.failedRecords}
                </div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {importResults.totalRecords}
                </div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {importResults.warnings.length}
                </div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
            </div>

            {importResults.errors.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-red-600">Errors</h4>
                <ul className="text-sm space-y-1">
                  {importResults.errors.map((error, i) => (
                    <li key={i} className="text-red-600">• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {importResults.warnings.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-yellow-600">Warnings</h4>
                <ul className="text-sm space-y-1">
                  {importResults.warnings.map((warning, i) => (
                    <li key={i} className="text-yellow-600">• {warning}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={handleReset} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Start New Import
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Preview Modal */}
      <ImportPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        onConfirm={confirmImport}
        analysisResult={analysisResults}
        previewData={previewData}
        requiredFieldsErrors={validationErrors}
        warnings={validationWarnings}
      />
    </div>
    </ImportErrorBoundary>
  );
};

export default OneClickAIImport;