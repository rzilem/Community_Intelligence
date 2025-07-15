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

      File: ${fileName} (${fileType})
      User Description: ${userDescription || 'No description provided'}
      
      Data Preview (first 500 characters):
      ${typeof fileContent === 'string' ? fileContent.substring(0, 500) : JSON.stringify(fileContent).substring(0, 500)}

      AVAILABLE DATABASE SCHEMA:
      ${JSON.stringify(schemaInfo.availableTables, null, 2)}

      CRITICAL REQUIREMENTS:
      1. Only suggest field mappings to columns that exist in the available schema above
      2. Use "current_balance" not "account_balance" for balance fields
      3. Only suggest target tables that exist: properties, homeowners, residents, assessments
      4. Map homeowner names to "full_homeowner_name" or "first_name"/"last_name" fields
      5. Map addresses to "address" field in properties table
      6. Map account numbers to "account_number" field

      Analyze and identify:
      1. Data type (properties, residents, financial, maintenance, compliance, etc.)
      2. Which of the available tables best fit this data
      3. Field mappings using ONLY the column names from the schema above
      4. Data quality issues
      5. Required transformations
      6. Confidence level (0-100%)
      7. Missing required fields
      8. Suggested default values
      9. Data relationships

      Return a JSON response with this structure:
      {
        "dataType": "properties|residents|financial|maintenance|compliance|mixed",
        "confidence": 95,
        "targetTables": ["properties", "homeowners"],
        "fieldMappings": {
          "Address": "address",
          "Homeowner": "full_homeowner_name",
          "Balance": "current_balance"
        },
        "dataQuality": {
          "issues": ["Missing phone numbers in 3 rows"],
          "warnings": ["Inconsistent date formats"],
          "suggestions": ["Standardize phone format"]
        },
        "transformations": [
          {
            "field": "phone",
            "action": "format",
            "description": "Standardize phone numbers"
          }
        ],
        "requiredFields": ["address", "association_id"],
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
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: 'You are an expert data analyst for HOA management systems. Always respond with valid JSON matching the exact structure requested.' },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.2,
        max_tokens: 2000,
      }),
    });

    const aiData = await aiResponse.json();
    let analysisResult;
    
    try {
      analysisResult = JSON.parse(aiData.choices[0].message.content);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      analysisResult = {
        dataType: 'unknown',
        confidence: 50,
        targetTables: [],
        fieldMappings: {},
        dataQuality: { issues: ['Unable to analyze data structure'], warnings: [], suggestions: [] },
        transformations: [],
        requiredFields: [],
        missingFields: [],
        suggestedDefaults: {},
        relationships: [],
        summary: 'AI analysis failed, manual review required'
      };
    }

    console.log('AI Analysis Result:', analysisResult);

    // Step 3: Validate field mappings against database schema
    console.log('Step 3: Validating field mappings against database schema...');
    const validationResult = {
      validMappings: {},
      invalidMappings: {},
      suggestions: []
    };

    // Validate each field mapping
    for (const [sourceField, targetField] of Object.entries(analysisResult.fieldMappings || {})) {
      let isValid = false;
      let validTable = null;
      
      // Check if target field exists in any of the suggested tables
      for (const tableName of analysisResult.targetTables || []) {
        if (schemaInfo.availableTables[tableName]?.columns.includes(targetField)) {
          isValid = true;
          validTable = tableName;
          break;
        }
      }
      
      if (isValid) {
        validationResult.validMappings[sourceField] = {
          targetField,
          table: validTable
        };
      } else {
        validationResult.invalidMappings[sourceField] = {
          targetField,
          reason: `Field '${targetField}' does not exist in any of the target tables`
        };
        
        // Try to suggest a similar field
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

    // Update analysis result with validation info
    analysisResult.validation = validationResult;
    analysisResult.isValid = Object.keys(validationResult.invalidMappings).length === 0;

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
    const importPreview = {
      analysisResult,
      association: associations,
      estimatedRecords: Array.isArray(fileContent) ? fileContent.length : 
                        typeof fileContent === 'string' ? fileContent.split('\n').length - 1 : 0,
      readyToImport: analysisResult.confidence > 70 && 
                     analysisResult.missingFields.length === 0 && 
                     analysisResult.isValid,
      humanReviewRequired: analysisResult.confidence < 90 || 
                           analysisResult.dataQuality.issues.length > 0 || 
                           !analysisResult.isValid,
      processingTime: new Date().toISOString()
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