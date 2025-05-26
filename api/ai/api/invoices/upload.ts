// Handles file upload to Supabase storage
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the incoming form data
    const form = formidable({
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
      keepExtensions: true,
      allowEmptyFiles: false,
    });

    const [fields, files] = await form.parse(req);
    
    // Extract file and association ID
    const file = Array.isArray(files.invoice) ? files.invoice[0] : files.invoice;
    const associationId = Array.isArray(fields.association_id) ? fields.association_id[0] : fields.association_id;

    if (!file || !associationId) {
      return res.status(400).json({ error: 'Missing file or association ID' });
    }

    // Validate file type
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,application/pdf').split(',');
    if (!allowedTypes.includes(file.mimetype || '')) {
      return res.status(400).json({ 
        error: 'Invalid file type', 
        allowed: allowedTypes 
      });
    }

    console.log('Uploading file:', {
      name: file.originalFilename,
      size: file.size,
      type: file.mimetype,
      associationId
    });

    // Read file buffer
    const fileBuffer = fs.readFileSync(file.filepath);
    
    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.originalFilename || 'invoice';
    const extension = originalName.split('.').pop() || 'pdf';
    const fileName = `invoices/${associationId}/${timestamp}-${originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, fileBuffer, {
        contentType: file.mimetype || 'application/octet-stream',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return res.status(500).json({ 
        error: 'Failed to upload file',
        details: uploadError.message 
      });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    // Clean up temporary file
    try {
      fs.unlinkSync(file.filepath);
    } catch (cleanupError) {
      console.warn('Failed to clean up temp file:', cleanupError);
    }

    console.log('File uploaded successfully:', publicUrlData.publicUrl);

    res.status(200).json({
      fileUrl: publicUrlData.publicUrl,
      fileName: fileName,
      originalName: file.originalFilename,
      size: file.size,
      mimeType: file.mimetype
    });

  } catch (error) {
    console.error('Upload handler error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: (error as Error).message 
    });
  }
}
