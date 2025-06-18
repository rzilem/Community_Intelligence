
import { devLog } from '@/utils/dev-logger';

export interface OpenAIAnalysisResult {
  dataType: string;
  confidence: number;
  fieldMappings: Record<string, string>;
  associationName?: string;
  validationIssues: string[];
  recommendations: string[];
}

export interface OpenAIBatchAnalysis {
  overallConfidence: number;
  readyForAutoImport: boolean;
  fileAnalyses: Record<string, OpenAIAnalysisResult>;
  detectedAssociations: string[];
  summary: string;
}

export const openaiContentAnalyzer = {
  async analyzeFileContent(
    filename: string,
    headers: string[],
    sampleData: any[],
    fileContext?: { folderName?: string; associationHint?: string }
  ): Promise<OpenAIAnalysisResult> {
    try {
      devLog.info('Starting OpenAI analysis for:', filename);

      const analysisPrompt = this.buildAnalysisPrompt(filename, headers, sampleData, fileContext);
      
      const response = await fetch('/api/openai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: analysisPrompt })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API request failed: ${response.statusText}`);
      }

      const { analysis } = await response.json();
      return this.parseOpenAIResponse(analysis, headers);
      
    } catch (error) {
      devLog.error('OpenAI analysis failed:', error);
      
      // Fallback to pattern-based analysis
      return this.fallbackAnalysis(filename, headers, sampleData);
    }
  },

  async analyzeBatch(files: Array<{
    filename: string;
    headers: string[];
    sampleData: any[];
    folderName?: string;
  }>): Promise<OpenAIBatchAnalysis> {
    try {
      const fileAnalyses: Record<string, OpenAIAnalysisResult> = {};
      let totalConfidence = 0;
      const associations = new Set<string>();

      // Analyze each file
      for (const file of files) {
        const analysis = await this.analyzeFileContent(
          file.filename,
          file.headers,
          file.sampleData,
          { folderName: file.folderName }
        );
        
        fileAnalyses[file.filename] = analysis;
        totalConfidence += analysis.confidence;
        
        if (analysis.associationName) {
          associations.add(analysis.associationName);
        }
      }

      const overallConfidence = files.length > 0 ? totalConfidence / files.length : 0;
      const readyForAutoImport = overallConfidence > 0.85;

      return {
        overallConfidence,
        readyForAutoImport,
        fileAnalyses,
        detectedAssociations: Array.from(associations),
        summary: this.generateBatchSummary(files.length, overallConfidence, associations.size)
      };

    } catch (error) {
      devLog.error('Batch analysis failed:', error);
      throw error;
    }
  },

  buildAnalysisPrompt(
    filename: string,
    headers: string[],
    sampleData: any[],
    context?: { folderName?: string; associationHint?: string }
  ): string {
    return `
Analyze this HOA data file and provide a JSON response with the following structure:
{
  "dataType": "properties|owners|financial|assessments|maintenance|compliance|associations",
  "confidence": 0.95,
  "fieldMappings": {
    "source_column": "target_field"
  },
  "associationName": "detected association name",
  "validationIssues": ["list of potential issues"],
  "recommendations": ["suggestions for data quality"]
}

File Details:
- Filename: ${filename}
- Folder: ${context?.folderName || 'root'}
- Association Hint: ${context?.associationHint || 'none'}

Headers: ${headers.join(', ')}

Sample Data (first 3 rows):
${JSON.stringify(sampleData.slice(0, 3), null, 2)}

Target Field Options:
Properties: address, property_type, unit_number, square_footage, bedrooms, bathrooms, year_built
Owners: first_name, last_name, email, phone, property_id, move_in_date, resident_type
Financial: property_id, amount, due_date, payment_status, assessment_type
Assessments: property_id, amount, due_date, assessment_type_id
Associations: name, address, contact_email, phone, city, state, zip

Analysis Instructions:
1. Determine the primary data type based on the column headers and content
2. Map source columns to target fields with high confidence
3. Extract association name from folder structure, filename, or data content
4. Identify any data quality issues or missing required fields
5. Provide confidence score (0-1) based on clarity of data structure

Respond only with valid JSON.`;
  },

  parseOpenAIResponse(response: string, originalHeaders: string[]): OpenAIAnalysisResult {
    try {
      // Clean the response to extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and normalize the response
      return {
        dataType: parsed.dataType || 'unknown',
        confidence: Math.min(Math.max(parsed.confidence || 0, 0), 1),
        fieldMappings: parsed.fieldMappings || {},
        associationName: parsed.associationName || undefined,
        validationIssues: Array.isArray(parsed.validationIssues) ? parsed.validationIssues : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : []
      };
      
    } catch (error) {
      devLog.error('Failed to parse OpenAI response:', error);
      throw new Error('Invalid response format from OpenAI');
    }
  },

  fallbackAnalysis(filename: string, headers: string[], sampleData: any[]): OpenAIAnalysisResult {
    devLog.info('Using fallback analysis for:', filename);
    
    // Simple pattern-based analysis as fallback
    const dataType = this.detectDataTypeFromHeaders(headers);
    const fieldMappings = this.generateBasicMappings(headers, dataType);
    
    return {
      dataType,
      confidence: 0.6, // Lower confidence for fallback
      fieldMappings,
      validationIssues: ['OpenAI analysis unavailable - using pattern matching'],
      recommendations: ['Verify field mappings manually']
    };
  },

  detectDataTypeFromHeaders(headers: string[]): string {
    const headerStr = headers.join(' ').toLowerCase();
    
    if (headerStr.includes('address') && (headerStr.includes('property') || headerStr.includes('unit'))) {
      return 'properties';
    }
    if (headerStr.includes('first') && headerStr.includes('name') || headerStr.includes('owner')) {
      return 'owners';
    }
    if (headerStr.includes('amount') && (headerStr.includes('due') || headerStr.includes('payment'))) {
      return 'financial';
    }
    if (headerStr.includes('association') && headerStr.includes('name')) {
      return 'associations';
    }
    
    return 'unknown';
  },

  generateBasicMappings(headers: string[], dataType: string): Record<string, string> {
    const mappings: Record<string, string> = {};
    
    headers.forEach(header => {
      const normalized = header.toLowerCase().trim();
      
      // Common mappings across all types
      if (normalized.includes('address')) mappings[header] = 'address';
      if (normalized.includes('email')) mappings[header] = 'email';
      if (normalized.includes('phone')) mappings[header] = 'phone';
      
      // Type-specific mappings
      switch (dataType) {
        case 'properties':
          if (normalized.includes('unit')) mappings[header] = 'unit_number';
          if (normalized.includes('type')) mappings[header] = 'property_type';
          if (normalized.includes('sqft') || normalized.includes('square')) mappings[header] = 'square_footage';
          break;
          
        case 'owners':
          if (normalized.includes('first') && normalized.includes('name')) mappings[header] = 'first_name';
          if (normalized.includes('last') && normalized.includes('name')) mappings[header] = 'last_name';
          break;
          
        case 'financial':
          if (normalized.includes('amount')) mappings[header] = 'amount';
          if (normalized.includes('due')) mappings[header] = 'due_date';
          break;
      }
    });
    
    return mappings;
  },

  generateBatchSummary(fileCount: number, confidence: number, associationCount: number): string {
    const confPercentage = Math.round(confidence * 100);
    
    if (confidence > 0.9) {
      return `Excellent data quality! ${fileCount} files analyzed with ${confPercentage}% confidence. Found ${associationCount} associations. Ready for auto-import.`;
    } else if (confidence > 0.7) {
      return `Good data quality. ${fileCount} files analyzed with ${confPercentage}% confidence. Found ${associationCount} associations. Some manual review recommended.`;
    } else {
      return `Data quality needs attention. ${fileCount} files analyzed with ${confPercentage}% confidence. Manual review required before import.`;
    }
  }
};
