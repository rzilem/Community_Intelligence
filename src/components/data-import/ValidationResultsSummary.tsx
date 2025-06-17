
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ValidationResult } from '@/types/import-types';

interface ValidationResultsSummaryProps {
  validationResults: ValidationResult | null | undefined;
  className?: string;
}

const ValidationResultsSummary: React.FC<ValidationResultsSummaryProps> = ({ validationResults, className }) => {
  // If validationResults is undefined, null, or doesn't have required properties, return null
  if (!validationResults || typeof validationResults !== 'object') {
    return null;
  }
  
  // Ensure all required properties exist with defaults if they're undefined
  const {
    validRows = 0,
    warnings = 0,
    invalidRows = 0,
    issues = []
  } = validationResults;
  
  return (
    <div className={`bg-muted/20 p-2 rounded border text-xs ${className || ''}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="font-medium text-xs">Validation:</span>
        <div className="flex gap-1">
          <Badge variant="outline" className="text-[10px] px-1 py-0 bg-green-50 text-green-700 border-green-200">
            {validRows} valid
          </Badge>
          {warnings > 0 && (
            <Badge variant="outline" className="text-[10px] px-1 py-0 bg-amber-50 text-amber-700 border-amber-200">
              {warnings} warnings
            </Badge>
          )}
          {invalidRows > 0 && (
            <Badge variant="outline" className="text-[10px] px-1 py-0 bg-red-50 text-red-700 border-red-200">
              {invalidRows} invalid
            </Badge>
          )}
        </div>
      </div>
      
      {issues && issues.length > 0 && (
        <div className="text-[10px] text-muted-foreground">
          <span className="font-medium">Issues:</span>
          {issues.slice(0, 2).map((issue, i) => (
            <span key={i} className="ml-1">
              Row {issue.row}: {issue.field};
            </span>
          ))}
          {issues.length > 2 && (
            <span className="ml-1">+{issues.length - 2} more</span>
          )}
        </div>
      )}
    </div>
  );
};

export default ValidationResultsSummary;
