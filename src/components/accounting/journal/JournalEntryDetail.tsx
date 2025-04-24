
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Clock, FileEdit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { JournalEntry } from '@/types/accounting-types';

interface JournalEntryDetailProps {
  entry: JournalEntry;
  onEdit: (entry: JournalEntry) => void;
  onPost: (entryId: string) => void;
  onVoid: (entryId: string) => void;
}

export const JournalEntryDetail: React.FC<JournalEntryDetailProps> = ({
  entry,
  onEdit,
  onPost,
  onVoid
}) => {
  const getStatusBadge = () => {
    switch (entry.status) {
      case 'draft':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Draft
          </Badge>
        );
      case 'posted':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Posted
          </Badge>
        );
      case 'voided':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Voided
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            {entry.status}
          </Badge>
        );
    }
  };

  const isEditable = entry.status === 'draft';
  const canBePosted = entry.status === 'draft';
  const canBeVoided = entry.status === 'draft' || entry.status === 'posted';

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
          <div>
            <CardTitle>Journal Entry #{entry.entryNumber}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Created on {new Date(entry.createdAt).toLocaleDateString()} by {entry.createdBy || 'System'}
            </p>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Entry Details</h3>
            <div className="space-y-2">
              <div className="grid grid-cols-2">
                <span className="text-sm text-muted-foreground">Date:</span>
                <span className="text-sm">{new Date(entry.entryDate).toLocaleDateString()}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-sm text-muted-foreground">Description:</span>
                <span className="text-sm">{entry.description}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-sm text-muted-foreground">Amount:</span>
                <span className="text-sm">${entry.amount.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Accounts</h3>
            {entry.details && entry.details.length > 0 ? (
              <div className="space-y-2">
                {entry.details.map((detail, index) => (
                  <div key={index} className="grid grid-cols-3">
                    <span className="text-sm">{detail.gl_account_id}</span>
                    <span className="text-sm text-right">${detail.debit > 0 ? detail.debit.toLocaleString() : ''}</span>
                    <span className="text-sm text-right">${detail.credit > 0 ? detail.credit.toLocaleString() : ''}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No account details available</p>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end gap-2">
        {isEditable && (
          <Button variant="outline" onClick={() => onEdit(entry)}>
            <FileEdit className="h-4 w-4 mr-2" /> Edit
          </Button>
        )}
        
        {canBePosted && (
          <Button variant="secondary" onClick={() => onPost(entry.id)}>
            Post Entry
          </Button>
        )}
        
        {canBeVoided && (
          <Button variant="destructive" onClick={() => onVoid(entry.id)}>
            Void Entry
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
