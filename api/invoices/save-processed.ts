// Saves the AI-processed invoice to the database
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      association_id,
      vendor_name,
      invoice_number,
      invoice_date,
      due_date,
      total_amount,
      line_items,
      confidence_score,
      raw_text,
      image_url,
      user_id
    } = req.body;

    console.log('Saving processed invoice:', {
      vendor_name,
      invoice_number,
      total_amount,
      line_items_count: line_items?.length || 0,
      confidence_score
    });

    // Validate required fields
    if (!association_id || !vendor_name || !total_amount) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['association_id', 'vendor_name', 'total_amount']
      });
    }

    // Start transaction by inserting main invoice record
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        association_id,
        vendor_name,
        invoice_number: invoice_number || '',
        invoice_date: invoice_date || null,
        due_date: due_date || null,
        total_amount: parseFloat(total_amount),
        ai_confidence_score: confidence_score || 0,
        raw_extracted_text: raw_text || '',
        image_url: image_url || '',
        ai_processing_status: 'completed',
        ai_processed_at: new Date().toISOString(),
        needs_review: (confidence_score || 0) < 0.8,
        status: (confidence_score || 0) >= 0.8 ? 'ready_for_approval' : 'needs_review',
        created_by: user_id
      })
      .select()
      .single();

    if (invoiceError) {
      console.error('Invoice insert error:', invoiceError);
      throw new Error(`Failed to create invoice: ${invoiceError.message}`);
    }

    console.log('Invoice created with ID:', invoice.id);

    // Insert line items if they exist
    if (line_items && line_items.length > 0) {
      const lineItemInserts = line_items.map((item: any) => ({
        invoice_id: invoice.id,
        description: item.description || '',
        amount: parseFloat(item.amount) || 0,
        gl_account_code: item.suggested_gl_account || '',
        category: item.suggested_category || '',
        ai_confidence: item.confidence || 0,
        suggested_gl_account: item.suggested_gl_account || '',
        suggested_category: item.suggested_category || '',
        is_ai_suggested: true,
        is_user_edited: false,
        property_assignment: item.property_assignment || null
      }));

      const { error: lineItemsError } = await supabase
        .from('invoice_line_items')
        .insert(lineItemInserts);

      if (lineItemsError) {
        console.error('Line items insert error:', lineItemsError);
        // Don't fail the whole operation, just log the error
        console.warn('Failed to insert line items, continuing without them');
      } else {
        console.log('Line items inserted:', lineItemInserts.length);
      }
    }

    // Update vendor patterns for learning (async, don't wait)
    updateVendorPatterns(association_id, vendor_name, line_items || [])
      .catch(error => console.warn('Failed to update vendor patterns:', error));

    // Update GL account usage statistics (async, don't wait)  
    updateGLUsageStats(association_id, vendor_name, line_items || [])
      .catch(error => console.warn('Failed to update GL usage stats:', error));

    res.status(200).json({
      ...invoice,
      message: 'Invoice saved successfully'
    });

  } catch (error) {
    console.error('Save processed invoice error:', error);
    res.status(500).json({ 
      error: 'Failed to save invoice',
      details: (error as Error).message 
    });
  }
}

async function updateVendorPatterns(associationId: string, vendorName: string, lineItems: any[]) {
  try {
    if (!lineItems || lineItems.length === 0) return;

    await supabase.rpc('update_vendor_pattern', {
      p_vendor_name: vendorName,
      p_association_id: associationId,
      p_gl_account: lineItems[0]?.suggested_gl_account || '',
      p_category: lineItems[0]?.suggested_category || '',
      p_description: lineItems.map(item => item.description).join(' ')
    });

    console.log('Vendor patterns updated for:', vendorName);
  } catch (error) {
    console.error('Error updating vendor patterns:', error);
  }
}

async function updateGLUsageStats(associationId: string, vendorName: string, lineItems: any[]) {
  try {
    for (const item of lineItems) {
      if (!item.suggested_gl_account) continue;

      await supabase
        .from('gl_account_usage_stats')
        .upsert({
          association_id: associationId,
          gl_account_code: item.suggested_gl_account,
          vendor_name: vendorName,
          description_keywords: item.description?.toLowerCase().split(' ') || [],
          usage_count: 1,
          last_used: new Date().toISOString()
        }, {
          onConflict: 'association_id,gl_account_code,vendor_name'
        });
    }

    console.log('GL usage stats updated for:', vendorName);
  } catch (error) {
    console.error('Error updating GL usage stats:', error);
  }
}
