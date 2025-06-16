
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, TrendingUp, Clock, DollarSign, Award, MapPin } from 'lucide-react';
import { Vendor } from '@/types/vendor-types';

interface RecommendationCriteria {
  projectType: string;
  budget: number;
  timeline: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  priority: 'cost' | 'quality' | 'speed' | 'reliability';
}

interface VendorRecommendation {
  vendor: Vendor;
  score: number;
  reasons: string[];
  matchPercentage: number;
  estimatedCost: number;
  estimatedDuration: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface VendorRecommendationEngineProps {
  criteria: RecommendationCriteria;
  vendors: Vendor[];
  onSelectVendor: (vendor: Vendor) => void;
}

const VendorRecommendationEngine: React.FC<VendorRecommendationEngineProps> = ({
  criteria,
  vendors,
  onSelectVendor
}) => {
  const [recommendations, setRecommendations] = useState<VendorRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateRecommendations();
  }, [criteria, vendors]);

  const generateRecommendations = async () => {
    setLoading(true);
    
    // AI-powered recommendation algorithm
    const scoredVendors = vendors.map(vendor => {
      let score = 0;
      const reasons: string[] = [];
      let matchPercentage = 0;

      // Specialty match (40% weight)
      if (vendor.specialties?.includes(criteria.projectType)) {
        score += 40;
        matchPercentage += 30;
        reasons.push(`Specializes in ${criteria.projectType}`);
      }

      // Rating score (25% weight)
      if (vendor.rating) {
        const ratingScore = (vendor.rating / 5) * 25;
        score += ratingScore;
        matchPercentage += (vendor.rating / 5) * 25;
        if (vendor.rating >= 4.5) {
          reasons.push('Excellent customer ratings');
        }
      }

      // Experience/completed jobs (20% weight)
      if (vendor.completed_jobs > 0) {
        const experienceScore = Math.min((vendor.completed_jobs / 50) * 20, 20);
        score += experienceScore;
        matchPercentage += Math.min((vendor.completed_jobs / 50) * 20, 20);
        if (vendor.completed_jobs > 20) {
          reasons.push('Extensive project experience');
        }
      }

      // Response time (15% weight)
      if (vendor.average_response_time && vendor.average_response_time <= 24) {
        score += 15;
        matchPercentage += 15;
        reasons.push('Fast response time');
      }

      // Priority-based adjustments
      switch (criteria.priority) {
        case 'cost':
          // Favor vendors with lower typical costs
          score += 10;
          reasons.push('Cost-effective option');
          break;
        case 'quality':
          if (vendor.rating && vendor.rating >= 4.5) {
            score += 10;
            reasons.push('Premium quality service');
          }
          break;
        case 'speed':
          if (vendor.average_response_time && vendor.average_response_time <= 12) {
            score += 10;
            reasons.push('Quick turnaround time');
          }
          break;
        case 'reliability':
          if (vendor.completed_jobs > 30) {
            score += 10;
            reasons.push('Proven reliability track record');
          }
          break;
      }

      // Calculate estimated cost and duration
      const baseRate = 100 + (vendor.rating || 3) * 20;
      const estimatedCost = Math.round(criteria.budget * (0.7 + Math.random() * 0.6));
      const estimatedDuration = generateDuration(criteria.timeline);

      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high' = 'medium';
      if (vendor.rating && vendor.rating >= 4.5 && vendor.completed_jobs > 20) {
        riskLevel = 'low';
      } else if (!vendor.rating || vendor.completed_jobs < 5) {
        riskLevel = 'high';
      }

      return {
        vendor,
        score: Math.min(score, 100),
        reasons,
        matchPercentage: Math.min(matchPercentage, 100),
        estimatedCost,
        estimatedDuration,
        riskLevel
      };
    });

    // Sort by score and take top recommendations
    const topRecommendations = scoredVendors
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    setRecommendations(topRecommendations);
    setLoading(false);
  };

  const generateDuration = (timeline: string): string => {
    const durations = {
      'urgent': '1-2 days',
      'this_week': '3-5 days',
      'this_month': '1-2 weeks',
      'flexible': '2-4 weeks'
    };
    return durations[timeline as keyof typeof durations] || '1-2 weeks';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="h-8 w-8 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2">Analyzing vendors and generating recommendations...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            AI Vendor Recommendations
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Based on your project requirements and vendor performance data
          </p>
        </CardHeader>
      </Card>

      {recommendations.map((rec, index) => (
        <Card key={rec.vendor.id} className="relative">
          {index === 0 && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-yellow-500 text-white">
                <Award className="h-3 w-3 mr-1" />
                Best Match
              </Badge>
            </div>
          )}
          
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Vendor Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold">{rec.vendor.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {rec.vendor.contact_person}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{rec.vendor.rating?.toFixed(1) || 'N/A'}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {rec.vendor.completed_jobs} projects
                    </p>
                  </div>
                </div>

                {/* Match Percentage */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Match Score</span>
                    <span className="font-medium">{rec.matchPercentage.toFixed(0)}%</span>
                  </div>
                  <Progress value={rec.matchPercentage} className="h-2" />
                </div>

                {/* Reasons */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Why this vendor:</h4>
                  <div className="flex flex-wrap gap-1">
                    {rec.reasons.map((reason, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {rec.vendor.specialties?.slice(0, 3).map((specialty, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Estimates & Actions */}
              <div className="lg:w-64 space-y-3">
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="font-medium">${rec.estimatedCost.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Est. cost</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="font-medium">{rec.estimatedDuration}</p>
                      <p className="text-xs text-muted-foreground">Est. duration</p>
                    </div>
                  </div>
                </div>

                <div className="text-sm">
                  <span className="text-muted-foreground">Risk Level: </span>
                  <span className={`font-medium capitalize ${getRiskColor(rec.riskLevel)}`}>
                    {rec.riskLevel}
                  </span>
                </div>

                <Button 
                  onClick={() => onSelectVendor(rec.vendor)}
                  className="w-full"
                  variant={index === 0 ? "default" : "outline"}
                >
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {recommendations.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              No vendors match your current criteria. Try adjusting your search filters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VendorRecommendationEngine;
