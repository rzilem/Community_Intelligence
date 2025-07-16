import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { fileContent, fileName, fileType, associationId, userDescription } = await req.json();

    console.log('AI Import Processor started:', { fileName, fileType, associationId });

    // Step 1: Get database schema for validation
    console.log('Step 1: Getting database schema...');
    const schemaInfo = {
      availableTables: {
        properties: {
          columns: ['account_number', 'address', 'address_line_2', 'assessment_amount', 'association_id', 'bathrooms', 'bedrooms', 'block_number', 'city', 'current_balance', 'full_address', 'homeowner_id', 'legal_description', 'lot_number', 'lot_size', 'notes', 'old_account_number', 'overall_balance', 'parcel_id', 'parking_spaces', 'phase', 'property_type', 'settled_date', 'special_assessment', 'special_features', 'square_footage', 'state', 'status', 'street_name', 'street_number', 'unit_number', 'village', 'year_built', 'zip_code'],
          description: 'Property records with address, financial, and physical details'
        },
        homeowners: {
          columns: ['account_number', 'ach_start_date', 'all_emails', 'all_phones', 'billing_communication_preference', 'blocked_ledger_view', 'business_name', 'charge_tags', 'collection_provider', 'collection_status', 'current_balance', 'deed_name', 'email', 'first_name', 'full_homeowner_name', 'general_communication_preference', 'homeowner_id', 'last_name', 'last_payment_amount', 'last_payment_date', 'lease_status', 'login_emails', 'mailing_address', 'mailing_city', 'mailing_full_address', 'mailing_state', 'mailing_zip', 'old_account_number', 'overall_balance', 'ownership_percentage', 'phone', 'portal_key', 'second_owner_first_name', 'second_owner_last_name', 'tags', 'tenant_emails', 'tenant_end_date', 'tenant_names', 'tenant_phones', 'tenant_start_date'],
          description: 'Homeowner information including contact details, balances, and communication preferences'
        },
        residents: {
          columns: ['account_number', 'client_portal_link', 'emergency_contact', 'emergency_contact_phone', 'first_name', 'last_name', 'email', 'phone', 'phone_secondary', 'move_in_date', 'move_out_date', 'property_id', 'association_id', 'is_owner', 'is_tenant', 'is_primary_contact', 'preferences', 'status'],
          description: 'Resident information for both owners and tenants'
        },
        assessments: {
          columns: ['amount', 'assessment_type_id', 'due_date', 'late_fee', 'paid', 'payment_date', 'payment_due_date', 'payment_status', 'payment_url', 'property_id', 'stripe_session_id', 'total_amount_paid'],
          description: 'Property assessments and payment records'
        }
      }
    };

    // Step 2: Analyze file content with AI (with retry logic)
    console.log('Step 2: Analyzing file content with AI...');
    
    // Preprocess data for better AI analysis
    const preprocessedData = await preprocessDataForAI(fileContent, fileName, fileType);
    
    let analysisResult;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`AI Analysis attempt ${attempts}/${maxAttempts}`);
      
      try {
        const analysisPrompt = createAnalysisPrompt(fileName, fileType, userDescription, preprocessedData, schemaInfo, attempts);
        const aiResponse = await callOpenAIWithRetry(analysisPrompt, attempts);
        
        const extractedResult = extractAndValidateJSON(aiResponse);
        if (extractedResult.success) {
          analysisResult = extractedResult.data;
          console.log('AI Analysis successful on attempt', attempts);
          break;
        } else {
          console.log(`AI Analysis failed on attempt ${attempts}:`, extractedResult.error);
          if (attempts === maxAttempts) {
            throw new Error(extractedResult.error);
          }
        }
      } catch (error) {
        console.log(`AI Analysis error on attempt ${attempts}:`, error);
        if (attempts === maxAttempts) {
          // Use intelligent fallback system
          analysisResult = await createIntelligentFallback(fileContent, fileName, fileType, schemaInfo, error.message);
          break;
        }
      }
    }

    console.log('AI Analysis Result:', analysisResult);
    
    // Validate the analysis result structure
    const validationErrors = validateAnalysisResult(analysisResult);
    if (validationErrors.length > 0) {
      console.log('Analysis validation errors:', validationErrors);
      analysisResult.dataQuality.issues.push(...validationErrors);
    }

    // Step 3: Validate field mappings against database schema with intelligent table assignment
    console.log('Step 3: Validating field mappings against database schema...');
    const validationResult = {
      validMappings: {},
      invalidMappings: {},
      suggestions: []
    };

    // Validate each field mapping using table assignments from AI analysis
    for (const [sourceField, targetField] of Object.entries(analysisResult.fieldMappings || {})) {
      let isValid = false;
      let assignedTable = null;
      
      // First, check if AI provided table assignments
      if (analysisResult.tableAssignments) {
        // Find which table this field was assigned to
        for (const [tableName, fields] of Object.entries(analysisResult.tableAssignments)) {
          if (fields.includes(sourceField)) {
            assignedTable = tableName;
            break;
          }
        }
      }
      
      // If we have an assigned table, validate against that specific table
      if (assignedTable && schemaInfo.availableTables[assignedTable]?.columns.includes(targetField)) {
        isValid = true;
        validationResult.validMappings[sourceField] = {
          targetField,
          table: assignedTable
        };
      } else if (assignedTable) {
        // Field was assigned to a table but doesn't exist in that table
        validationResult.invalidMappings[sourceField] = {
          targetField,
          assignedTable,
          reason: `Field '${targetField}' does not exist in assigned table '${assignedTable}'`
        };
        
        // Try to suggest a similar field in the assigned table
        const columns = schemaInfo.availableTables[assignedTable]?.columns || [];
        const similarField = columns.find(col => 
          col.toLowerCase().includes(targetField.toLowerCase()) ||
          targetField.toLowerCase().includes(col.toLowerCase())
        );
        if (similarField) {
          validationResult.suggestions.push({
            sourceField,
            invalidField: targetField,
            suggestedField: similarField,
            table: assignedTable
          });
        }
      } else {
        // No table assignment, fall back to checking all target tables
        for (const tableName of analysisResult.targetTables || []) {
          if (schemaInfo.availableTables[tableName]?.columns.includes(targetField)) {
            isValid = true;
            assignedTable = tableName;
            break;
          }
        }
        
        if (isValid) {
          validationResult.validMappings[sourceField] = {
            targetField,
            table: assignedTable
          };
        } else {
          validationResult.invalidMappings[sourceField] = {
            targetField,
            reason: `Field '${targetField}' does not exist in any of the target tables`
          };
          
          // Try to suggest a similar field from any table
          for (const tableName of analysisResult.targetTables || []) {
            const columns = schemaInfo.availableTables[tableName]?.columns || [];
            const similarField = columns.find(col => 
              col.toLowerCase().includes(targetField.toLowerCase()) ||
              targetField.toLowerCase().includes(col.toLowerCase())
            );
            if (similarField) {
              validationResult.suggestions.push({
                sourceField,
                invalidField: targetField,
                suggestedField: similarField,
                table: tableName
              });
              break;
            }
          }
        }
      }
    }

    // Update analysis result with validation info
    analysisResult.validation = validationResult;
    analysisResult.isValid = Object.keys(validationResult.invalidMappings).length === 0;
    
    // Add detailed validation errors to data quality issues
    if (Object.keys(validationResult.invalidMappings).length > 0) {
      const validationErrors = Object.entries(validationResult.invalidMappings).map(
        ([field, error]) => `Field '${field}' mapping failed: ${error.reason}`
      );
      analysisResult.dataQuality = analysisResult.dataQuality || { issues: [], warnings: [], suggestions: [] };
      analysisResult.dataQuality.issues = [...(analysisResult.dataQuality.issues || []), ...validationErrors];
    }
    
    // Add validation suggestions to data quality suggestions
    if (validationResult.suggestions.length > 0) {
      const validationSuggestions = validationResult.suggestions.map(
        (suggestion) => `Consider mapping '${suggestion.sourceField}' to '${suggestion.suggestedField}' in table '${suggestion.table}'`
      );
      analysisResult.dataQuality = analysisResult.dataQuality || { issues: [], warnings: [], suggestions: [] };
      analysisResult.dataQuality.suggestions = [...(analysisResult.dataQuality.suggestions || []), ...validationSuggestions];
    }

    console.log('Field validation result:', validationResult);

    // Step 4: Validate against database schema
    console.log('Step 4: Validating against database schema...');
    const { data: associations } = await supabase
      .from('associations')
      .select('id, name, property_type')
      .eq('id', associationId)
      .single();

    if (!associations) {
      throw new Error('Association not found');
    }

    // Step 5: Generate import preview
    console.log('Step 5: Generating import preview...');
    
    // Enhanced data quality assessment
    const hasValidTargetTables = analysisResult.targetTables && analysisResult.targetTables.length > 0;
    const hasValidFieldMappings = analysisResult.fieldMappings && Object.keys(analysisResult.fieldMappings).length > 0;
    const hasValidation = analysisResult.validation && analysisResult.isValid;
    
    const importPreview = {
      analysisResult,
      association: associations,
      estimatedRecords: Array.isArray(fileContent) ? fileContent.length : 
                        typeof fileContent === 'string' ? fileContent.split('\n').length - 1 : 0,
      readyToImport: analysisResult.confidence > 70 && 
                     analysisResult.missingFields.length === 0 && 
                     hasValidTargetTables &&
                     hasValidFieldMappings &&
                     (hasValidation || analysisResult.confidence > 80),
      humanReviewRequired: analysisResult.confidence < 85 || 
                           analysisResult.dataQuality.issues.length > 0 || 
                           !hasValidTargetTables ||
                           !hasValidFieldMappings,
      processingTime: new Date().toISOString(),
      validationSummary: {
        hasValidTargetTables,
        hasValidFieldMappings,
        hasValidation,
        validationErrors: analysisResult.validation?.invalidMappings ? Object.keys(analysisResult.validation.invalidMappings).length : 0
      }
    };

    console.log('Import preview generated successfully');

    return new Response(JSON.stringify({
      success: true,
      ...importPreview
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI import processor:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'Unknown error occurred',
      details: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper functions for robust AI analysis

async function preprocessDataForAI(fileContent: any, fileName: string, fileType: string): Promise<string> {
  try {
    let preview = '';
    
    // Handle enhanced ZIP structure
    if (fileContent && typeof fileContent === 'object' && fileContent.files && fileContent.folderStructure) {
      // Enhanced ZIP file processing
      const zipData = fileContent;
      
      preview = `ZIP ARCHIVE ANALYSIS:
Folder Structure: ${JSON.stringify(zipData.folderStructure, null, 2)}
Processing Summary: ${JSON.stringify(zipData.processingSummary, null, 2)}
Analysis Metadata: ${JSON.stringify(zipData.analysisMetadata, null, 2)}

FILE SAMPLES:`;
      
      // Include samples from prioritized files
      const prioritizedSamples = zipData.processingSummary.prioritizedFiles.slice(0, 3);
      for (const filename of prioritizedSamples) {
        const fileData = zipData.files[filename] || zipData.files[`root/${filename}`];
        if (fileData) {
          preview += `\n\n--- ${filename} (${fileData.folderCategory}) ---\n`;
          
          if (fileData.type === 'csv' && typeof fileData.content === 'string') {
            const lines = fileData.content.split('\n');
            preview += lines.slice(0, 3).join('\n');
          } else if (fileData.type === 'excel' && Array.isArray(fileData.content)) {
            preview += JSON.stringify(fileData.content.slice(0, 2), null, 2);
          } else if (typeof fileData.content === 'string') {
            preview += fileData.content.substring(0, 300);
          }
        }
      }
    } else if (typeof fileContent === 'string') {
      // For CSV/text files, take first 5 lines + sample from middle
      const lines = fileContent.split('\n');
      const headerLines = lines.slice(0, 3);
      const sampleLines = lines.slice(Math.floor(lines.length / 2), Math.floor(lines.length / 2) + 2);
      preview = [...headerLines, '...', ...sampleLines].join('\n');
    } else if (Array.isArray(fileContent)) {
      // For array data, take first 3 items with full structure
      const sampleItems = fileContent.slice(0, 3);
      preview = JSON.stringify(sampleItems, null, 2);
    } else {
      preview = JSON.stringify(fileContent, null, 2);
    }
    
    // Limit preview size to avoid token limits
    return preview.substring(0, 4000); // Increased limit for ZIP analysis
  } catch (error) {
    console.error('Error preprocessing data:', error);
    return 'Error preprocessing data for AI analysis';
  }
}

function createAnalysisPrompt(fileName: string, fileType: string, userDescription: string, preprocessedData: string, schemaInfo: any, attempt: number): string {
  // Check if this is a ZIP file with folder structure
  const isZipWithFolders = preprocessedData.includes('ZIP ARCHIVE ANALYSIS:');
  
  let basePrompt = `CRITICAL: Return ONLY valid JSON. NO markdown, NO explanations, NO code blocks.

File: ${fileName} (${fileType})
${userDescription ? `Description: ${userDescription}` : ''}

Data Sample:
${preprocessedData}

Available Tables:
- properties: ${schemaInfo.availableTables.properties.columns.slice(0, 10).join(', ')}...
- homeowners: ${schemaInfo.availableTables.homeowners.columns.slice(0, 10).join(', ')}...
- residents: ${schemaInfo.availableTables.residents.columns.slice(0, 10).join(', ')}...
- assessments: ${schemaInfo.availableTables.assessments.columns.slice(0, 10).join(', ')}...`;

  if (isZipWithFolders) {
    basePrompt += `

SPECIAL INSTRUCTIONS FOR ZIP ARCHIVES:
1. Analyze the folder structure and categorization provided
2. Consider file relationships and prioritization
3. Map each file to appropriate target tables based on folder context
4. Provide specific mappings for each file in the ZIP
5. Use the folder categories to enhance data type detection

Enhanced JSON Response for ZIP:
{
  "dataType": "mixed",
  "confidence": 85,
  "targetTables": ["properties", "residents"],
  "fieldMappings": {"file1/field1": "targetField1", "file2/field2": "targetField2"},
  "tableAssignments": {"properties": ["file1/field1"], "residents": ["file2/field2"]},
  "zipAnalysis": {
    "folderMappings": {"folder1": "properties", "folder2": "residents"},
    "fileProcessingOrder": ["file1", "file2"],
    "crossFileRelationships": [{"from": "file1", "to": "file2", "via": "property_id"}]
  },
  "dataQuality": {"issues": [], "warnings": [], "suggestions": []},
  "transformations": [],
  "requiredFields": [],
  "missingFields": [],
  "suggestedDefaults": {},
  "relationships": [],
  "summary": "ZIP archive analysis with folder-aware processing"
}`;
  } else {
    basePrompt += `

Required JSON Response:
{
  "dataType": "properties|residents|financial|mixed",
  "confidence": 85,
  "targetTables": ["properties"],
  "fieldMappings": {"sourceField": "targetField"},
  "tableAssignments": {"properties": ["sourceField1"]},
  "dataQuality": {"issues": [], "warnings": [], "suggestions": []},
  "transformations": [],
  "requiredFields": [],
  "missingFields": [],
  "suggestedDefaults": {},
  "relationships": [],
  "summary": "Analysis complete"
}`;
  }
  
  if (attempt === 1) {
    return basePrompt;
  } else if (attempt === 2) {
    return `${basePrompt}\n\nSIMPLIFIED: Focus on basic field mapping. Return minimal valid JSON.`;
  } else {
    return `Return ONLY this JSON structure with your analysis:
{"dataType":"mixed","confidence":60,"targetTables":["properties"],"fieldMappings":{},"tableAssignments":{},"dataQuality":{"issues":[],"warnings":[],"suggestions":[]},"transformations":[],"requiredFields":[],"missingFields":[],"suggestedDefaults":{},"relationships":[],"summary":"Basic analysis"}`;
  }
}

async function callOpenAIWithRetry(prompt: string, attempt: number): Promise<any> {
  const temperature = attempt === 1 ? 0.1 : attempt === 2 ? 0.05 : 0.01;
  const maxTokens = attempt === 1 ? 3000 : attempt === 2 ? 2000 : 1000;
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a data analyst. CRITICAL: Respond with ONLY valid JSON. No markdown, no explanations, no code blocks. Just the JSON object.' },
        { role: 'user', content: prompt }
      ],
      temperature,
      max_tokens: maxTokens,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

function extractAndValidateJSON(aiResponse: any): { success: boolean; data?: any; error?: string } {
  try {
    if (!aiResponse.choices || !aiResponse.choices[0] || !aiResponse.choices[0].message) {
      return { success: false, error: 'Invalid OpenAI response structure' };
    }
    
    let content = aiResponse.choices[0].message.content;
    console.log('Raw AI response:', content);
    
    // Multiple strategies for JSON extraction
    const strategies = [
      // Strategy 1: Remove markdown code blocks
      (text: string) => text.replace(/```json\s*|\s*```/g, '').trim(),
      
      // Strategy 2: Extract content between first { and last }
      (text: string) => {
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        return start !== -1 && end !== -1 ? text.substring(start, end + 1) : text;
      },
      
      // Strategy 3: Remove all non-JSON content before/after
      (text: string) => {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return jsonMatch ? jsonMatch[0] : text;
      },
      
      // Strategy 4: Clean common formatting issues
      (text: string) => text
        .replace(/^\s*```[\w]*\s*|\s*```\s*$/g, '')
        .replace(/^[^{]*(\{)/g, '$1')
        .replace(/(\})[^}]*$/g, '$1')
        .trim()
    ];
    
    for (const strategy of strategies) {
      try {
        const cleaned = strategy(content);
        console.log('Trying strategy, cleaned:', cleaned.substring(0, 200));
        
        const parsed = JSON.parse(cleaned);
        
        // Validate required fields
        if (!parsed.targetTables || !Array.isArray(parsed.targetTables)) {
          continue;
        }
        
        if (!parsed.fieldMappings || typeof parsed.fieldMappings !== 'object') {
          continue;
        }
        
        // Success! Apply defaults
        parsed.dataType = parsed.dataType || 'unknown';
        parsed.confidence = parsed.confidence || 50;
        parsed.dataQuality = parsed.dataQuality || { issues: [], warnings: [], suggestions: [] };
        parsed.transformations = parsed.transformations || [];
        parsed.requiredFields = parsed.requiredFields || [];
        parsed.missingFields = parsed.missingFields || [];
        parsed.suggestedDefaults = parsed.suggestedDefaults || {};
        parsed.relationships = parsed.relationships || [];
        parsed.summary = parsed.summary || 'AI analysis completed';
        parsed.tableAssignments = parsed.tableAssignments || {};
        
        return { success: true, data: parsed };
      } catch (error) {
        console.log('Strategy failed:', error.message);
        continue;
      }
    }
    
    return { success: false, error: 'Failed to extract valid JSON from AI response' };
  } catch (error) {
    return { success: false, error: `JSON extraction failed: ${error.message}` };
  }
}

async function createIntelligentFallback(fileContent: any, fileName: string, fileType: string, schemaInfo: any, originalError: string): Promise<any> {
  console.log('Creating intelligent fallback analysis...');
  
  const fallbackResult = {
    dataType: 'mixed',
    confidence: 40,
    targetTables: [] as string[],
    fieldMappings: {} as Record<string, string>,
    tableAssignments: {} as Record<string, string[]>,
    dataQuality: {
      issues: [`AI analysis failed: ${originalError}`, 'Using fallback pattern matching'],
      warnings: ['Manual review recommended'],
      suggestions: ['Verify field mappings before import']
    },
    transformations: [],
    requiredFields: [],
    missingFields: [],
    suggestedDefaults: {},
    relationships: [],
    summary: 'Fallback analysis - manual review required'
  };
  
  try {
    // Extract column names from data
    let columns: string[] = [];
    
    if (Array.isArray(fileContent) && fileContent.length > 0) {
      columns = Object.keys(fileContent[0] || {});
    } else if (typeof fileContent === 'string') {
      const lines = fileContent.split('\n');
      if (lines.length > 0) {
        columns = lines[0].split(',').map(col => col.trim().replace(/"/g, ''));
      }
    }
    
    // Intelligent pattern matching
    const patterns = {
      properties: ['address', 'property', 'unit', 'account', 'balance', 'square'],
      homeowners: ['homeowner', 'owner', 'name', 'email', 'phone', 'mailing'],
      residents: ['resident', 'tenant', 'move', 'emergency', 'contact'],
      assessments: ['assessment', 'amount', 'due', 'payment', 'fee']
    };
    
    // Determine likely target tables
    const tableScores = {} as Record<string, number>;
    
    for (const [table, keywords] of Object.entries(patterns)) {
      tableScores[table] = 0;
      for (const column of columns) {
        const columnLower = column.toLowerCase();
        for (const keyword of keywords) {
          if (columnLower.includes(keyword)) {
            tableScores[table] += 1;
          }
        }
      }
    }
    
    // Select tables with highest scores
    const sortedTables = Object.entries(tableScores)
      .filter(([_, score]) => score > 0)
      .sort(([_, a], [__, b]) => b - a)
      .map(([table, _]) => table);
    
    fallbackResult.targetTables = sortedTables.slice(0, 2);
    
    // Create basic field mappings
    const availableFields = Object.values(schemaInfo.availableTables).flatMap((table: any) => table.columns);
    
    for (const column of columns) {
      const columnLower = column.toLowerCase().replace(/\s+/g, '_');
      
      // Direct match
      const exactMatch = availableFields.find((field: string) => field.toLowerCase() === columnLower);
      if (exactMatch) {
        fallbackResult.fieldMappings[column] = exactMatch;
        continue;
      }
      
      // Partial match
      const partialMatch = availableFields.find((field: string) => 
        field.toLowerCase().includes(columnLower) || columnLower.includes(field.toLowerCase())
      );
      if (partialMatch) {
        fallbackResult.fieldMappings[column] = partialMatch;
        continue;
      }
      
      // Common mappings
      const commonMappings = {
        'email': 'email',
        'phone': 'phone',
        'address': 'address',
        'name': 'full_homeowner_name',
        'balance': 'current_balance',
        'account': 'account_number',
        'unit': 'unit_number',
        'amount': 'amount'
      };
      
      for (const [pattern, target] of Object.entries(commonMappings)) {
        if (columnLower.includes(pattern) && availableFields.includes(target)) {
          fallbackResult.fieldMappings[column] = target;
          break;
        }
      }
    }
    
    // Create table assignments
    for (const table of fallbackResult.targetTables) {
      fallbackResult.tableAssignments[table] = [];
      const tableColumns = schemaInfo.availableTables[table]?.columns || [];
      
      for (const [sourceField, targetField] of Object.entries(fallbackResult.fieldMappings)) {
        if (tableColumns.includes(targetField)) {
          fallbackResult.tableAssignments[table].push(sourceField);
        }
      }
    }
    
    // Improve confidence based on matches
    const mappingCount = Object.keys(fallbackResult.fieldMappings).length;
    if (mappingCount > 0) {
      fallbackResult.confidence = Math.min(70, 40 + (mappingCount * 5));
    }
    
  } catch (error) {
    console.error('Fallback analysis error:', error);
    fallbackResult.dataQuality.issues.push(`Fallback analysis error: ${error.message}`);
  }
  
  return fallbackResult;
}

function validateAnalysisResult(result: any): string[] {
  const errors: string[] = [];
  
  if (!result.targetTables || !Array.isArray(result.targetTables) || result.targetTables.length === 0) {
    errors.push('No target tables specified');
  }
  
  if (!result.fieldMappings || typeof result.fieldMappings !== 'object' || Object.keys(result.fieldMappings).length === 0) {
    errors.push('No field mappings specified');
  }
  
  if (result.confidence < 30) {
    errors.push('Analysis confidence too low');
  }
  
  const validTables = ['properties', 'homeowners', 'residents', 'assessments'];
  const invalidTables = result.targetTables?.filter((table: string) => !validTables.includes(table)) || [];
  if (invalidTables.length > 0) {
    errors.push(`Invalid target tables: ${invalidTables.join(', ')}`);
  }
  
  return errors;
}