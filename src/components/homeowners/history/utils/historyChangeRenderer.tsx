
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { StatusBadge } from '../badges/StatusBadge';
import { PriorityBadge } from '../badges/PriorityBadge';

/**
 * Renders a change item based on the key and value
 * 
 * @param key The property key being changed
 * @param value The value (can be a simple value or an object with old/new values)
 * @returns JSX element representing the change
 */
export const renderChangeItem = (key: string, value: any) => {
  if (typeof value === 'object' && value !== null && 'old' in value && 'new' in value) {
    // Render status changes with badges
    if (key === 'status') {
      return (
        <div className="flex items-center gap-2">
          <StatusBadge status={value.old} />
          <ArrowRight className="h-4 w-4 text-gray-400" />
          <StatusBadge status={value.new} />
        </div>
      );
    }
    
    // Render priority changes with badges
    if (key === 'priority') {
      return (
        <div className="flex items-center gap-2">
          <PriorityBadge priority={value.old} />
          <ArrowRight className="h-4 w-4 text-gray-400" />
          <PriorityBadge priority={value.new} />
        </div>
      );
    }
    
    // General change renderer
    return (
      <div className="flex items-center gap-2">
        <span className="line-through text-gray-500">{value.old || 'Empty'}</span>
        <ArrowRight className="h-4 w-4 text-gray-400" />
        <span>{value.new || 'Empty'}</span>
      </div>
    );
  }
  
  // For simple values (creation events)
  return <span>{value}</span>;
};
