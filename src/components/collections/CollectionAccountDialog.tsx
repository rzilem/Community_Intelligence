
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CollectionsTimeline } from './CollectionsTimeline';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CollectionAccount, CollectionStep } from '@/hooks/collections/useCollectionsData';

interface CollectionAccountDialogProps {
  account: CollectionAccount | null;
  steps: CollectionStep[];
  isOpen: boolean;
  onClose: () => void;
}

export function CollectionAccountDialog({
  account,
  steps,
  isOpen,
  onClose
}: CollectionAccountDialogProps) {
  if (!account) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            Account Details - {account.property?.address}
            {account.property?.unit_number && ` Unit ${account.property.unit_number}`}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm">Balance Due</h4>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(account.balance_amount)}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm">Delinquent Since</h4>
              <p className="text-lg">{formatDate(account.delinquent_since)}</p>
            </div>
          </div>

          <Tabs defaultValue="history" className="w-full">
            <TabsList>
              <TabsTrigger value="history">Collection History</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>

            <TabsContent value="history">
              <CollectionsTimeline 
                steps={steps.map(step => ({
                  id: step.id,
                  name: step.name,
                  description: step.description || undefined,
                  completed: false,
                }))}
                currentStep={2}
              />
            </TabsContent>

            <TabsContent value="documents">
              <div className="text-sm text-muted-foreground">
                Documents feature coming soon...
              </div>
            </TabsContent>

            <TabsContent value="payments">
              <div className="text-sm text-muted-foreground">
                Payment tracking feature coming soon...
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
