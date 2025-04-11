
import React from 'react';
import { Filter, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const FinancialReportToolbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <Button variant="outline">
        <Filter className="h-4 w-4 mr-2" /> Filter
      </Button>
      <Button variant="outline">
        <Download className="h-4 w-4 mr-2" /> Export
      </Button>
      <Button onClick={() => navigate('/records-reports/reports')}>
        <FileText className="h-4 w-4 mr-2" /> All Reports
      </Button>
    </div>
  );
};

export default FinancialReportToolbar;
