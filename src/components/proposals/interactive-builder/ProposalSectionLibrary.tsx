
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Users, Award, Building, HandCoins, BarChart } from 'lucide-react';
import { ProposalSection } from '@/types/proposal-types';

// Predefined section templates
const sectionTemplates: ProposalSection[] = [
  {
    id: 'template-intro',
    title: 'Introduction',
    content: '<p>Welcome to our proposal for your community. We are excited to present our management services tailored to your specific needs.</p>',
    order: 0,
    attachments: []
  },
  {
    id: 'template-about',
    title: 'About Us',
    content: '<p>Our company has been providing exceptional HOA management services for over 15 years. We pride ourselves on our dedicated team and comprehensive approach.</p>',
    order: 1,
    attachments: []
  },
  {
    id: 'template-services',
    title: 'Services Offered',
    content: '<ul><li>Financial Management</li><li>Maintenance Coordination</li><li>Compliance & Enforcement</li><li>Communication Services</li><li>Board Meeting Support</li></ul>',
    order: 2,
    attachments: []
  },
  {
    id: 'template-testimonials',
    title: 'Client Testimonials',
    content: '<p>"Working with this management company has been a game-changer for our community. Their responsiveness and attention to detail are unmatched." - Board President, Oak Ridge HOA</p>',
    order: 3,
    attachments: []
  },
  {
    id: 'template-pricing',
    title: 'Pricing & Packages',
    content: '<p>We offer flexible pricing options to meet your community\'s needs and budget. Our standard package includes:</p><ul><li>Monthly financial reporting</li><li>24/7 maintenance requests</li><li>Compliance inspections</li></ul>',
    order: 4,
    attachments: []
  },
  {
    id: 'template-timeline',
    title: 'Implementation Timeline',
    content: '<p>Our onboarding process is designed to ensure a smooth transition:</p><ol><li>Initial assessment (Week 1)</li><li>Data migration (Weeks 2-3)</li><li>Board & resident orientation (Week 4)</li><li>Full implementation (Week 5)</li></ol>',
    order: 5,
    attachments: []
  }
];

interface ProposalSectionLibraryProps {
  onAddSection: (template: ProposalSection) => void;
}

const ProposalSectionLibrary: React.FC<ProposalSectionLibraryProps> = ({ onAddSection }) => {
  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">Section Templates</div>
      <ScrollArea className="h-[calc(100vh-220px)]">
        <div className="space-y-2 pr-2">
          <Card className="cursor-pointer hover:bg-accent/10" onClick={() => onAddSection(sectionTemplates[0])}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-500" />
                  <span className="text-sm font-medium">Introduction</span>
                </div>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:bg-accent/10" onClick={() => onAddSection(sectionTemplates[1])}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Building className="h-5 w-5 mr-2 text-indigo-500" />
                  <span className="text-sm font-medium">About Us</span>
                </div>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:bg-accent/10" onClick={() => onAddSection(sectionTemplates[2])}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <HandCoins className="h-5 w-5 mr-2 text-green-500" />
                  <span className="text-sm font-medium">Services Offered</span>
                </div>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:bg-accent/10" onClick={() => onAddSection(sectionTemplates[3])}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-amber-500" />
                  <span className="text-sm font-medium">Client Testimonials</span>
                </div>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:bg-accent/10" onClick={() => onAddSection(sectionTemplates[4])}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BarChart className="h-5 w-5 mr-2 text-red-500" />
                  <span className="text-sm font-medium">Pricing & Packages</span>
                </div>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:bg-accent/10" onClick={() => onAddSection(sectionTemplates[5])}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-purple-500" />
                  <span className="text-sm font-medium">Implementation Timeline</span>
                </div>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ProposalSectionLibrary;
