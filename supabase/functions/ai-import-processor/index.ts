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

    // Step 2: Analyze file content with AI
    console.log('Step 2: Analyzing file content with AI...');
    const analysisPrompt = `
      You are an AI data analyst for a property management system. Analyze this data and provide a comprehensive import plan.

      CRITICAL: Return ONLY valid JSON without any markdown formatting, code blocks, or explanatory text.
      
      File: ${fileName} (${fileType})
      User Description: ${userDescription || 'No description provided'}
      
      Data Preview (first 1000 characters):
      ${typeof fileContent === 'string' ? fileContent.substring(0, 1000) : JSON.stringify(fileContent).substring(0, 1000)}

      AVAILABLE DATABASE SCHEMA:
      ${JSON.stringify(schemaInfo.availableTables, null, 2)}

      CRITICAL FIELD ASSIGNMENT RULES:
      1. HOMEOWNER FIELDS go to 'homeowners' table:
         - Email, All Emails → 'email' or 'all_emails'
         - Phone, All Phones → 'phone' or 'all_phones'
         - Homeowner Name, Full Name → 'full_homeowner_name'
         - First Name, Last Name → 'first_name', 'last_name'
         - Mailing Address → 'mailing_address'
         - ACH Start Date → 'ach_start_date'
         - Last Payment Date → 'last_payment_date'
         - Last Payment Amount → 'last_payment_amount'
         - Collection Status → 'collection_status'
         - Tags → 'tags'
         - Current Balance (homeowner) → 'current_balance'

      2. PROPERTY FIELDS go to 'properties' table:
         - Property Address, Address → 'address'
         - Account Number, Account # → 'account_number'
         - Unit Number → 'unit_number'
         - Square Footage → 'square_footage'
         - Property Type → 'property_type'
         - Current Balance (property) → 'current_balance'

      3. RESIDENT FIELDS go to 'residents' table:
         - Emergency Contact → 'emergency_contact'
         - Move In Date → 'move_in_date'
         - Move Out Date → 'move_out_date'

       4. GENERAL REQUIREMENTS:
          - Use "current_balance" not "account_balance" for balance fields
          - Only suggest target tables that exist: properties, homeowners, residents, assessments
          - Map account numbers to "account_number" field
          - Include association_id only for tables that need it (properties, residents, assessments)
          - homeowners table does NOT have association_id field

      5. MULTI-TABLE DATA HANDLING:
         - If data contains both homeowner and property info, use BOTH tables
         - Create relationships between tables using account_number
         - Distribute fields logically based on their semantic meaning

      RESPONSE FORMAT: Return ONLY the JSON object below with actual analysis results. NO markdown, NO code blocks, NO explanatory text:

      {
        "dataType": "properties|residents|financial|maintenance|compliance|mixed",
        "confidence": 95,
        "targetTables": ["properties", "homeowners"],
        "fieldMappings": {
          "Email": "email",
          "Property Address": "address",
          "Homeowner": "full_homeowner_name",
          "Balance": "current_balance",
          "ACH Start Date": "ach_start_date"
        },
        "tableAssignments": {
          "properties": ["Property Address", "Account #", "Balance"],
          "homeowners": ["Email", "Homeowner", "ACH Start Date", "Last Payment Date"]
        },
        "dataQuality": {
          "issues": ["Missing phone numbers in 3 rows"],
          "warnings": ["Inconsistent date formats"],
          "suggestions": ["Standardize phone format"]
        },
        "transformations": [
          {
            "field": "phone",
            "action": "format_phone",
            "description": "Standardize phone numbers"
          }
        ],
        "requiredFields": ["address"],
        "missingFields": [],
        "suggestedDefaults": {
          "property_type": "residential",
          "status": "active"
        },
        "relationships": [
          {
            "type": "property_to_homeowner",
            "description": "Link homeowners to properties via account_number"
          }
        ],
        "summary": "High-quality property data with minor formatting issues"
      }
    `;

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert data analyst for HOA management systems. CRITICAL: Always respond with ONLY valid JSON matching the exact structure requested. Never include markdown formatting, code blocks, or explanatory text. Return only the JSON object.' },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.1,
        max_tokens: 3000,
      }),
    });

    const aiData = await aiResponse.json();
    let analysisResult;
    
    try {
      let responseContent = aiData.choices[0].message.content;
      console.log('Raw AI response:', responseContent);
      
      // Strip markdown formatting if present
      responseContent = responseContent.replace(/```json\s*|\s*```/g, '').trim();
      
      // Remove any leading/trailing non-JSON content
      const jsonStart = responseContent.indexOf('{');
      const jsonEnd = responseContent.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        responseContent = responseContent.substring(jsonStart, jsonEnd + 1);
      }
      
      console.log('Cleaned AI response:', responseContent);
      analysisResult = JSON.parse(responseContent);
      
      // Validate required fields
      if (!analysisResult.targetTables || !Array.isArray(analysisResult.targetTables)) {
        throw new Error('Missing or invalid targetTables field');
      }
      
      if (!analysisResult.fieldMappings || typeof analysisResult.fieldMappings !== 'object') {
        throw new Error('Missing or invalid fieldMappings field');
      }
      
      // Ensure all required fields have defaults
      analysisResult.dataType = analysisResult.dataType || 'unknown';
      analysisResult.confidence = analysisResult.confidence || 50;
      analysisResult.dataQuality = analysisResult.dataQuality || { issues: [], warnings: [], suggestions: [] };
      analysisResult.transformations = analysisResult.transformations || [];
      analysisResult.requiredFields = analysisResult.requiredFields || [];
      analysisResult.missingFields = analysisResult.missingFields || [];
      analysisResult.suggestedDefaults = analysisResult.suggestedDefaults || {};
      analysisResult.relationships = analysisResult.relationships || [];
      analysisResult.summary = analysisResult.summary || 'AI analysis completed';
      
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Original response:', aiData.choices[0].message.content);
      
      // Enhanced fallback with better error details
      analysisResult = {
        dataType: 'unknown',
        confidence: 30,
        targetTables: [],
        fieldMappings: {},
        tableAssignments: {},
        dataQuality: { 
          issues: [`AI analysis failed: ${parseError.message}`, 'Unable to analyze data structure'], 
          warnings: ['Manual review required'], 
          suggestions: ['Try uploading a different file format or provide more sample data'] 
        },
        transformations: [],
        requiredFields: [],
        missingFields: [],
        suggestedDefaults: {},
        relationships: [],
        summary: 'AI analysis failed, manual review required'
      };
    }

    console.log('AI Analysis Result:', analysisResult);

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