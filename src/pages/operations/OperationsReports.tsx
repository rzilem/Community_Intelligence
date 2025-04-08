
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { BarChart2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const reportCategories = [
  {
    title: "Vendor Reports",
    reports: [
      "Vendor Activity Summary",
      "Vendor Spend Analysis",
      "Insurance Compliance"
    ]
  },
  {
    title: "Maintenance Reports",
    reports: [
      "Work Order Status",
      "Maintenance Trends",
      "Recurring Maintenance"
    ]
  },
  {
    title: "Workflow Reports",
    reports: [
      "Workflow Completion Time",
      "Process Efficiency",
      "Bottleneck Analysis"
    ]
  }
];

const OperationsReports = () => {
  const navigate = useNavigate();
  
  return (
    <PageTemplate 
      title="Operations Reports" 
      icon={<BarChart2 className="h-8 w-8" />}
      description="Generate and view reports related to operations activities."
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {reportCategories.map((category, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{category.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {category.reports.map((report, reportIndex) => (
                  <li key={reportIndex}>
                    <button 
                      className="w-full text-left p-2 hover:bg-gray-100 rounded flex justify-between items-center"
                      onClick={() => navigate('/records-reports/reports')}
                    >
                      <span>{report}</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
        
        <Card className="bg-gray-50 border-dashed border-2">
          <CardHeader>
            <CardTitle>All Reports</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <BarChart2 className="h-12 w-12 text-blue-500 mb-3" />
            <button 
              className="text-blue-600 font-medium"
              onClick={() => navigate('/records-reports/reports')}
            >
              Go to Reports Dashboard
            </button>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
};

export default OperationsReports;
