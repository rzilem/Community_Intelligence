import { CommunicationLogEntry } from '@/types/communication-types';

// Mock data for communication logs
const mockCommunicationLogs: CommunicationLogEntry[] = [
  {
    id: 'log-1',
    tracking_number: 'CI-000001',
    communication_type: 'email',
    received_at: new Date().toISOString(),
    status: 'completed',
    metadata: { subject: 'Monthly Newsletter', recipient: 'residents@hoa.com' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'log-2',
    tracking_number: 'CI-000002',
    communication_type: 'letter',
    received_at: new Date().toISOString(),
    status: 'processing',
    metadata: { subject: 'Violation Notice', recipient: 'homeowner@example.com' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let nextTrackingNumber = 3;

/**
 * Gets the communications log entries, optionally filtered by type
 */
export async function getCommunicationLogs(type?: string): Promise<CommunicationLogEntry[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  if (type) {
    return mockCommunicationLogs.filter(log => log.communication_type === type);
  }
  
  return [...mockCommunicationLogs];
}

/**
 * Gets a specific communication log by tracking number
 */
export async function getCommunicationLogByTrackingNumber(trackingNumber: string): Promise<CommunicationLogEntry | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const log = mockCommunicationLogs.find(log => log.tracking_number === trackingNumber);
  return log || null;
}

/**
 * Generates a new tracking number for various communication types.
 */
export async function getNextTrackingNumber(): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const trackingNumber = `CI-${String(nextTrackingNumber).padStart(6, '0')}`;
  nextTrackingNumber++;
  
  console.log(`Generated tracking number: ${trackingNumber}`);
  return trackingNumber;
}

/**
 * Registers a communication in the communications log
 */
export async function registerCommunication(
  trackingNumber: string, 
  communicationType: string, 
  metadata: Record<string, any>
): Promise<CommunicationLogEntry | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const newEntry: CommunicationLogEntry = {
    id: `log-${Date.now()}`,
    tracking_number: trackingNumber,
    communication_type: communicationType,
    metadata,
    received_at: new Date().toISOString(),
    status: 'received',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  mockCommunicationLogs.push(newEntry);
  
  console.log(`Registered ${communicationType} communication with tracking number: ${trackingNumber}`);
  return newEntry;
}

/**
 * Updates the status of a communication log entry
 */
export async function updateCommunicationStatus(
  trackingNumber: string, 
  status: 'received' | 'processing' | 'completed' | 'failed',
  processedDate?: Date
): Promise<boolean> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const logIndex = mockCommunicationLogs.findIndex(log => log.tracking_number === trackingNumber);
  
  if (logIndex === -1) {
    console.error('Communication log not found:', trackingNumber);
    return false;
  }
  
  mockCommunicationLogs[logIndex].status = status;
  
  if (status === 'completed' || status === 'failed') {
    mockCommunicationLogs[logIndex].processed_at = processedDate?.toISOString() || new Date().toISOString();
  }
  
  console.log(`Updated communication ${trackingNumber} status to ${status}`);
  return true;
}