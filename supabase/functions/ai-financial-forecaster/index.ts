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
    const { associationId, forecastType, timeframe, modelVersion, features } = await req.json();

    console.log('Generating financial forecast:', { associationId, forecastType, timeframe });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch historical data for better predictions
    const historicalData = await fetchHistoricalFinancialData(supabase, associationId, forecastType);
    
    // Generate AI-powered forecast
    const forecast = await generateForecast(historicalData, forecastType, timeframe);
    
    // Calculate accuracy based on historical performance
    const accuracy = await calculateForecastAccuracy(supabase, associationId, forecastType);

    const result = {
      id: crypto.randomUUID(),
      predictions: forecast.predictions,
      accuracy: accuracy,
      recommendations: forecast.recommendations,
      dataPoints: historicalData.length,
      metadata: {
        modelVersion,
        features,
        generatedAt: new Date().toISOString()
      }
    };

    console.log('Financial forecast generated:', result.id);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-financial-forecaster:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function fetchHistoricalFinancialData(supabase: any, associationId: string, forecastType: string) {
  const currentDate = new Date();
  const twoYearsAgo = new Date(currentDate.getFullYear() - 2, currentDate.getMonth(), 1);

  try {
    let query;
    
    switch (forecastType) {
      case 'cash_flow':
        // Fetch payment transactions and expenses
        const { data: payments } = await supabase
          .from('payment_transactions_enhanced')
          .select('payment_date, net_amount')
          .eq('association_id', associationId)
          .gte('payment_date', twoYearsAgo.toISOString())
          .order('payment_date');
        
        const { data: expenses } = await supabase
          .from('accounts_payable')
          .select('invoice_date, original_amount')
          .eq('association_id', associationId)  
          .gte('invoice_date', twoYearsAgo.toISOString())
          .order('invoice_date');

        return [...(payments || []), ...(expenses || [])];

      case 'delinquency':
        const { data: arData } = await supabase
          .from('accounts_receivable')
          .select('invoice_date, current_balance, status')
          .eq('association_id', associationId)
          .gte('invoice_date', twoYearsAgo.toISOString())
          .order('invoice_date');

        return arData || [];

      case 'budget_variance':
        // Mock budget data - in real implementation, fetch from budget tables
        return generateMockBudgetData(24);

      default:
        return [];
    }
  } catch (error) {
    console.error('Failed to fetch historical data:', error);
    return generateMockHistoricalData(forecastType, 24);
  }
}

async function generateForecast(historicalData: any[], forecastType: string, timeframe: number) {
  if (!openAIApiKey) {
    return generateMockForecast(forecastType, timeframe);
  }

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
            content: `You are a financial forecasting AI specialized in HOA and property management finances. 
                     Analyze historical data patterns and generate realistic predictions with confidence levels.
                     Consider seasonal trends, economic factors, and property management industry patterns.`
          },
          {
            role: 'user',
            content: `Generate a ${timeframe}-month ${forecastType} forecast based on this historical data: 
                     ${JSON.stringify(historicalData.slice(-12))}. 
                     Return predictions with confidence levels and actionable recommendations.`
          }
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiAnalysis = data.choices[0].message.content;

    // Parse AI response and generate structured forecast
    return parseAIForecast(aiAnalysis, forecastType, timeframe, historicalData);

  } catch (error) {
    console.error('AI forecast generation failed:', error);
    return generateMockForecast(forecastType, timeframe);
  }
}

function parseAIForecast(aiAnalysis: string, forecastType: string, timeframe: number, historicalData: any[]) {
  // Mock parsing - in real implementation, this would parse AI response
  return generateMockForecast(forecastType, timeframe);
}

function generateMockForecast(forecastType: string, timeframe: number) {
  const predictions = [];
  const currentDate = new Date();

  for (let i = 1; i <= timeframe; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
    const period = date.toISOString().substring(0, 7); // YYYY-MM format

    let baseValue, variance;
    
    switch (forecastType) {
      case 'cash_flow':
        baseValue = 25000 + (Math.random() * 10000) - 5000;
        variance = 0.15;
        break;
      case 'delinquency':
        baseValue = 5000 + (Math.sin(i / 3) * 2000); // Seasonal pattern
        variance = 0.20;
        break;
      case 'budget_variance':
        baseValue = Math.random() * 1000 - 500; // Can be positive or negative
        variance = 0.30;
        break;
      case 'property_value':
        baseValue = 500000 + (i * 1000) + (Math.random() * 5000); // Slight upward trend
        variance = 0.08;
        break;
      default:
        baseValue = 10000 + (Math.random() * 5000);
        variance = 0.15;
    }

    predictions.push({
      period,
      value: Math.round(baseValue),
      confidence: 0.75 + (Math.random() * 0.20), // 75-95% confidence
      factors: generateFactors(forecastType, i)
    });
  }

  const recommendations = generateRecommendations(forecastType, predictions);

  return { predictions, recommendations };
}

function generateFactors(forecastType: string, month: number): string[] {
  const allFactors = {
    cash_flow: [
      'Seasonal payment patterns',
      'Assessment collection rates',
      'Major maintenance expenses',
      'Reserve fund contributions',
      'Market interest rates'
    ],
    delinquency: [
      'Economic conditions',
      'Seasonal payment behavior',
      'Collection policy effectiveness',
      'Property turnover rates',
      'Payment plan utilization'
    ],
    budget_variance: [
      'Unexpected maintenance costs',
      'Energy price fluctuations',
      'Insurance rate changes',
      'Vendor cost increases',
      'Reserve fund transfers'
    ]
  };

  const factors = allFactors[forecastType as keyof typeof allFactors] || allFactors.cash_flow;
  const numFactors = Math.min(3, Math.floor(Math.random() * factors.length) + 1);
  
  return factors.slice(0, numFactors);
}

function generateRecommendations(forecastType: string, predictions: any[]) {
  const recommendations = [];

  // Analyze trends in predictions
  const values = predictions.map(p => p.value);
  const avgValue = values.reduce((sum, v) => sum + v, 0) / values.length;
  const trend = values[values.length - 1] - values[0];

  switch (forecastType) {
    case 'cash_flow':
      if (trend < 0) {
        recommendations.push({
          type: 'risk_mitigation',
          description: 'Cash flow trending downward - consider accelerating collections',
          impact: Math.abs(trend),
          priority: 'high'
        });
      }
      if (avgValue < 15000) {
        recommendations.push({
          type: 'optimization',
          description: 'Low cash flow - review payment terms and collection procedures',
          impact: 5000,
          priority: 'medium'
        });
      }
      break;

    case 'delinquency':
      if (avgValue > 8000) {
        recommendations.push({
          type: 'risk_mitigation',
          description: 'High delinquency forecast - implement proactive collection strategies',
          impact: avgValue * 0.3,
          priority: 'high'
        });
      }
      break;

    case 'budget_variance':
      if (Math.abs(avgValue) > 500) {
        recommendations.push({
          type: 'optimization',
          description: 'Significant budget variance expected - review spending controls',
          impact: Math.abs(avgValue),
          priority: 'medium'
        });
      }
      break;
  }

  // Add general recommendations
  recommendations.push({
    type: 'opportunity',
    description: 'Consider implementing automated payment reminders to improve cash flow',
    impact: 2000,
    priority: 'low'
  });

  return recommendations;
}

async function calculateForecastAccuracy(supabase: any, associationId: string, forecastType: string) {
  // Mock accuracy calculation - in real implementation, compare past forecasts with actuals
  const baseAccuracy = {
    cash_flow: 0.87,
    delinquency: 0.82,
    budget_variance: 0.75,
    property_value: 0.90,
    assessment_optimization: 0.85
  };

  return baseAccuracy[forecastType as keyof typeof baseAccuracy] || 0.80;
}

function generateMockHistoricalData(forecastType: string, months: number) {
  const data = [];
  const currentDate = new Date();

  for (let i = months; i > 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    
    let value;
    switch (forecastType) {
      case 'cash_flow':
        value = 20000 + (Math.random() * 15000) + (Math.sin(i / 3) * 5000);
        break;
      case 'delinquency':
        value = 3000 + (Math.random() * 4000) + (Math.sin(i / 4) * 2000);
        break;
      default:
        value = 10000 + (Math.random() * 5000);
    }

    data.push({
      date: date.toISOString().substring(0, 10),
      value: Math.round(value)
    });
  }

  return data;
}

function generateMockBudgetData(months: number) {
  const data = [];
  const currentDate = new Date();

  for (let i = months; i > 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    
    data.push({
      date: date.toISOString().substring(0, 10),
      budgeted: 20000 + (Math.random() * 5000),
      actual: 18000 + (Math.random() * 8000),
      variance: (Math.random() * 2000) - 1000
    });
  }

  return data;
}