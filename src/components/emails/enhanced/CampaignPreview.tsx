
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Users, Mail } from 'lucide-react';
import { SafeHtml } from '@/components/security/SafeHtml';

interface CampaignPreviewProps {
  subject: string;
  body: string;
  recipientCount: number;
}

export const CampaignPreview: React.FC<CampaignPreviewProps> = ({
  subject,
  body,
  recipientCount
}) => {
  const renderBodyWithMergeTags = (content: string) => {
    return content.replace(/\{\{(\w+)\}\}/g, (match, tag) => {
      const sampleData: Record<string, string> = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        companyName: 'Acme Corp',
        phone: '(555) 123-4567'
      };
      return sampleData[tag] || match;
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Email Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {recipientCount} recipients
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                Email Campaign
              </Badge>
            </div>

            <div className="border rounded-lg overflow-hidden">
              {/* Email Header */}
              <div className="bg-muted p-4 border-b">
                <div className="text-sm text-muted-foreground">Subject:</div>
                <div className="font-medium">
                  {renderBodyWithMergeTags(subject) || 'No subject'}
                </div>
              </div>

              {/* Email Body */}
              <div className="p-6 bg-white min-h-[400px]">
                {body ? (
                  <SafeHtml 
                    html={renderBodyWithMergeTags(body)} 
                    className="prose max-w-none"
                  />
                ) : (
                  <div className="text-muted-foreground italic">
                    Email content will appear here...
                  </div>
                )}
              </div>

              {/* Email Footer */}
              <div className="bg-muted/50 p-4 border-t text-sm text-muted-foreground">
                <div className="text-center space-y-1">
                  <div>This email was sent by Your Company Name</div>
                  <div>
                    <a href="#" className="hover:underline">Unsubscribe</a> | 
                    <a href="#" className="hover:underline ml-1">View in browser</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Recipients</div>
              <div className="text-2xl font-bold">{recipientCount}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Subject Length</div>
              <div className="text-2xl font-bold">{subject.length}</div>
              {subject.length > 60 && (
                <div className="text-xs text-orange-600">
                  Subject may be truncated in some email clients
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
