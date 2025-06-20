import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { communicationIntelligenceHub } from '@/services/ai-workflow/communication-intelligence-hub';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Loader2 } from 'lucide-react';

interface AIStats {
  ai_processed: number | null;
  total_invoices: number | null;
  high_confidence: number | null;
  low_confidence: number | null;
  needs_review: number | null;
  avg_confidence: number | null;
}

interface CommAnalytics {
  totalMessages: number;
  categoryBreakdown: Record<string, number>;
  sentimentAnalysis: { average: number; positive: number; neutral: number; negative: number };
  trendsOverTime: { date: string; messageCount: number; averageSentiment: number }[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c'];

const AIAnalytics: React.FC = () => {
  const { currentAssociation } = useAuth();
  const [aiStats, setAIStats] = useState<AIStats | null>(null);
  const [commAnalytics, setCommAnalytics] = useState<CommAnalytics | null>(null);
  const [apiUsage, setApiUsage] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentAssociation) return;
      setLoading(true);
      try {
        const statsUrl = `ai-stats?association_id=${currentAssociation.id}`;
        const { data: statsData } = await supabase.functions.invoke(statsUrl, { method: 'GET' });
        setAIStats(statsData?.stats || null);

        const analytics = await communicationIntelligenceHub.getAnalytics(currentAssociation.id);
        setCommAnalytics(analytics);

        const { data: secret } = await supabase.rpc('get_secret', { secret_name: 'OPENAI_API_KEY' });
        if (secret) {
          const { data: usageData } = await supabase.functions.invoke('test-openai-connection', {
            body: {
              apiKey: secret,
              model: 'gpt-4o-mini',
              testPrompt: 'Check usage'
            }
          });
          setApiUsage(usageData?.usage || null);
        }
      } catch (err) {
        console.error('Failed to fetch AI analytics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentAssociation]);

  const categoryData = commAnalytics
    ? Object.entries(commAnalytics.categoryBreakdown).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        <h1 className="text-3xl font-bold">AI Analytics</h1>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Processing Stats</CardTitle>
              </CardHeader>
              <CardContent>
                {aiStats ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Invoices</p>
                      <p className="text-2xl font-bold">{aiStats.total_invoices ?? '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Processed</p>
                      <p className="text-2xl font-bold">{aiStats.ai_processed ?? '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Needs Review</p>
                      <p className="text-2xl font-bold">{aiStats.needs_review ?? '-'}</p>
                    </div>
                  </div>
                ) : (
                  <p>No stats available</p>
                )}
              </CardContent>
            </Card>

            {commAnalytics && (
              <Card>
                <CardHeader>
                  <CardTitle>Communication Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={commAnalytics.trendsOverTime} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip />
                          <Line yAxisId="left" type="monotone" dataKey="messageCount" stroke="#3b82f6" name="Messages" />
                          <Line yAxisId="right" type="monotone" dataKey="averageSentiment" stroke="#ef4444" name="Sentiment" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>OpenAI API Usage</CardTitle>
              </CardHeader>
              <CardContent>
                {apiUsage ? (
                  <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(apiUsage, null, 2)}</pre>
                ) : (
                  <p>No usage data available.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AIAnalytics;
