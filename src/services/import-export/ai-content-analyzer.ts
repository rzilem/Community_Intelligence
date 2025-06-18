
import { MappingOption } from '@/components/data-import/types/mapping-types';
import { ZipFileEntry } from './zip-parser-service';
import { devLog } from '@/utils/dev-logger';

export interface AIAnalysisResult {
  detectedType: string;
  confidence: number;
  suggestedMappings: Record<string, string>;
  associationName?: string;
  validationWarnings: string[];
}

export interface BatchAnalysisResult {
  fileAnalyses: Record<string, AIAnalysisResult>;
  globalAssociations: string[];
  overallConfidence: number;
  readyForAutoImport: boolean;
}

export const aiContentAnalyzer = {
  async analyzeBatch(files: ZipFileEntry[]): Promise<BatchAnalysisResult> {
    devLog.info('Starting AI batch analysis for', files.length, 'files');
    
    try {
      const fileAnalyses: Record<string, AIAnalysisResult> = {};
      const associations = new Set<string>();
      let totalConfidence = 0;
      
      // Analyze each file
      for (const file of files) {
        const analysis = await this.analyzeFile(file);
        fileAnalyses[file.path] = analysis;
        totalConfidence += analysis.confidence;
        
        if (analysis.associationName) {
          associations.add(analysis.associationName);
        }
      }
      
      const overallConfidence = files.length > 0 ? totalConfidence / files.length : 0;
      const readyForAutoImport = overallConfidence > 0.85;
      
      const result: BatchAnalysisResult = {
        fileAnalyses,
        globalAssociations: Array.from(associations),
        overallConfidence,
        readyForAutoImport
      };
      
      devLog.info('AI batch analysis complete:', {
        filesAnalyzed: files.length,
        overallConfidence,
        readyForAutoImport,
        associations: result.globalAssociations
      });
      
      return result;
    } catch (error) {
      devLog.error('Error in AI batch analysis:', error);
      throw error;
    }
  },

  async analyzeFile(file: ZipFileEntry): Promise<AIAnalysisResult> {
    devLog.info('Analyzing file with AI:', file.filename);
    
    try {
      // Get sample data for analysis
      const sampleData = file.data.slice(0, 3);
      const columns = Object.keys(sampleData[0] || {});
      
      // Use smart pattern matching first (faster than API call)
      const smartAnalysis = this.performSmartAnalysis(file, columns, sampleData);
      
      // If confidence is high enough, skip AI API call
      if (smartAnalysis.confidence > 0.8) {
        return smartAnalysis;
      }
      
      // For lower confidence, enhance with AI (would call OpenAI API in real implementation)
      return this.enhanceWithAI(smartAnalysis, file, columns, sampleData);
    } catch (error) {
      devLog.error('Error analyzing file:', error);
      
      // Fallback to basic analysis
      return {
        detectedType: file.detectedType,
        confidence: 0.3,
        suggestedMappings: {},
        validationWarnings: [`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  },

  private performSmartAnalysis(file: ZipFileEntry, columns: string[], sampleData: any[]): AIAnalysisResult {
    const mappings: Record<string, string> = {};
    const warnings: string[] = [];
    let confidence = 0.6;
    
    // Smart column mapping based on common patterns
    for (const column of columns) {
      const normalizedCol = column.toLowerCase().trim();
      
      // Address patterns
      if (normalizedCol.includes('address') || normalizedCol.includes('street')) {
        mappings[column] = 'address';
        confidence += 0.1;
      }
      // Name patterns
      else if (normalizedCol.includes('first') && normalizedCol.includes('name')) {
        mappings[column] = 'first_name';
        confidence += 0.05;
      }
      else if (normalizedCol.includes('last') && normalizedCol.includes('name')) {
        mappings[column] = 'last_name';
        confidence += 0.05;
      }
      // Email patterns
      else if (normalizedCol.includes('email') || normalizedCol.includes('e-mail')) {
        mappings[column] = 'email';
        confidence += 0.05;
      }
      // Phone patterns
      else if (normalizedCol.includes('phone') || normalizedCol.includes('tel')) {
        mappings[column] = 'phone';
        confidence += 0.05;
      }
      // Unit patterns
      else if (normalizedCol.includes('unit') || normalizedCol.includes('apt')) {
        mappings[column] = 'unit_number';
        confidence += 0.05;
      }
      // Amount patterns
      else if (normalizedCol.includes('amount') || normalizedCol.includes('balance')) {
        mappings[column] = 'amount';
        confidence += 0.05;
      }
      // Account patterns
      else if (normalizedCol.includes('account') && normalizedCol.includes('number')) {
        mappings[column] = 'account_number';
        confidence += 0.05;
      }
    }
    
    // Detect association from data patterns
    let associationName = file.associationHint;
    if (!associationName && sampleData.length > 0) {
      // Look for association indicators in the data
      for (const row of sampleData) {
        for (const [key, value] of Object.entries(row)) {
          if (typeof value === 'string' && value.toLowerCase().includes('hoa')) {
            associationName = value;
            break;
          }
        }
        if (associationName) break;
      }
    }
    
    // Validate data quality
    if (sampleData.length > 0) {
      const firstRow = sampleData[0];
      const emptyFields = Object.values(firstRow).filter(v => !v || v === '').length;
      const totalFields = Object.keys(firstRow).length;
      
      if (emptyFields / totalFields > 0.5) {
        warnings.push('High number of empty fields detected');
        confidence -= 0.1;
      }
    }
    
    return {
      detectedType: file.detectedType,
      confidence: Math.min(confidence, 0.95),
      suggestedMappings: mappings,
      associationName,
      validationWarnings: warnings
    };
  },

  private async enhanceWithAI(
    baseAnalysis: AIAnalysisResult, 
    file: ZipFileEntry, 
    columns: string[], 
    sampleData: any[]
  ): Promise<AIAnalysisResult> {
    // In a real implementation, this would call OpenAI API
    // For now, we'll enhance the smart analysis with additional logic
    
    const enhanced = { ...baseAnalysis };
    
    // Enhanced pattern detection
    if (file.filename.toLowerCase().includes('combined') || 
        file.filename.toLowerCase().includes('master')) {
      enhanced.detectedType = 'properties_owners';
      enhanced.confidence += 0.1;
    }
    
    // Look for property type indicators
    const hasPropertyTypeIndicators = columns.some(col => 
      col.toLowerCase().includes('type') || 
      col.toLowerCase().includes('style') ||
      col.toLowerCase().includes('category')
    );
    
    if (hasPropertyTypeIndicators && enhanced.detectedType === 'properties') {
      enhanced.confidence += 0.1;
    }
    
    return enhanced;
  }
};
