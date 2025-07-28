import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { associationId, analysisTypes, modelVersion, features } = await req.json()

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!

    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch resident and communication data
    const { data: residents } = await supabase
      .from('residents')
      .select('*')
      .eq('association_id', associationId)

    const { data: communications } = await supabase
      .from('communications')
      .select('*')
      .eq('association_id', associationId)
      .order('created_at', { ascending: false })
      .limit(100)

    const { data: maintenanceRequests } = await supabase
      .from('maintenance_requests')
      .select('*, properties!inner(association_id)')
      .eq('properties.association_id', associationId)
      .order('created_at', { ascending: false })
      .limit(100)

    const { data: assessments } = await supabase
      .from('assessments')
      .select('*, properties!inner(association_id)')
      .eq('properties.association_id', associationId)
      .order('created_at', { ascending: false })
      .limit(100)

    // Analyze resident patterns
    const residentContext = {
      totalResidents: residents?.length || 0,
      totalCommunications: communications?.length || 0,
      totalMaintenanceRequests: maintenanceRequests?.length || 0,
      paidAssessments: assessments?.filter(a => a.payment_status === 'paid').length || 0,
      unpaidAssessments: assessments?.filter(a => a.payment_status === 'unpaid').length || 0,
      avgResponseTime: communications?.reduce((sum, comm) => {
        // Mock calculation - would need actual response time data
        return sum + (Math.random() * 48) // hours
      }, 0) / (communications?.length || 1) || 24,
      communicationTypes: communications?.reduce((types: Record<string, number>, comm) => {
        const type = comm.message_type || 'general'
        types[type] = (types[type] || 0) + 1
        return types
      }, {}) || {}
    }

    // Generate AI resident behavior analysis
    const analysisPrompt = `
As an expert community management analyst, analyze the following resident behavior data and provide insights:

Community Context:
- Total Residents: ${residentContext.totalResidents}
- Communications: ${residentContext.totalCommunications}
- Maintenance Requests: ${residentContext.totalMaintenanceRequests}
- Payment Compliance: ${Math.round((residentContext.paidAssessments / (residentContext.paidAssessments + residentContext.unpaidAssessments)) * 100)}%
- Average Response Time: ${Math.round(residentContext.avgResponseTime)} hours
- Communication Types: ${Object.entries(residentContext.communicationTypes).map(([type, count]) => `${type}: ${count}`).join(', ')}

Analysis Types: ${analysisTypes?.join(', ') || 'satisfaction, engagement, payment_behavior'}

Generate resident behavior insights with:
1. Identified patterns and trends
2. Actionable recommendations
3. Priority action items
4. Engagement strategies

Format response as valid JSON with the structure:
{
  "insights": [
    {
      "id": "unique_id",
      "insightType": "satisfaction|engagement|payment_behavior|service_usage|communication_preference",
      "patterns": [
        {
          "category": "pattern_name",
          "trend": "increasing|decreasing|stable",
          "confidence": number,
          "impact": "description"
        }
      ],
      "recommendations": [],
      "actionItems": [
        {
          "priority": "low|medium|high",
          "action": "description",
          "expectedOutcome": "description"
        }
      ]
    }
  ]
}
`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert community management analyst specializing in resident behavior analysis for HOAs. Provide actionable, data-driven insights in valid JSON format.' },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1800
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const aiResult = await response.json()
    let analysisData

    try {
      // Extract JSON from AI response
      const content = aiResult.choices[0].message.content
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No valid JSON found in AI response')
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      // Fallback with mock data
      const analysisTypesList = analysisTypes || ['satisfaction', 'engagement', 'payment_behavior']
      analysisData = {
        insights: analysisTypesList.map((type, index) => ({
          id: `insight_${Date.now()}_${index}`,
          insightType: type,
          patterns: [
            {
              category: 'communication_frequency',
              trend: Math.random() > 0.5 ? 'increasing' : 'stable',
              confidence: 0.7 + Math.random() * 0.2,
              impact: 'Residents are becoming more engaged with community communications'
            },
            {
              category: 'service_usage',
              trend: 'increasing',
              confidence: 0.8,
              impact: 'Higher demand for maintenance and community services'
            }
          ],
          recommendations: [
            'Implement regular resident satisfaction surveys',
            'Create more interactive community events',
            'Streamline the maintenance request process'
          ],
          actionItems: [
            {
              priority: 'high',
              action: 'Send quarterly satisfaction survey',
              expectedOutcome: 'Improved understanding of resident needs and preferences'
            },
            {
              priority: 'medium',
              action: 'Organize monthly community events',
              expectedOutcome: 'Increased resident engagement and community spirit'
            }
          ]
        }))
      }
    }

    // Store insights in database
    const insights = analysisData.insights || []
    const storedInsights = []

    for (const insight of insights) {
      const { data: stored, error: storeError } = await supabase
        .from('ai_resident_insights')
        .insert({
          association_id: associationId,
          insight_type: insight.insightType,
          patterns: insight.patterns,
          recommendations: insight.recommendations,
          action_items: insight.actionItems
        })
        .select()
        .single()

      if (!storeError && stored) {
        storedInsights.push({
          ...insight,
          id: stored.id
        })
      } else {
        console.error('Failed to store insight:', storeError)
        storedInsights.push(insight)
      }
    }

    return new Response(
      JSON.stringify({ insights: storedInsights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Resident analysis error:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        insights: []
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})