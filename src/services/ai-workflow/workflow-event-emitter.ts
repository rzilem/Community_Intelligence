
import { automationRulesEngine } from './automation-rules-engine';
import { devLog } from '@/utils/dev-logger';

export interface WorkflowEvent {
  type: string;
  data: any;
  associationId: string;
  timestamp: string;
}

export class WorkflowEventEmitter {
  private static instance: WorkflowEventEmitter;
  
  static getInstance(): WorkflowEventEmitter {
    if (!WorkflowEventEmitter.instance) {
      WorkflowEventEmitter.instance = new WorkflowEventEmitter();
    }
    return WorkflowEventEmitter.instance;
  }

  async emit(eventType: string, eventData: any, associationId: string): Promise<void> {
    try {
      const event: WorkflowEvent = {
        type: eventType,
        data: eventData,
        associationId,
        timestamp: new Date().toISOString()
      };

      devLog.info(`Emitting workflow event: ${eventType}`, { associationId, eventData });

      // Trigger automation rules evaluation
      const triggeredRules = await automationRulesEngine.evaluateEvent(eventType, eventData);
    } catch (error) {
      devLog.error('Failed to emit workflow event', error);
    }
  }

  // Convenience methods for common events
  async emitMaintenanceRequest(requestData: any, associationId: string): Promise<void> {
    await this.emit('maintenance_request_created', requestData, associationId);
  }

  async emitPaymentReceived(paymentData: any, associationId: string): Promise<void> {
    await this.emit('payment_received', paymentData, associationId);
  }

  async emitDocumentUploaded(documentData: any, associationId: string): Promise<void> {
    await this.emit('document_uploaded', documentData, associationId);
  }

  async emitCommunicationReceived(messageData: any, associationId: string): Promise<void> {
    await this.emit('communication_received', messageData, associationId);
  }

  async emitComplianceIssue(issueData: any, associationId: string): Promise<void> {
    await this.emit('compliance_issue_created', issueData, associationId);
  }

  async emitWorkflowCompleted(workflowData: any, associationId: string): Promise<void> {
    await this.emit('workflow_completed', workflowData, associationId);
  }
}

export const workflowEventEmitter = WorkflowEventEmitter.getInstance();
