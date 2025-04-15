
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { FileText, BarChart2, FilePlus, FileSearch } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useResponsive } from '@/hooks/use-responsive';

const RecordsReports = () => {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  
  const sections = [
    {
      title: "Documents",
      description: "Access and manage community documents",
      icon: <FileText className="h-10 w-10 text-blue-500" />,
      path: "/records-reports/documents",
      buttonText: "View Documents"
    },
    {
      title: "Reports",
      description: "Generate and view customizable reports",
      icon: <BarChart2 className="h-10 w-10 text-purple-500" />,
      path: "/records-reports/reports",
      buttonText: "Go to Reports"
    },
    {
      title: "Record Creation",
      description: "Create new community records",
      icon: <FilePlus className="h-10 w-10 text-green-500" />,
      path: "/records-reports/create",
      buttonText: "Create Record"
    },
    {
      title: "Search & Archives",
      description: "Search historical records and archives",
      icon: <FileSearch className="h-10 w-10 text-amber-500" />,
      path: "/records-reports/search",
      buttonText: "Search Records"
    }
  ];
  
  return (
    <PageTemplate 
      title="Records & Reports" 
      icon={<FileText className="h-8 w-8" />}
      description="Access and manage community records and generate reports."
    >
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${isMobile ? 'px-4 pt-4' : 'pt-6'}`}>
        {sections.map((section, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-0">
              <CardTitle className="flex items-center gap-2">
                {section.icon}
                <span>{section.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="mb-6">{section.description}</p>
              <Button onClick={() => navigate(section.path)}>
                {section.buttonText}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageTemplate>
  );
};

export default RecordsReports;
