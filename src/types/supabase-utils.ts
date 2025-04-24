
import { RequestAttachment } from './homeowner-request-types';

/**
 * A type helper to convert our strongly typed interfaces to plain objects
 * that can be safely stored in Supabase JSONB columns
 */
export function toPlainObject<T>(obj: T): Record<string, any> {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Safely convert JSON data from Supabase to typed RequestAttachment[]
 */
export function parseAttachments(jsonData: any): RequestAttachment[] {
  if (!Array.isArray(jsonData)) {
    return [];
  }
  
  return jsonData.map(item => ({
    name: item.name || '',
    url: item.url || '',
    size: item.size || 0,
    type: item.type || ''
  }));
}
