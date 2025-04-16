
import React, { useState, useEffect } from 'react';
import { Proposal, ProposalRecommendation } from '@/types/proposal-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Check, Lightbulb, Sparkles, DollarSign, FileText, BarChart3 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';

interface AIContentRecommendationsProps {
  proposal: Proposal;
  onApplyRecommendation: (recommendation: ProposalRecommendation) => Promise<void>;
}

const AIContentRecommendations: React.FC<AIContentRecommendationsProps> = ({
  proposal,
  onApplyRecommendation
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [recommendations, setRecommendations] = useState<ProposalRecommendation[]>([]);
  const [appliedRecommendations, setAppliedRecommendations] = useState<string[]>([]);
  
  useEffect(() => {
    // In a real implementation, this would call an API to get AI recommendations
    // For demo purposes, we'll simulate loading then return pre-defined recommendations
    const loadRecommendations = async () => {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Sample recommendations (in a real app, these would come from the AI model)
      const demoRecommendations: ProposalRecommendation[] = [
        {
          id: "1",
          title: "Add a case study section",
          description: "Based on similar successful proposals, adding a relevant case study can increase acceptance by 27%.",
          confidence_score: 0.87,
          category: "section",
          content: "<section><h3>Case Study: Successful Community Transformation</h3><p>In 2022, we helped Oakridge Estates increase property values by 15% through strategic improvements and enhanced management practices...</p></section>",
          proposal_id: proposal.id,
          created_at: new Date().toISOString()
        },
        {
          id: "2",
          title: "Improve pricing clarity",
          description: "Your pricing structure could benefit from a more detailed breakdown of services included.",
          confidence_score: 0.92,
          category: "pricing",
          content: "<div class='pricing-table'><h3>Transparent Pricing Structure</h3><table><tr><th>Service</th><th>Monthly Fee</th><th>What's Included</th></tr><!-- More rows would go here --></table></div>",
          proposal_id: proposal.id,
          created_at: new Date().toISOString()
        },
        {
          id: "3",
          title: "Use more confident language",
          description: "Phrases like 'we think' or 'we believe' could be replaced with more assertive statements.",
          confidence_score: 0.78,
          category: "language",
          content: "",
          proposal_id: proposal.id,
          created_at: new Date().toISOString()
        },
        {
          id: "4",
          title: "Add executive summary",
          description: "An executive summary at the beginning would help busy decision-makers quickly understand your value proposition.",
          confidence_score: 0.95,
          category: "structure",
          content: "<section class='executive-summary'><h2>Executive Summary</h2><p>This proposal offers a comprehensive management solution that will enhance property values, improve resident satisfaction, and ensure financial stability through...</p></section>",
          proposal_id: proposal.id,
          created_at: new Date().toISOString()
        },
        {
          id: "5",
          title: "Add testimonials section",
          description: "Similar successful proposals include client testimonials to build credibility.",
          confidence_score: 0.85,
          category: "section",
          content: "<section class='testimonials'><h3>What Our Clients Say</h3><blockquote>\"Their management transformed our community. Resident satisfaction is up 45% and our reserve fund has never been healthier.\"<br/><cite>— Jane Smith, Board President, Willow Creek HOA</cite></blockquote></section>",
          proposal_id: proposal.id,
          created_at: new Date().toISOString()
        }
      ];
      
      setRecommendations(demoRecommendations);
      setIsLoading(false);
    };
    
    loadRecommendations();
  }, [proposal.id]);
  
  const handleApplyRecommendation = async (recommendation: ProposalRecommendation) => {
    try {
      await onApplyRecommendation(recommendation);
      setAppliedRecommendations(prev => [...prev, recommendation.id]);
      
      toast({
        title: "Recommendation Applied",
        description: `"${recommendation.title}" has been applied to your proposal.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply the recommendation. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const filteredRecommendations = activeTab === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.category === activeTab);
  
  const getRecommendationIcon = (category: string) => {
    switch (category) {
      case 'section':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'pricing':
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case 'language':
        return <Sparkles className="h-5 w-5 text-purple-500" />;
      case 'structure':
        return <BarChart3 className="h-5 w-5 text-orange-500" />;
      default:
        return <Lightbulb className="h-5 w-5 text-yellow-500" />;
    }
  };
  
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'section':
        return 'Content Section';
      case 'pricing':
        return 'Pricing Strategy';
      case 'language':
        return 'Language Optimization';
      case 'structure':
        return 'Document Structure';
      default:
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };
  
  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <Skeleton className="h-8 w-full" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Lightbulb className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">AI-Generated Recommendations</h2>
              <p className="text-muted-foreground">
                Our AI has analyzed {proposal.name} and found {recommendations.length} ways to potentially improve it.
              </p>
            </div>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="all">All Recommendations</TabsTrigger>
              <TabsTrigger value="section">Content</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="language">Language</TabsTrigger>
              <TabsTrigger value="structure">Structure</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-4">
              {filteredRecommendations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No recommendations available in this category.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRecommendations.map((recommendation) => (
                    <Card key={recommendation.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-3">
                            {getRecommendationIcon(recommendation.category)}
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">{recommendation.title}</h3>
                                <Badge variant="outline">
                                  {getCategoryLabel(recommendation.category)}
                                </Badge>
                              </div>
                              <p className="text-muted-foreground text-sm">
                                {recommendation.description}
                              </p>
                              <div className="mt-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <span>Confidence:</span>
                                  <Progress 
                                    value={recommendation.confidence_score * 100} 
                                    className="h-2 w-24"
                                  />
                                  <span className="text-muted-foreground">
                                    {Math.round(recommendation.confidence_score * 100)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            {appliedRecommendations.includes(recommendation.id) ? (
                              <Button variant="outline" disabled>
                                <Check className="h-4 w-4 mr-2 text-green-500" />
                                Applied
                              </Button>
                            ) : (
                              <Button 
                                onClick={() => handleApplyRecommendation(recommendation)}
                              >
                                Apply
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default AIContentRecommendations;
