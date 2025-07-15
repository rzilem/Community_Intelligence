import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';
import { Home } from 'lucide-react';

const ResaleCertificates: React.FC = () => {
  return (
    <AppLayout>
      <PageTemplate
        title="Resale Certificates"
        icon={<Home className="h-8 w-8" />}
        description="Manage and process resale certificates for property transfers"
      >
        <div className="space-y-6">
          <div className="bg-muted/30 rounded-lg p-8 text-center">
            <Home className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Resale Certificates</h3>
            <p className="text-muted-foreground">
              This page is coming soon. You'll be able to manage and process resale certificates for property transfers here.
            </p>
          </div>
        </div>
      </PageTemplate>
    </AppLayout>
  );
};

export default ResaleCertificates;