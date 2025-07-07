import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileUrl, documentType, associationId, features } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Processing document:', { fileUrl, documentType, associationId });

    // Simulate OCR and document processing
    const ocrResult = await performOCR(fileUrl);
    const nlpAnalysis = await performNLPAnalysis(ocrResult.text, documentType);
    const riskAssessment = await assessRisk(nlpAnalysis, documentType);
    const complianceCheck = await checkCompliance(nlpAnalysis, documentType);

    const result = {
      id: crypto.randomUUID(),
      extractedData: nlpAnalysis.extractedData,
      confidence: nlpAnalysis.confidence,
      language: ocrResult.language,
      pageCount: ocrResult.pageCount,
      ocrAccuracy: ocrResult.accuracy,
      riskAssessment,
      complianceCheck
    };

    console.log('Document processing completed:', result.id);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-document-processor:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function performOCR(fileUrl: string) {
  // Simulate OCR processing with realistic results
  const mockResults = [
    { text: "PROPERTY MAINTENANCE AGREEMENT\n\nThis agreement is entered into between...", language: "en", pageCount: 3, accuracy: 0.95 },
    { text: "INVOICE #12345\nDate: 2024-01-15\nAmount: $2,500.00...", language: "en", pageCount: 1, accuracy: 0.98 },
    { text: "HOA COMPLIANCE REPORT\nProperty Address: 123 Main St...", language: "en", pageCount: 2, accuracy: 0.92 }
  ];
  
  return mockResults[Math.floor(Math.random() * mockResults.length)];
}

async function performNLPAnalysis(text: string, documentType: string) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI document analyzer specialized in HOA and property management documents. 
                     Extract key information from ${documentType} documents and return structured data.
                     Focus on dates, amounts, parties involved, key terms, and important clauses.`
          },
          {
            role: 'user',
            content: `Analyze this ${documentType} document and extract key information: ${text.substring(0, 1000)}`
          }
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    // Parse the analysis into structured data
    const extractedData = parseAnalysisResults(analysis, documentType);
    const confidence = calculateConfidence(extractedData, text);

    return { extractedData, confidence };
  } catch (error) {
    console.error('NLP analysis failed:', error);
    return {
      extractedData: generateMockExtractedData(documentType),
      confidence: 0.75
    };
  }
}

function parseAnalysisResults(analysis: string, documentType: string) {
  // Mock parsing - in real implementation, this would parse AI response
  const mockData = {
    contract: {
      parties: ["ABC Property Management", "XYZ HOA"],
      effectiveDate: "2024-01-01",
      expirationDate: "2024-12-31",
      totalValue: 45000,
      keyTerms: ["monthly maintenance", "emergency response", "landscaping"]
    },
    invoice: {
      invoiceNumber: "INV-2024-001",
      vendor: "Green Landscaping LLC",
      amount: 2500,
      dueDate: "2024-02-15",
      services: ["lawn maintenance", "tree trimming"]
    },
    compliance: {
      propertyAddress: "123 Main Street",
      inspectionDate: "2024-01-10",
      violations: [],
      complianceStatus: "compliant",
      nextInspection: "2024-07-10"
    }
  };

  return mockData[documentType as keyof typeof mockData] || {};
}

function generateMockExtractedData(documentType: string) {
  const mockData = {
    contract: { contractType: "maintenance", duration: "12 months", value: 25000 },
    invoice: { amount: 1500, vendor: "ABC Services", dueDate: "2024-02-01" },
    compliance: { status: "pending", violations: 0, nextReview: "2024-03-01" },
    maintenance: { workOrder: "WO-2024-001", priority: "medium", estimatedCost: 800 },
    legal: { documentType: "policy", effectiveDate: "2024-01-01", reviewRequired: true },
    financial: { reportType: "budget", period: "Q1 2024", totalAmount: 150000 }
  };

  return mockData[documentType as keyof typeof mockData] || {};
}

function calculateConfidence(extractedData: any, text: string): number {
  // Simple confidence calculation based on data completeness
  const dataKeys = Object.keys(extractedData);
  const textLength = text.length;
  
  let confidence = 0.5; // Base confidence
  
  if (dataKeys.length > 3) confidence += 0.2;
  if (textLength > 500) confidence += 0.1;
  if (textLength > 1000) confidence += 0.1;
  
  return Math.min(confidence, 0.95);
}

async function assessRisk(analysis: any, documentType: string) {
  const riskFactors = [];
  let riskLevel: 'low' | 'medium' | 'high' = 'low';

  // Mock risk assessment logic
  if (documentType === 'contract') {
    if (analysis.extractedData?.totalValue > 50000) {
      riskFactors.push('High contract value requires board approval');
      riskLevel = 'medium';
    }
    if (!analysis.extractedData?.expirationDate) {
      riskFactors.push('No clear expiration date specified');
      riskLevel = 'high';
    }
  }

  if (documentType === 'legal') {
    riskFactors.push('Legal document requires attorney review');
    riskLevel = 'medium';
  }

  return {
    level: riskLevel,
    factors: riskFactors,
    recommendations: [
      'Review with appropriate stakeholders',
      'Ensure all terms are clearly defined',
      'Verify compliance with HOA policies'
    ]
  };
}

async function checkCompliance(analysis: any, documentType: string) {
  // Mock compliance checking
  const violations = [];
  let isCompliant = true;

  if (documentType === 'contract' && analysis.extractedData?.totalValue > 25000) {
    if (!analysis.extractedData?.boardApproval) {
      violations.push('Contracts over $25,000 require board approval');
      isCompliant = false;
    }
  }

  return {
    isCompliant,
    violations,
    requiredActions: violations.map(v => `Address: ${v}`)
  };
}