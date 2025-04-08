
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building, Calendar, ChartBar, ClipboardList, DollarSign, MessageSquare, Shield, Sparkles, Users2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

const Feature: React.FC<FeatureProps> = ({ icon, title, description, className }) => {
  return (
    <Card className={cn("card-hover h-full", className)}>
      <CardContent className="pt-6">
        <div className="h-12 w-12 rounded-lg bg-hoa-blue-100 text-hoa-blue flex items-center justify-center mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export const FeatureSection: React.FC = () => {
  const features = [
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "AI at the Core",
      description: "Access data, automate tasks, and gain insights with natural language queries powered by advanced AI."
    },
    {
      icon: <Building className="h-6 w-6" />,
      title: "Multi-HOA Management",
      description: "Efficiently manage multiple properties and HOAs with isolated data and cross-portfolio insights."
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Amenity Booking",
      description: "Streamline amenity reservations with an intuitive calendar system accessible to all residents."
    },
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: "Advanced Accounting",
      description: "Handle assessments, budgets, and financial reporting with our comprehensive accounting tools."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Compliance Tracking",
      description: "Monitor and manage HOA violations, fines, and resolutions with automated workflows."
    },
    {
      icon: <Users2 className="h-6 w-6" />,
      title: "Resident Management",
      description: "Maintain comprehensive resident profiles with emergency contacts and property associations."
    },
    {
      icon: <ClipboardList className="h-6 w-6" />,
      title: "ARC Applications",
      description: "Streamline the review and approval process for architectural changes and improvements."
    },
    {
      icon: <ChartBar className="h-6 w-6" />,
      title: "Reporting & Analytics",
      description: "Generate customizable reports with AI-powered insights for better decision making."
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Communication Tools",
      description: "Foster community engagement with announcements, newsletters, and a resident forum."
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Powerful Features for Modern HOA Management</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Community Intelligence combines cutting-edge technology with intuitive design to simplify complex HOA operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Feature
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
