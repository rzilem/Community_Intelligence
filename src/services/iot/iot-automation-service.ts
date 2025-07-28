export interface IoTAutomation {
  id: string;
  association_id: string;
  name: string;
  description?: string;
  trigger_conditions: {
    type: 'sensor_threshold' | 'time_based' | 'device_status' | 'manual';
    conditions: Array<{
      device_id?: string;
      sensor_type?: string;
      operator: '>' | '<' | '=' | '>=' | '<=' | '!=';
      value?: number | string;
      time_condition?: string;
    }>;
  };
  actions: Array<{
    type: 'device_command' | 'notification' | 'alert' | 'email';
    target_device_id?: string;
    command?: string;
    parameters?: Record<string, any>;
    notification_type?: string;
    message?: string;
    recipients?: string[];
  }>;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  last_executed?: string;
}

export interface IoTDeviceCommand {
  id: string;
  device_id: string;
  command_type: string;
  command_data: Record<string, any>;
  status: 'pending' | 'sent' | 'executed' | 'failed';
  response_data?: Record<string, any>;
  sent_at?: string;
  completed_at?: string;
  created_by?: string;
  created_at: string;
}

// Mock data for demonstration
const mockAutomations: IoTAutomation[] = [
  {
    id: '1',
    association_id: '1',
    name: 'Pool Temperature Control',
    description: 'Automatically adjust pool heating based on temperature',
    trigger_conditions: {
      type: 'sensor_threshold',
      conditions: [
        {
          device_id: 'pool-sensor-1',
          sensor_type: 'temperature',
          operator: '<',
          value: 78
        }
      ]
    },
    actions: [
      {
        type: 'device_command',
        target_device_id: 'pool-heater-1',
        command: 'turn_on',
        parameters: { target_temp: 80 }
      }
    ],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

class IoTAutomationService {
  async getAutomations(associationId: string): Promise<IoTAutomation[]> {
    // Mock implementation - return filtered mock data
    return mockAutomations.filter(a => a.association_id === associationId);
  }

  async getAutomation(automationId: string): Promise<IoTAutomation | null> {
    return mockAutomations.find(a => a.id === automationId) || null;
  }

  async createAutomation(automation: Omit<IoTAutomation, 'id' | 'created_at' | 'updated_at'>): Promise<IoTAutomation> {
    const newAutomation: IoTAutomation = {
      ...automation,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    mockAutomations.push(newAutomation);
    return newAutomation;
  }

  async updateAutomation(automationId: string, updates: Partial<IoTAutomation>): Promise<IoTAutomation> {
    const index = mockAutomations.findIndex(a => a.id === automationId);
    if (index === -1) throw new Error('Automation not found');
    
    mockAutomations[index] = { 
      ...mockAutomations[index], 
      ...updates, 
      updated_at: new Date().toISOString() 
    };
    return mockAutomations[index];
  }

  async deleteAutomation(automationId: string): Promise<void> {
    const index = mockAutomations.findIndex(a => a.id === automationId);
    if (index === -1) throw new Error('Automation not found');
    mockAutomations.splice(index, 1);
  }

  async toggleAutomation(automationId: string, isActive: boolean): Promise<IoTAutomation> {
    return this.updateAutomation(automationId, { is_active: isActive });
  }

  async executeAutomation(automationId: string, triggerData?: Record<string, any>): Promise<void> {
    const automation = await this.getAutomation(automationId);
    if (!automation || !automation.is_active) return;

    // Mock execution - just update last_executed
    await this.updateAutomation(automationId, { 
      last_executed: new Date().toISOString() 
    });
  }

  private async executeAction(action: IoTAutomation['actions'][0], triggerData?: Record<string, any>): Promise<void> {
    // Mock action execution
    console.log('Executing action:', action.type, action);
  }

  async sendDeviceCommand(
    deviceId: string, 
    commandType: string, 
    commandData: Record<string, any> = {},
    userId?: string
  ): Promise<IoTDeviceCommand> {
    // Mock command
    const command: IoTDeviceCommand = {
      id: Date.now().toString(),
      device_id: deviceId,
      command_type: commandType,
      command_data: commandData,
      status: 'pending',
      created_by: userId,
      created_at: new Date().toISOString()
    };

    return command;
  }

  async updateCommandStatus(commandId: string, status: IoTDeviceCommand['status'], responseData?: Record<string, any>): Promise<IoTDeviceCommand> {
    // Mock implementation
    const command: IoTDeviceCommand = {
      id: commandId,
      device_id: 'mock-device',
      command_type: 'mock',
      command_data: {},
      status,
      response_data: responseData,
      created_at: new Date().toISOString()
    };

    return command;
  }

  async getDeviceCommands(deviceId: string, limit = 50): Promise<IoTDeviceCommand[]> {
    // Mock implementation
    return [];
  }

  async evaluateTriggerConditions(
    automation: IoTAutomation, 
    sensorData: any
  ): Promise<boolean> {
    const { trigger_conditions } = automation;

    if (trigger_conditions.type === 'sensor_threshold') {
      return trigger_conditions.conditions.every(condition => {
        const { operator, value } = condition;
        const sensorValue = sensorData.value;

        switch (operator) {
          case '>': return sensorValue > value;
          case '<': return sensorValue < value;
          case '=': return sensorValue === value;
          case '>=': return sensorValue >= value;
          case '<=': return sensorValue <= value;
          case '!=': return sensorValue !== value;
          default: return false;
        }
      });
    }

    return false;
  }

  async checkAutomationTriggers(associationId: string, sensorData: any): Promise<void> {
    const automations = await this.getAutomations(associationId);
    
    for (const automation of automations) {
      if (!automation.is_active) continue;

      const shouldTrigger = await this.evaluateTriggerConditions(automation, sensorData);
      if (shouldTrigger) {
        await this.executeAutomation(automation.id, sensorData);
      }
    }
  }
}

export const iotAutomationService = new IoTAutomationService();