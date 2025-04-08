
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ValidationSummary } from './types/mapping-types';

interface ValidationResultsSummaryProps {
  validationResults: ValidationSummary;
}

const ValidationResultsSummary: React.FC<ValidationResultsSummaryProps> = ({ validationResults }) => {
  return (
    <div className="bg-muted/30 p-4 rounded-md mb-4">
      <h3 className="font-medium mb-2">Validation Results:</h3>
      <div className="flex flex-wrap gap-3 mb-3">
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          {validationResults.validRows} valid rows
        </Badge>
        {validationResults.warnings > 0 && (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            {validationResults.warnings} warnings
          </Badge>
        )}
        {validationResults.invalidRows > 0 && (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            {validationResults.invalidRows} invalid rows
          </Badge>
        )}
      </div>
      
      {validationResults.issues.length > 0 && (
        <div className="text-sm text-muted-foreground">
          <p className="mb-1">Issues found:</p>
          <ul className="list-disc pl-5 space-y-1">
            {validationResults.issues.slice(0, 5).map((issue, i) => (
              <li key={i}>
                Row {issue.row}: {issue.issue} in field "{issue.field}"
              </li>
            ))}
            {validationResults.issues.length > 5 && (
              <li>...and {validationResults.issues.length - 5} more issues</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ValidationResultsSummary;
