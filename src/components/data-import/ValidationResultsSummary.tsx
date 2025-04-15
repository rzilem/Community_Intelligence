
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
    <div className={`bg-muted/30 p-4 rounded-md mb-4 ${className || ''}`}>
      <h3 className="font-medium mb-2">Validation Results:</h3>
      <div className="flex flex-wrap gap-3 mb-3">
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          {validRows} valid rows
        </Badge>
        {warnings > 0 && (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            {warnings} warnings
          </Badge>
        )}
        {invalidRows > 0 && (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            {invalidRows} invalid rows
          </Badge>
        )}
      </div>
      
      {issues && issues.length > 0 && (
        <div className="text-sm text-muted-foreground">
          <p className="mb-1">Issues found:</p>
          <ul className="list-disc pl-5 space-y-1">
            {issues.slice(0, 5).map((issue, i) => (
              <li key={i}>
                Row {issue.row}: {issue.issue} in field "{issue.field}"
              </li>
            ))}
            {issues.length > 5 && (
              <li>...and {issues.length - 5} more issues</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ValidationResultsSummary;
