
export interface MessageHistoryItem {
  id: string;
  subject: string;
  type: "email" | "sms";
  recipients: number;
  sentDate: string;
  status: string;
  openRate?: number;
}
