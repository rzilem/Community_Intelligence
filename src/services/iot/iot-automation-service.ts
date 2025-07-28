import { supabase } from '@/integrations/supabase/client';

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

class IoTAutomationService {
  async getAutomations(associationId: string): Promise<IoTAutomation[]> {
    const { data, error } = await supabase
      .from('iot_automations')
      .select('*')
      .eq('association_id', associationId)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async getAutomation(automationId: string): Promise<IoTAutomation | null> {
    const { data, error } = await supabase
      .from('iot_automations')
      .select('*')
      .eq('id', automationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async createAutomation(automation: Omit<IoTAutomation, 'id' | 'created_at' | 'updated_at'>): Promise<IoTAutomation> {
    const { data, error } = await supabase
      .from('iot_automations')
      .insert(automation)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateAutomation(automationId: string, updates: Partial<IoTAutomation>): Promise<IoTAutomation> {
    const { data, error } = await supabase
      .from('iot_automations')
      .update(updates)
      .eq('id', automationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteAutomation(automationId: string): Promise<void> {
    const { error } = await supabase
      .from('iot_automations')
      .delete()
      .eq('id', automationId);

    if (error) throw error;
  }

  async toggleAutomation(automationId: string, isActive: boolean): Promise<IoTAutomation> {
    const { data, error } = await supabase
      .from('iot_automations')
      .update({ is_active: isActive })
      .eq('id', automationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async executeAutomation(automationId: string, triggerData?: Record<string, any>): Promise<void> {
    const automation = await this.getAutomation(automationId);
    if (!automation || !automation.is_active) return;

    // Execute each action in the automation
    for (const action of automation.actions) {
      try {
        await this.executeAction(action, triggerData);
      } catch (error) {
        console.error(`Failed to execute action:`, error);
        // Continue with other actions even if one fails
      }
    }
  }

  private async executeAction(action: IoTAutomation['actions'][0], triggerData?: Record<string, any>): Promise<void> {
    switch (action.type) {
      case 'device_command':
        if (action.target_device_id && action.command) {
          await this.sendDeviceCommand(action.target_device_id, action.command, action.parameters);
        }
        break;
      case 'alert':
        if (action.message) {
          // Create an IoT alert
          const { iotDeviceService } = await import('./iot-device-service');
          await iotDeviceService.createAlert({
            device_id: action.target_device_id || '',
            association_id: '', // Will be set by RLS
            alert_type: 'automation',
            severity: 'medium',
            title: 'Automation Alert',
            description: action.message,
            metadata: { triggerData, action }
          });
        }
        break;
      case 'notification':
        // Send in-app notification
        console.log('Sending notification:', action.message);
        break;
      case 'email':
        // Send email notification
        console.log('Sending email to:', action.recipients);
        break;
    }
  }

  async sendDeviceCommand(
    deviceId: string, 
    commandType: string, 
    commandData: Record<string, any> = {},
    userId?: string
  ): Promise<IoTDeviceCommand> {
    const { data, error } = await supabase
      .from('iot_device_commands')
      .insert({
        device_id: deviceId,
        command_type: commandType,
        command_data: commandData,
        created_by: userId,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    
    // In a real implementation, this would trigger the actual device command
    // For now, we'll simulate processing
    setTimeout(async () => {
      await this.updateCommandStatus(data.id, 'sent');
    }, 1000);

    return data;
  }

  async updateCommandStatus(commandId: string, status: IoTDeviceCommand['status'], responseData?: Record<string, any>): Promise<IoTDeviceCommand> {
    const updates: Partial<IoTDeviceCommand> = { status };
    
    if (status === 'sent') {
      updates.sent_at = new Date().toISOString();
    } else if (status === 'executed' || status === 'failed') {
      updates.completed_at = new Date().toISOString();
      if (responseData) {
        updates.response_data = responseData;
      }
    }

    const { data, error } = await supabase
      .from('iot_device_commands')
      .update(updates)
      .eq('id', commandId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getDeviceCommands(deviceId: string, limit = 50): Promise<IoTDeviceCommand[]> {
    const { data, error } = await supabase
      .from('iot_device_commands')
      .select('*')
      .eq('device_id', deviceId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
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