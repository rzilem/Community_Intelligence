
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Proposal, ProposalRecommendation } from '@/types/proposal-types';
import { Lightbulb, Sparkles, ChevronRight, Loader2, Plus, Check, Percent } from 'lucide-react';
import { toast } from 'sonner';

interface AIContentRecommendationsProps {
  proposal: Proposal;
  onApplyRecommendation: (recommendation: ProposalRecommendation) => void;
}

const AIContentRecommendations: React.FC<AIContentRecommendationsProps> = ({ 
  proposal,
  onApplyRecommendation
}) => {
  const [recommendations, setRecommendations] = useState<ProposalRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('sections');
  
  // This would ideally call an API endpoint that uses AI to generate recommendations
  const generateRecommendations = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call with sample data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Demo data - in a real implementation, this would come from an AI model
      const demoRecommendations: ProposalRecommendation[] = [
        {
          id: '1',
          title: 'Add Client Testimonials Section',
          description: 'Based on successful proposals, adding testimonials from similar clients increases conversion by 32%',
          confidence_score: 0.92,
          category: 'section',
          content: '<h3>Client Success Stories</h3><div class="testimonial"><p>"Since partnering with our management company, we\'ve seen a 45% reduction in maintenance costs and significantly improved resident satisfaction."</p><p class="client">— Oakridge HOA Board</p></div>',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Modify Pricing Structure',
          description: 'Clients in this size range respond better to tiered pricing with clear value propositions',
          confidence_score: 0.85,
          category: 'pricing',
          content: '<h3>Flexible Management Options</h3><div class="pricing-tiers"><div class="tier"><h4>Essential</h4><p class="price">$X per unit/month</p><ul><li>Core services included</li></ul></div><div class="tier highlight"><h4>Premium</h4><p class="price">$Y per unit/month</p><ul><li>All essential services plus...</li></ul></div></div>',
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          title: 'Use More Direct Language',
          description: 'Simplify complex paragraphs for better engagement and clarity',
          confidence_score: 0.78,
          category: 'language',
          content: 'We'll deliver a complete management solution tailored to your community's unique needs with transparent pricing and responsive service.',
          created_at: new Date().toISOString()
        }
      ];
      
      setRecommendations(demoRecommendations);
    } catch (error) {
      toast.error('Failed to generate recommendations');
      console.error('Error generating recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // For demo purposes, auto-generate recommendations
    if (recommendations.length === 0) {
      generateRecommendations();
    }
  }, []);
  
  const getScoreBadgeColor = (score: number) => {
    if (score >= 0.9) return 'bg-green-100 text-green-800';
    if (score >= 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };
  
  const filteredRecommendations = recommendations.filter(
    rec => rec.category === activeTab
  );
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-lg">AI Content Recommendations</CardTitle>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={generateRecommendations} 
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lightbulb className="h-4 w-4 mr-2" />}
            {isLoading ? 'Analyzing...' : 'Refresh Ideas'}
          </Button>
        </div>
        <CardDescription>
          AI-powered suggestions to improve your proposal's effectiveness
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-4" />
            <p className="text-sm text-muted-foreground">
              Analyzing proposal content and client data...
            </p>
          </div>
        ) : (
          <>
            <Tabs defaultValue="sections" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="sections">Content Sections</TabsTrigger>
                <TabsTrigger value="pricing">Pricing Strategy</TabsTrigger>
                <TabsTrigger value="language">Language</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-0">
                {filteredRecommendations.length > 0 ? (
                  <div className="space-y-3">
                    {filteredRecommendations.map((recommendation) => (
                      <Card key={recommendation.id} className="overflow-hidden">
                        <div className="p-4 border-b">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium">{recommendation.title}</h3>
                            <Badge variant="outline" className={getScoreBadgeColor(recommendation.confidence_score)}>
                              <Percent className="h-3 w-3 mr-1" />
                              {Math.round(recommendation.confidence_score * 100)}% match
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {recommendation.description}
                          </p>
                        </div>
                        <div className="bg-accent/50 p-3">
                          <div className="flex justify-end">
                            <Button 
                              size="sm" 
                              variant="default"
                              className="text-xs"
                              onClick={() => onApplyRecommendation(recommendation)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Apply to Proposal
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-sm text-muted-foreground">
                      No recommendations available for this category
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AIContentRecommendations;
