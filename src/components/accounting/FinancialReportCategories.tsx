
import React from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ReportCategory } from '@/types/accounting-types';

interface FinancialReportCategoriesProps {
  categories: ReportCategory[];
}

const FinancialReportCategories: React.FC<FinancialReportCategoriesProps> = ({ categories }) => {
  const navigate = useNavigate();

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-lg">{category.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {category.reports.map((report, reportIndex) => (
                <li key={reportIndex}>
                  <Button 
                    variant="ghost" 
                    className="w-full text-left justify-start h-auto py-2"
                    onClick={() => navigate('/records-reports/reports')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    <span>{report}</span>
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FinancialReportCategories;
