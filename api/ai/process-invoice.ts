// Main AI invoice processing endpoint
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

interface ProcessInvoiceRequest {
  imageUrl: string;
  associationId: string;
  invoiceId?: string;
}

interface ProcessedInvoice {
  vendor_name: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  line_items: ProcessedLineItem[];
  confidence_score: number;
  raw_text: string;
}

interface ProcessedLineItem {
  description: string;
  amount: number;
  suggested_gl_account: string;
  suggested_category: string;
  confidence: number;
  property_assignment?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageUrl, associationId, invoiceId }: ProcessInvoiceRequest = req.body;

    if (!imageUrl || !associationId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    console.log('Processing invoice:', { imageUrl, associationId });

    // Add to processing queue
    const { data: queueEntry } = await supabase
      .from('ai_processing_queue')
      .insert({
        invoice_id: invoiceId,
        association_id: associationId,
        image_url: imageUrl,
        status: 'processing',
        processing_started_at: new Date().toISOString()
      })
      .select()
      .single();

    try {
      // Process the invoice with AI
      const processedInvoice = await processInvoiceWithAI(imageUrl, associationId);
      
      // Update processing queue
      await supabase
        .from('ai_processing_queue')
        .update({
          status: 'completed',
          processing_completed_at: new Date().toISOString()
        })
        .eq('id', queueEntry.id);

      // Save processing results for audit
      await supabase
        .from('ai_processing_results')
        .insert({
          invoice_id: invoiceId,
          raw_text_extracted: processedInvoice.raw_text,
          structured_data: processedInvoice,
          confidence_scores: {
            overall: processedInvoice.confidence_score,
            line_items: processedInvoice.line_items.map(item => ({
              description: item.description,
              confidence: item.confidence
            }))
          },
          processing_time_ms: Date.now() - new Date(queueEntry.processing_started_at!).getTime(),
          model_version: 'gpt-4o-mini'
        });

      res.status(200).json(processedInvoice);

    } catch (processingError) {
      console.error('Processing error:', processingError);
      
      // Update processing queue with error
      await supabase
        .from('ai_processing_queue')
        .update({
          status: 'failed',
          error_message: (processingError as Error).message,
          processing_completed_at: new Date().toISOString()
        })
        .eq('id', queueEntry.id);

      throw processingError;
    }

  } catch (error) {
    console.error('Invoice processing error:', error);
    res.status(500).json({ 
      error: 'Failed to process invoice',
      details: (error as Error).message 
    });
  }
}

async function processInvoiceWithAI(imageUrl: string, associationId: string): Promise<ProcessedInvoice> {
  console.log('Starting AI processing for:', imageUrl);
  
  // Step 1: Extract text from image using OpenAI Vision
  const rawText = await extractTextFromImage(imageUrl);
  console.log('Text extracted, length:', rawText.length);
  
  // Step 2: Parse invoice structure
  const parsedData = await parseInvoiceStructure(rawText);
  console.log('Invoice parsed:', parsedData.vendor_name);
  
  // Step 3: Load association context (GL accounts, etc.)
  const context = await loadAssociationContext(associationId);
  console.log('Context loaded, GL accounts:', context.glAccounts.length);
  
  // Step 4: Classify and suggest GL accounts
  const classifiedItems = await classifyLineItems(parsedData.line_items || [], context);
  console.log('Line items classified:', classifiedItems.length);
  
  // Step 5: Calculate confidence score
  const confidenceScore = calculateOverallConfidence(parsedData, classifiedItems);
  console.log('Confidence score:', confidenceScore);
  
  return {
    vendor_name: parsedData.vendor_name || '',
    invoice_number: parsedData.invoice_number || '',
    invoice_date: parsedData.invoice_date || '',
    due_date: parsedData.due_date || '',
    total_amount: parsedData.total_amount || 0,
    line_items: classifiedItems,
    confidence_score: confidenceScore,
    raw_text: rawText
  };
}

async function extractTextFromImage(imageUrl: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Extract all text from this invoice image. Preserve formatting and structure. 
              Include all vendor information, dates, amounts, line items, and any other text visible.
              Be thorough and accurate - this will be used for automated processing.`
            },
            {
              type: "image_url",
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      max_tokens: 2000
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to extract text from image');
  }
}

async function parseInvoiceStructure(rawText: string): Promise<Partial<ProcessedInvoice>> {
  const systemPrompt = `You are an expert at parsing invoices for property management companies.
  Extract structured data from invoice text with high accuracy.
  
  Focus on these common expense types:
  - Utilities (water, electric, gas, internet, cable)
  - Maintenance (plumbing, electrical, HVAC, general repairs)
  - Landscaping (lawn care, tree service, irrigation)
  - Professional Services (legal, accounting, management, consulting)
  - Insurance (property, liability, workers comp)
  - Supplies (office, cleaning, maintenance materials)
  - Security services
  - Trash/recycling services
  
  Return JSON with exact structure:
  {
    "vendor_name": "string",
    "vendor_address": "string",
    "invoice_number": "string", 
    "invoice_date": "YYYY-MM-DD",
    "due_date": "YYYY-MM-DD",
    "total_amount": number,
    "line_items": [
      {
        "description": "string",
        "quantity": number,
        "unit_price": number, 
        "amount": number
      }
    ]
  }`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Parse this invoice text:\n\n${rawText}` }
      ],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Parsing error:', error);
    throw new Error('Failed to parse invoice structure');
  }
}

async function loadAssociationContext(associationId: string) {
  try {
    // Load GL accounts
    const { data: glAccounts } = await supabase
      .from('gl_accounts')
      .select('*')
      .eq('association_id', associationId)
      .eq('is_active', true);

    // Load vendor patterns
    const { data: vendorPatterns } = await supabase
      .from('ai_vendor_patterns')
      .select('*')
      .eq('association_id', associationId);

    return {
      glAccounts: glAccounts || [],
      vendorPatterns: vendorPatterns || []
    };
  } catch (error) {
    console.error('Context loading error:', error);
    return { glAccounts: [], vendorPatterns: [] };
  }
}

async function classifyLineItems(lineItems: any[], context: any): Promise<ProcessedLineItem[]> {
  if (!lineItems || lineItems.length === 0) {
    return [];
  }

  const glAccountsList = context.glAccounts.map((acc: any) => 
    `${acc.account_code}: ${acc.account_name} (${acc.category || 'General'})`
  ).join('\n');

  const systemPrompt = `You are an expert property management accountant specializing in HOA/Condo expenses.
  
  Classify each line item and assign the most appropriate GL account from the list.
  
  Available GL Accounts:
  ${glAccountsList}
  
  Common Property Management Expense Categories:
  - 6100-6199: Utilities (Electric, Water, Gas, Internet, Cable)
  - 6200-6299: Maintenance & Repairs (Plumbing, HVAC, Electrical, General)
  - 6300-6399: Landscaping & Grounds (Lawn, Trees, Irrigation)
  - 6400-6499: Professional Services (Legal, Accounting, Management)
  - 6500-6599: Insurance (Property, Liability, D&O)
  - 6600-6699: Administrative (Office, Bank fees, Postage)
  - 7000-7999: Capital Improvements & Reserves
  
  For each line item, determine:
  1. Most appropriate GL account code from the provided list
  2. Expense category
  3. Confidence level (0.1 to 1.0)
  
  Return JSON array:
  {
    "classified_items": [
      {
        "description": "original description",
        "amount": number,
        "suggested_gl_account": "account_code",
        "suggested_category": "category_name", 
        "confidence": 0.95
      }
    ]
  }`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: `Classify these line items:\n${JSON.stringify(lineItems, null, 2)}`
        }
      ],
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content || '{"classified_items": []}');
    return result.classified_items || [];
  } catch (error) {
    console.error('Classification error:', error);
    return lineItems.map(item => ({
      description: item.description || '',
      amount: item.amount || 0,
      suggested_gl_account: '',
      suggested_category: 'Unknown',
      confidence: 0.5
    }));
  }
}

function calculateOverallConfidence(invoiceData: any, lineItems: ProcessedLineItem[]): number {
  const weights = {
    vendor_clarity: 0.15,
    invoice_details: 0.15, 
    amount_consistency: 0.20,
    line_item_confidence: 0.50
  };

  let score = 0;

  // Vendor name clarity
  if (invoiceData.vendor_name && invoiceData.vendor_name.length > 3) {
    score += weights.vendor_clarity;
  }

  // Invoice details completeness
  const detailScore = [
    invoiceData.invoice_number,
    invoiceData.invoice_date,
    invoiceData.total_amount > 0
  ].filter(Boolean).length / 3;
  score += weights.invoice_details * detailScore;

  // Amount consistency
  const lineItemTotal = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalAmount = invoiceData.total_amount || 0;
  if (totalAmount > 0) {
    const consistency = 1 - Math.min(Math.abs(lineItemTotal - totalAmount) / totalAmount, 1);
    score += weights.amount_consistency * consistency;
  }

  // Average line item confidence
  const avgLineItemConfidence = lineItems.length > 0 
    ? lineItems.reduce((sum, item) => sum + (item.confidence || 0), 0) / lineItems.length
    : 0;
  score += weights.line_item_confidence * avgLineItemConfidence;

  return Math.min(Math.max(score, 0), 1); // Clamp between 0 and 1
}
