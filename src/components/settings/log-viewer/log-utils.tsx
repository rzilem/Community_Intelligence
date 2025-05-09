
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Info, Terminal } from 'lucide-react';
import React from 'react';

export interface LogEntry {
  id: string;
  request_id: string;
  function_name: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  metadata?: any;
}

export const getLevelBadge = (level: string) => {
  switch (level) {
    case 'error':
      return <Badge variant="destructive" className="ml-2 flex items-center"><AlertCircle className="h-3 w-3 mr-1" /> Error</Badge>;
    case 'warn':
      return <Badge variant="outline" className="ml-2 flex items-center bg-amber-100 text-amber-800 border-amber-200"><Info className="h-3 w-3 mr-1" /> Warning</Badge>;
    case 'info':
      return <Badge variant="outline" className="ml-2 flex items-center bg-blue-100 text-blue-800 border-blue-200"><Info className="h-3 w-3 mr-1" /> Info</Badge>;
    case 'debug':
      return <Badge variant="outline" className="ml-2 flex items-center"><Terminal className="h-3 w-3 mr-1" /> Debug</Badge>;
    default:
      return <Badge variant="secondary" className="ml-2">{level}</Badge>;
  }
};

export const filterLogs = (logs: LogEntry[], searchQuery: string) => {
  if (!searchQuery) return logs;
  
  const searchLower = searchQuery.toLowerCase();
  return logs.filter(log => (
    log.message.toLowerCase().includes(searchLower) ||
    log.function_name.toLowerCase().includes(searchLower) ||
    log.request_id.toLowerCase().includes(searchLower) ||
    JSON.stringify(log.metadata).toLowerCase().includes(searchLower)
  ));
};

/**
 * Highlight search terms in the text
 * @param text The text to search within
 * @param query The query to highlight
 * @returns String with HTML highlighting for the matched terms
 */
export const highlight = (text: string, query: string): string => {
  if (!query) return text;
  
  const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  return text.replace(regex, match => `<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">${match}</mark>`);
};
