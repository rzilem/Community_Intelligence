import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';
import { FileText } from 'lucide-react';

const AuditLogs: React.FC = () => {
  return (
    <AppLayout>
      <PageTemplate
        title="Audit Logs"
        icon={<FileText className="h-8 w-8" />}
        description="View and analyze system audit logs and user activity"
      >
        <div className="space-y-6">
          <div className="bg-muted/30 rounded-lg p-8 text-center">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Audit Logs</h3>
            <p className="text-muted-foreground">
              This page is coming soon. You'll be able to view and analyze system audit logs and user activity here.
            </p>
          </div>
        </div>
      </PageTemplate>
    </AppLayout>
  );
};

export default AuditLogs;