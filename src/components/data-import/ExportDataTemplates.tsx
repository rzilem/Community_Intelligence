
import React from 'react';
import { Download, FileSpreadsheet, FileText, Calendar, Users, Building, CreditCard, AlertTriangle, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface TemplateCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ title, description, icon, onClick }) => (
  <Card className="overflow-hidden">
    <div className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="rounded-full bg-primary/10 p-2">{icon}</div>
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto">
        <Button variant="outline" className="w-full" onClick={onClick}>
          <Download className="mr-2 h-4 w-4" /> Download Template
        </Button>
      </CardContent>
    </div>
  </Card>
);

interface ExportDataTemplatesProps {
  associationId: string;
}

const ExportDataTemplates: React.FC<ExportDataTemplatesProps> = ({ associationId }) => {
  const downloadTemplate = (templateType: string) => {
    // In a real implementation, this would generate and download the template
    // based on the templateType
    if (!associationId) {
      toast.error("Please select an association first");
      return;
    }
    
    toast.success(`${templateType} template downloaded successfully`);
    console.log(`Downloading ${templateType} template for association ${associationId}`);
  };

  const downloadAssociationData = () => {
    if (!associationId) {
      toast.error("Please select an association first");
      return;
    }
    toast.success("Association data export started. You'll be notified when it's ready.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-1">Export Templates</h3>
        <p className="text-muted-foreground mb-6">
          Download template files in the required format for data imports
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <TemplateCard
            title="Associations"
            description="Template for importing HOA and community association data"
            icon={<Building className="h-4 w-4 text-primary" />}
            onClick={() => downloadTemplate('Associations')}
          />
          <TemplateCard
            title="Owners & Residents"
            description="Template for importing owner and resident information"
            icon={<Users className="h-4 w-4 text-primary" />}
            onClick={() => downloadTemplate('Owners')}
          />
          <TemplateCard
            title="Properties"
            description="Template for importing property details"
            icon={<Building className="h-4 w-4 text-primary" />}
            onClick={() => downloadTemplate('Properties')}
          />
          <TemplateCard
            title="Financial Data"
            description="Template for importing assessments, payments, and balances"
            icon={<CreditCard className="h-4 w-4 text-primary" />}
            onClick={() => downloadTemplate('Financial')}
          />
          <TemplateCard
            title="Compliance Issues"
            description="Template for importing violations and compliance issues"
            icon={<AlertTriangle className="h-4 w-4 text-primary" />}
            onClick={() => downloadTemplate('Compliance')}
          />
          <TemplateCard
            title="Maintenance Requests"
            description="Template for importing maintenance requests"
            icon={<Wrench className="h-4 w-4 text-primary" />}
            onClick={() => downloadTemplate('Maintenance')}
          />
        </div>
      </div>

      <div className="border-t pt-6 mt-8">
        <h3 className="text-xl font-semibold mb-1">Export Association Data</h3>
        <p className="text-muted-foreground mb-6">
          Download your association data in CSV or Excel format
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Full Association Export</CardTitle>
              <CardDescription>
                Export all data related to the selected association
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <Button 
                  variant="outline"
                  onClick={downloadAssociationData}
                  disabled={!associationId}
                  className="justify-start"
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> 
                  Export to Excel (.xlsx)
                </Button>
                <Button 
                  variant="outline" 
                  onClick={downloadAssociationData}
                  disabled={!associationId}
                  className="justify-start"
                >
                  <FileText className="mr-2 h-4 w-4" /> 
                  Export to CSV (.csv)
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Data Export</CardTitle>
              <CardDescription>
                Select specific data to export for the selected association
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm">
                  Choose which data to include in your export:
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={!associationId}
                    onClick={() => downloadTemplate('Owners_Custom')}
                  >
                    <Users className="mr-2 h-3 w-3" /> Owners
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={!associationId}
                    onClick={() => downloadTemplate('Properties_Custom')}
                  >
                    <Building className="mr-2 h-3 w-3" /> Properties
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={!associationId}
                    onClick={() => downloadTemplate('Financial_Custom')}
                  >
                    <CreditCard className="mr-2 h-3 w-3" /> Financial
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={!associationId}
                    onClick={() => downloadTemplate('Compliance_Custom')}
                  >
                    <AlertTriangle className="mr-2 h-3 w-3" /> Compliance
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExportDataTemplates;
