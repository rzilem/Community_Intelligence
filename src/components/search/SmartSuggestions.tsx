
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, TrendingUp, Zap } from 'lucide-react';

interface SmartSuggestion {
  id: string;
  type: 'autocomplete' | 'intent' | 'popular' | 'contextual';
  text: string;
  description?: string;
  query: string;
  filters?: any;
  confidence: number;
}

interface SmartSuggestionsProps {
  query: string;
  onSelectSuggestion: (query: string, filters?: any) => void;
  context?: {
    currentPage?: string;
    userRole?: string;
    recentActivity?: string[];
  };
}

const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({
  query,
  onSelectSuggestion,
  context
}) => {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);

  // Generate smart suggestions based on query and context
  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const generateSuggestions = () => {
      const newSuggestions: SmartSuggestion[] = [];

      // Autocomplete suggestions
      const autocompleteTerms = [
        'invoices', 'requests', 'associations', 'properties', 'vendors', 
        'leads', 'maintenance', 'compliance', 'payments', 'documents'
      ];
      
      autocompleteTerms
        .filter(term => term.toLowerCase().includes(query.toLowerCase()))
        .forEach((term, index) => {
          newSuggestions.push({
            id: `autocomplete-${index}`,
            type: 'autocomplete',
            text: term,
            query: term,
            confidence: 0.8
          });
        });

      // Intent detection suggestions
      const intentPatterns = [
        {
          pattern: /overdue|late|past.*due/i,
          suggestion: {
            text: 'Overdue invoices',
            description: 'Find all overdue invoices',
            query: 'invoices',
            filters: { status: ['overdue'] }
          }
        },
        {
          pattern: /urgent|emergency|high.*priority/i,
          suggestion: {
            text: 'High priority requests',
            description: 'Show urgent maintenance requests',
            query: 'requests',
            filters: { priority: ['high', 'urgent'] }
          }
        },
        {
          pattern: /new|recent|today/i,
          suggestion: {
            text: 'Recent items',
            description: 'Items from the last 7 days',
            query: query,
            filters: { 
              dateRange: { 
                start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                end: new Date().toISOString().split('T')[0]
              }
            }
          }
        },
        {
          pattern: /pending|waiting|review/i,
          suggestion: {
            text: 'Pending items',
            description: 'Items waiting for action',
            query: query,
            filters: { status: ['pending', 'review'] }
          }
        }
      ];

      intentPatterns.forEach((pattern, index) => {
        if (pattern.pattern.test(query)) {
          newSuggestions.push({
            id: `intent-${index}`,
            type: 'intent',
            ...pattern.suggestion,
            confidence: 0.9
          });
        }
      });

      // Popular/trending suggestions
      const popularQueries = [
        { text: 'Monthly invoices', query: 'invoices type:monthly' },
        { text: 'Open maintenance requests', query: 'requests status:open' },
        { text: 'Active associations', query: 'associations status:active' },
        { text: 'Recent leads', query: 'leads after:2024-01-01' }
      ];

      if (query.length === 2) {
        popularQueries.forEach((popular, index) => {
          if (popular.text.toLowerCase().includes(query.toLowerCase())) {
            newSuggestions.push({
              id: `popular-${index}`,
              type: 'popular',
              text: popular.text,
              query: popular.query,
              confidence: 0.7
            });
          }
        });
      }

      // Contextual suggestions based on current page
      if (context?.currentPage === '/dashboard') {
        newSuggestions.push({
          id: 'contextual-dashboard',
          type: 'contextual',
          text: 'Dashboard summary',
          description: 'Overview of recent activity',
          query: 'summary recent:7days',
          confidence: 0.6
        });
      }

      // Typo correction
      const commonTypos = {
        'asocitation': 'association',
        'invoic': 'invoice',
        'requeset': 'request',
        'maintenace': 'maintenance',
        'propertie': 'property'
      };

      Object.entries(commonTypos).forEach(([typo, correction], index) => {
        if (query.toLowerCase().includes(typo)) {
          newSuggestions.push({
            id: `typo-${index}`,
            type: 'autocomplete',
            text: `Did you mean "${correction}"?`,
            query: query.toLowerCase().replace(typo, correction),
            confidence: 0.95
          });
        }
      });

      // Sort by confidence and limit results
      return newSuggestions
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 6);
    };

    setSuggestions(generateSuggestions());
  }, [query, context]);

  if (suggestions.length === 0) {
    return null;
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'intent':
        return <Lightbulb className="h-3 w-3" />;
      case 'popular':
        return <TrendingUp className="h-3 w-3" />;
      case 'contextual':
        return <Zap className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'intent':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
      case 'popular':
        return 'bg-green-100 text-green-700 hover:bg-green-200';
      case 'contextual':
        return 'bg-purple-100 text-purple-700 hover:bg-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
  };

  return (
    <div className="space-y-2 p-2 border-t">
      <div className="text-xs font-medium text-muted-foreground">Smart Suggestions</div>
      <div className="space-y-1">
        {suggestions.map((suggestion) => (
          <Button
            key={suggestion.id}
            variant="ghost"
            size="sm"
            className={`w-full justify-start h-auto p-2 ${getSuggestionColor(suggestion.type)}`}
            onClick={() => onSelectSuggestion(suggestion.query, suggestion.filters)}
          >
            <div className="flex items-start gap-2 w-full">
              {getSuggestionIcon(suggestion.type)}
              <div className="flex-1 text-left">
                <div className="text-sm">{suggestion.text}</div>
                {suggestion.description && (
                  <div className="text-xs opacity-70">{suggestion.description}</div>
                )}
              </div>
              {suggestion.type !== 'autocomplete' && (
                <Badge variant="secondary" className="text-xs ml-auto">
                  {suggestion.type}
                </Badge>
              )}
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SmartSuggestions;
