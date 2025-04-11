
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { ScrollText, ArrowRight, BarChart, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ResaleManagement = () => {
  const resaleOptions = [
    {
      title: "Resale Certificate",
      description: "Generate and manage resale certificates for property transfers.",
      path: "/resale-management/certificate"
    },
    {
      title: "Condo Questionnaire",
      description: "Complete and manage condominium questionnaires for lenders.",
      path: "/resale-management/questionnaire"
    },
    {
      title: "Resale Calendar",
      description: "Track resale orders, inspections, and document deadlines.",
      path: "/resale-management/calendar",
      icon: <Calendar className="h-4 w-4 mr-2" />
    },
    {
      title: "Order Queue",
      description: "Track and manage resale document orders and requests.",
      path: "/resale-management/order-queue"
    },
    {
      title: "Analytics",
      description: "View performance metrics and reports for resale operations.",
      path: "/resale-management/analytics",
      icon: <BarChart className="h-4 w-4 mr-2" />
    }
  ];

  return <PageTemplate 
    title="Resale Management" 
    icon={<ScrollText className="h-8 w-8" />}
    description="Manage property resale documentation and processes."
  >
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {resaleOptions.map((option, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-2">{option.title}</h3>
            <p className="text-gray-500 mb-4">{option.description}</p>
            <Link to={option.path}>
              <Button variant="outline" className="w-full flex justify-between">
                {option.icon ? option.icon : null}
                View {option.title}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  </PageTemplate>;
};

export default ResaleManagement;
