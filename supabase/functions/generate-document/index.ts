
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import PDFDocument from 'https://esm.sh/pdfkit'
import { Buffer } from "https://deno.land/std@0.168.0/node/buffer.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: { persistSession: false }
      }
    )

    const { submissionId, templateId } = await req.json()

    // Get submission data
    const { data: submission, error: submissionError } = await supabaseClient
      .from('form_submissions')
      .select('*')
      .eq('id', submissionId)
      .single()

    if (submissionError) throw submissionError

    // Get template
    const { data: template, error: templateError } = await supabaseClient
      .from('document_templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (templateError) throw templateError

    // Generate PDF
    const doc = new PDFDocument()
    const chunks: Uint8Array[] = []

    doc.on('data', (chunk) => chunks.push(chunk))

    // Simple template rendering - in a real app you'd want more sophisticated templating
    const content = template.template_content.replace(
      /\{\{([^}]+)\}\}/g,
      (match, key) => submission.form_data[key.trim()] || ''
    )

    doc.text(content)
    doc.end()

    const pdfBuffer = Buffer.concat(chunks)

    // Upload to storage
    const fileName = `${submissionId}-${Date.now()}.pdf`
    const { data: upload, error: uploadError } = await supabaseClient.storage
      .from('generated-documents')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600'
      })

    if (uploadError) throw uploadError

    // Create generated document record
    const { data: generatedDoc, error: generatedError } = await supabaseClient
      .from('generated_documents')
      .insert({
        form_submission_id: submissionId,
        document_template_id: templateId,
        file_url: upload.path,
        file_size: pdfBuffer.length,
        status: 'completed'
      })
      .select()
      .single()

    if (generatedError) throw generatedError

    return new Response(
      JSON.stringify(generatedDoc),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
