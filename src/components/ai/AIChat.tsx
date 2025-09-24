import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  FileText, 
  Upload, 
  Brain,
  MessageSquare,
  Lightbulb,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { communityIntelligenceAI, AIMessage, AIInsight, SmartSuggestion } from '@/services/ai/CommunityIntelligenceAI';

interface AIChatProps {
  associationId?: string;
  initialContext?: Record<string, any>;
  className?: string;
  onInsightGenerated?: (insight: AIInsight) => void;
  onSuggestionGenerated?: (suggestion: SmartSuggestion) => void;
}

export default function AIChat({ 
  associationId, 
  initialContext, 
  className = '',
  onInsightGenerated,
  onSuggestionGenerated
}: AIChatProps) {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I'm Community Intelligence, your AI assistant for HOA and condominium management. I can help you with:

• **Property Management** - Maintenance schedules, vendor coordination, compliance tracking
• **Financial Analysis** - Budget planning, expense optimization, financial reporting
• **Communication** - Resident relations, board communications, complaint resolution
• **Document Analysis** - Contract review, policy interpretation, compliance checking
• **Predictive Insights** - Trend analysis, forecasting, risk assessment

How can I assist you today?`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: AIMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await communityIntelligenceAI.sendChatMessage(
        inputMessage,
        messages.filter(msg => msg.role !== 'system'),
        associationId,
        initialContext
      );

      const assistantMessage: AIMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save conversation if we don't have an ID yet
      if (!conversationId) {
        const newConversationId = await communityIntelligenceAI.saveConversation({
          user_id: 'current-user', // This would come from auth context
          association_id: associationId,
          title: inputMessage.substring(0, 50),
          messages: [...messages, userMessage, assistantMessage],
          status: 'active'
        });
        setConversationId(newConversationId);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      
      const errorMessage: AIMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please ensure your OpenAI API key is configured correctly and try again.',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // For now, just show that a file was uploaded
    // In a full implementation, this would read and analyze the file
    const fileMessage: AIMessage = {
      id: `file-${Date.now()}`,
      role: 'user',
      content: `📎 Uploaded file: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`,
      metadata: { 
        type: 'file_upload', 
        filename: file.name,
        size: file.size,
        fileType: file.type 
      },
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, fileMessage]);
    toast.success(`File "${file.name}" uploaded successfully`);
  };

  const generateInsights = async () => {
    setIsLoading(true);
    try {
      // Mock data for demonstration - in real implementation, this would come from the database
      const mockData = {
        recent_maintenance: [],
        financial_summary: {},
        resident_communications: [],
        association_id: associationId
      };

      const suggestions = await communityIntelligenceAI.generateSmartSuggestions(mockData, associationId);
      
      if (suggestions.length > 0) {
        const insightMessage: AIMessage = {
          id: `insights-${Date.now()}`,
          role: 'assistant',
          content: `I've generated ${suggestions.length} smart suggestions for your HOA:

${suggestions.map((suggestion, index) => 
  `**${index + 1}. ${suggestion.title}** (${suggestion.priority} priority)
${suggestion.description}
${suggestion.suggested_actions.map(action => `• ${action}`).join('\n')}`
).join('\n\n')}`,
          metadata: { type: 'insights', suggestions },
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, insightMessage]);
        
        // Notify parent components
        suggestions.forEach(suggestion => {
          onSuggestionGenerated?.(suggestion);
        });
        
        toast.success(`Generated ${suggestions.length} smart suggestions`);
      } else {
        toast.info('No specific suggestions available at this time');
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error('Failed to generate insights');
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessage = (message: AIMessage) => {
    // Convert markdown-like formatting to JSX
    const content = message.content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/•/g, '•');

    return (
      <div
        dangerouslySetInnerHTML={{ __html: content }}
        className="whitespace-pre-wrap"
      />
    );
  };

  return (
    <Card className={`flex flex-col h-[600px] ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Community Intelligence
          {associationId && (
            <Badge variant="secondary" className="ml-auto">
              HOA: {associationId.substring(0, 8)}...
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Quick Actions */}
        <div className="flex gap-2 px-4 pb-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={generateInsights}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            <Lightbulb className="h-3 w-3" />
            Generate Insights
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1"
          >
            <Upload className="h-3 w-3" />
            Upload Document
          </Button>
        </div>

        <Separator />

        {/* Messages */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 bg-primary">
                    <AvatarFallback>
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'bg-muted'
                  }`}
                >
                  {formatMessage(message)}
                  
                  {message.metadata?.type === 'file_upload' && (
                    <div className="flex items-center gap-2 mt-2 text-xs opacity-75">
                      <FileText className="h-3 w-3" />
                      {message.metadata.filename}
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 bg-secondary">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start gap-3">
                <Avatar className="h-8 w-8 bg-primary">
                  <AvatarFallback>
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-3 py-2 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <Separator />

        {/* Input */}
        <div className="p-4">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about HOA management, analyze documents, or request insights..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!inputMessage.trim() || isLoading}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls"
        />
      </CardContent>
    </Card>
  );
}