
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResendEmailPayload {
  from: string;
  to: string[];
  subject: string;
  html: string;
  headers?: Record<string, string>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { campaignId } = await req.json();
    
    if (!campaignId) {
      return new Response(
        JSON.stringify({ error: 'Campaign ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      return new Response(
        JSON.stringify({ error: 'Campaign not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Get campaign recipients
    const { data: recipients, error: recipientsError } = await supabase
      .from('campaign_recipients')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('status', 'pending');

    if (recipientsError) {
      throw recipientsError;
    }

    if (!recipients || recipients.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No pending recipients found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get Resend API key
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'Resend API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Update campaign status to sending
    await supabase
      .from('email_campaigns')
      .update({ status: 'sending' })
      .eq('id', campaignId);

    // Send emails in batches
    const batchSize = 50;
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      for (const recipient of batch) {
        try {
          // Prepare email content with personalization
          const personalizedSubject = campaign.subject.replace(/\{\{(\w+)\}\}/g, (match: string, key: string) => {
            // Replace merge tags with actual data
            const replacements: Record<string, string> = {
              firstName: recipient.metadata?.firstName || 'Valued Customer',
              lastName: recipient.metadata?.lastName || '',
              email: recipient.email,
              companyName: recipient.metadata?.companyName || 'Your Company'
            };
            return replacements[key] || match;
          });

          const personalizedBody = campaign.body.replace(/\{\{(\w+)\}\}/g, (match: string, key: string) => {
            const replacements: Record<string, string> = {
              firstName: recipient.metadata?.firstName || 'Valued Customer',
              lastName: recipient.metadata?.lastName || '',
              email: recipient.email,
              companyName: recipient.metadata?.companyName || 'Your Company'
            };
            return replacements[key] || match;
          });

          // Add tracking pixels and unsubscribe links
          const trackingPixel = `<img src="${supabaseUrl}/functions/v1/track-email-open?campaign=${campaignId}&recipient=${recipient.id}" width="1" height="1" style="display:none;" />`;
          const unsubscribeLink = `<p style="text-align: center; font-size: 12px; color: #666;"><a href="${supabaseUrl}/functions/v1/unsubscribe?campaign=${campaignId}&recipient=${recipient.id}">Unsubscribe</a></p>`;
          
          const finalBody = personalizedBody + trackingPixel + unsubscribeLink;

          // Send email via Resend
          const emailPayload: ResendEmailPayload = {
            from: 'noreply@yourdomain.com', // Configure this with your domain
            to: [recipient.email],
            subject: personalizedSubject,
            html: finalBody,
            headers: {
              'X-Campaign-ID': campaignId,
              'X-Recipient-ID': recipient.id
            }
          };

          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailPayload),
          });

          if (response.ok) {
            // Update recipient status to sent
            await supabase
              .from('campaign_recipients')
              .update({ 
                status: 'sent',
                sent_date: new Date().toISOString(),
                delivery_attempts: (recipient.delivery_attempts || 0) + 1,
                last_delivery_attempt: new Date().toISOString()
              })
              .eq('id', recipient.id);

            // Log analytics event
            await supabase
              .from('email_campaign_analytics')
              .insert({
                campaign_id: campaignId,
                recipient_id: recipient.id,
                event_type: 'sent',
                event_data: { resend_response: await response.json() }
              });

            successCount++;
          } else {
            const errorData = await response.json();
            
            // Update recipient status to failed
            await supabase
              .from('campaign_recipients')
              .update({ 
                status: 'failed',
                delivery_attempts: (recipient.delivery_attempts || 0) + 1,
                last_delivery_attempt: new Date().toISOString(),
                metadata: { 
                  ...recipient.metadata, 
                  last_error: errorData 
                }
              })
              .eq('id', recipient.id);

            failureCount++;
          }
        } catch (error) {
          console.error(`Failed to send email to ${recipient.email}:`, error);
          
          // Update recipient status to failed
          await supabase
            .from('campaign_recipients')
            .update({ 
              status: 'failed',
              delivery_attempts: (recipient.delivery_attempts || 0) + 1,
              last_delivery_attempt: new Date().toISOString(),
              metadata: { 
                ...recipient.metadata, 
                last_error: error.message 
              }
            })
            .eq('id', recipient.id);

          failureCount++;
        }
      }

      // Small delay between batches to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Update campaign status to sent
    await supabase
      .from('email_campaigns')
      .update({ 
        status: 'sent',
        completed_at: new Date().toISOString(),
        delivery_count: successCount
      })
      .eq('id', campaignId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Campaign sent successfully. ${successCount} emails sent, ${failureCount} failed.`,
        stats: {
          total: recipients.length,
          success: successCount,
          failed: failureCount
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending email campaign:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
