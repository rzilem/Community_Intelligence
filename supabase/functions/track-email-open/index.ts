
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const campaignId = url.searchParams.get('campaign');
    const recipientId = url.searchParams.get('recipient');

    if (!campaignId || !recipientId) {
      // Return a 1x1 transparent pixel even if parameters are missing
      const pixel = new Uint8Array([
        0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00, 0xFF, 0xFF, 0xFF,
        0x00, 0x00, 0x00, 0x21, 0xF9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2C, 0x00, 0x00, 0x00, 0x00,
        0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x04, 0x01, 0x00, 0x3B
      ]);
      
      return new Response(pixel, {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Expires': '0'
        }
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get client info
    const userAgent = req.headers.get('user-agent');
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');

    // Update recipient status to opened if not already
    const { data: recipient } = await supabase
      .from('campaign_recipients')
      .select('status, opened_date')
      .eq('id', recipientId)
      .single();

    if (recipient && recipient.status !== 'opened' && recipient.status !== 'clicked') {
      await supabase
        .from('campaign_recipients')
        .update({ 
          status: 'opened',
          opened_date: new Date().toISOString()
        })
        .eq('id', recipientId);
    }

    // Log analytics event (always log, even for repeat opens)
    await supabase
      .from('email_campaign_analytics')
      .insert({
        campaign_id: campaignId,
        recipient_id: recipientId,
        event_type: 'opened',
        event_data: { 
          timestamp: new Date().toISOString(),
          user_agent: userAgent
        },
        ip_address: clientIP,
        user_agent: userAgent
      });

    // Return a 1x1 transparent GIF pixel
    const pixel = new Uint8Array([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00, 0xFF, 0xFF, 0xFF,
      0x00, 0x00, 0x00, 0x21, 0xF9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2C, 0x00, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x04, 0x01, 0x00, 0x3B
    ]);

    return new Response(pixel, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Error tracking email open:', error);
    
    // Still return a pixel even if tracking fails
    const pixel = new Uint8Array([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00, 0xFF, 0xFF, 0xFF,
      0x00, 0x00, 0x00, 0x21, 0xF9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2C, 0x00, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x04, 0x01, 0x00, 0x3B
    ]);
    
    return new Response(pixel, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Expires': '0'
      }
    });
  }
});
