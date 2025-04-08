
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const FinancialReports = () => {
  const navigate = useNavigate();

  return (
    <PageTemplate 
      title="Financial Reports" 
      icon={<BarChart2 className="h-8 w-8" />}
      description="Generate and view financial statements and reports."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <Button 
          variant="outline" 
          className="h-auto p-6 flex flex-col items-center justify-center gap-3"
          onClick={() => navigate('/records-reports/reports')}
        >
          <BarChart2 className="h-12 w-12 text-blue-500" />
          <span className="text-lg font-medium">View All Reports</span>
        </Button>

        <Button 
          variant="outline" 
          className="h-auto p-6 flex flex-col items-center justify-center gap-3"
        >
          <BarChart2 className="h-12 w-12 text-green-500" />
          <span className="text-lg font-medium">Income & Expense Reports</span>
        </Button>

        <Button 
          variant="outline" 
          className="h-auto p-6 flex flex-col items-center justify-center gap-3"
        >
          <BarChart2 className="h-12 w-12 text-purple-500" />
          <span className="text-lg font-medium">Balance Sheet</span>
        </Button>
      </div>
    </PageTemplate>
  );
};

export default FinancialReports;
