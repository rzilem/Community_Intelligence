
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { ScrollText, ArrowRight } from 'lucide-react';
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
      title: "Property Inspection",
      description: "Schedule and document property inspections for resale.",
      path: "/resale-management/inspection"
    },
    {
      title: "Account Statements",
      description: "Generate account statements for closing and resale transactions.",
      path: "/resale-management/statements"
    },
    {
      title: "TREC Forms",
      description: "Access and complete Texas Real Estate Commission standard forms.",
      path: "/resale-management/trec-forms"
    },
    {
      title: "Order Queue",
      description: "Track and manage resale document orders and requests.",
      path: "/resale-management/order-queue"
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
