
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BarChart, LineChart, PieChart } from '@/components/ui/chart';
import { 
  Eye, 
  Clock, 
  BarChart as BarChartIcon, 
  Layers, 
  MousePointer, 
  ArrowUpRight 
} from 'lucide-react';
import { ProposalAnalytics } from '@/types/proposal-types';

interface ProposalAnalyticsDashboardProps {
  proposalId: string;
  analytics?: ProposalAnalytics;
  proposalName: string;
}

const ProposalAnalyticsDashboard: React.FC<ProposalAnalyticsDashboardProps> = ({
  proposalId,
  analytics,
  proposalName
}) => {
  // Demo data for visualization purposes
  const demoData = {
    views: analytics?.views || 5,
    avg_view_time: analytics?.avg_view_time || 3.5, // minutes
    most_viewed_section: analytics?.most_viewed_section || 'Services Offered',
    initial_view_date: analytics?.initial_view_date || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    last_view_date: analytics?.last_view_date || new Date().toISOString(),
    view_count_by_section: analytics?.view_count_by_section || {
      'Introduction': 7,
      'About Us': 4,
      'Services Offered': 12,
      'Client Testimonials': 5,
      'Pricing & Packages': 9,
      'Implementation Timeline': 3
    }
  };

  // For demo purposes, generate some viewership data over the last 14 days
  const generateViewsData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = 13; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Random views between 0-3 per day, with a spike on day 5
      let views = Math.floor(Math.random() * 4);
      if (i === 5) views = 5; // Spike on day 5
      
      data.push({
        date: date.toISOString().split('T')[0],
        views
      });
    }
    
    return data;
  };

  const viewsData = generateViewsData();
  
  // Format sectionViews data for the chart
  const sectionViewsData = Object.entries(demoData.view_count_by_section).map(([section, count]) => ({
    section: section,
    views: count
  }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{proposalName} - Analytics</h2>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Eye className="h-5 w-5 text-blue-500 mr-2" />
              <div className="text-2xl font-bold">{demoData.views}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average View Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-green-500 mr-2" />
              <div className="text-2xl font-bold">{demoData.avg_view_time} min</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Most Viewed Section</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <MousePointer className="h-5 w-5 text-purple-500 mr-2" />
              <div className="text-base font-medium">{demoData.most_viewed_section}</div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="engagement">
        <TabsList>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="sections">Section Analysis</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
        </TabsList>
        
        <TabsContent value="engagement" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Views</CardTitle>
              <CardDescription>
                Proposal viewing activity over the past 14 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <LineChart
                  data={viewsData}
                  categories={['views']}
                  index="date"
                  colors={['blue']}
                  valueFormatter={(value) => `${value} views`}
                  showLegend={false}
                  showXAxis={true}
                  showYAxis={true}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sections" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Views by Section</CardTitle>
              <CardDescription>
                Which sections of your proposal are getting the most attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <BarChart
                  data={sectionViewsData}
                  categories={['views']}
                  index="section"
                  colors={['blue']}
                  valueFormatter={(value) => `${value} views`}
                  showLegend={false}
                  showXAxis={true}
                  showYAxis={true}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="devices" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Device Breakdown</CardTitle>
              <CardDescription>
                Which devices are being used to view your proposal
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="w-64 h-64">
                <PieChart
                  data={[
                    { name: 'Desktop', value: 60 },
                    { name: 'Mobile', value: 30 },
                    { name: 'Tablet', value: 10 }
                  ]}
                  category="value"
                  index="name"
                  colors={['blue', 'green', 'amber']}
                  valueFormatter={(value) => `${value}%`}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Client Engagement History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4 py-1">
              <div className="text-sm font-medium flex items-center">
                <Eye className="h-4 w-4 mr-1" /> First opened
                <span className="ml-auto text-xs text-muted-foreground">
                  {new Date(demoData.initial_view_date).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Client first viewed your proposal</p>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-4 py-1">
              <div className="text-sm font-medium flex items-center">
                <Layers className="h-4 w-4 mr-1" /> Viewed Services section
                <span className="ml-auto text-xs text-muted-foreground">
                  {new Date(demoData.initial_view_date).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Spent 2.5 minutes on this section</p>
            </div>
            
            <div className="border-l-4 border-amber-500 pl-4 py-1">
              <div className="text-sm font-medium flex items-center">
                <BarChartIcon className="h-4 w-4 mr-1" /> Viewed Pricing section
                <span className="ml-auto text-xs text-muted-foreground">
                  {new Date(demoData.last_view_date).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Returned to this section 3 times</p>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-4 py-1">
              <div className="text-sm font-medium flex items-center">
                <ArrowUpRight className="h-4 w-4 mr-1" /> Last interaction
                <span className="ml-auto text-xs text-muted-foreground">
                  {new Date(demoData.last_view_date).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Last activity recorded on your proposal</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProposalAnalyticsDashboard;
