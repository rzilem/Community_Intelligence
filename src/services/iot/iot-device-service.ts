import { supabase } from '@/integrations/supabase/client';

export interface IoTDevice {
  id: string;
  association_id: string;
  device_name: string;
  device_type: string;
  device_model?: string;
  manufacturer?: string;
  serial_number?: string;
  mac_address?: string;
  ip_address?: string;
  location?: string;
  property_id?: string;
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  firmware_version?: string;
  last_seen?: string;
  battery_level?: number;
  signal_strength?: number;
  configuration: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface IoTSensorData {
  id: string;
  device_id: string;
  sensor_type: string;
  value: number;
  unit?: string;
  timestamp: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface IoTAlert {
  id: string;
  device_id: string;
  association_id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description?: string;
  threshold_value?: number;
  current_value?: number;
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved_by?: string;
  resolved_at?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

class IoTDeviceService {
  async getDevices(associationId: string): Promise<IoTDevice[]> {
    const { data, error } = await supabase
      .from('iot_devices')
      .select('*')
      .eq('association_id', associationId)
      .order('device_name');

    if (error) throw error;
    return data || [];
  }

  async getDevice(deviceId: string): Promise<IoTDevice | null> {
    const { data, error } = await supabase
      .from('iot_devices')
      .select('*')
      .eq('id', deviceId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async createDevice(device: Omit<IoTDevice, 'id' | 'created_at' | 'updated_at'>): Promise<IoTDevice> {
    const { data, error } = await supabase
      .from('iot_devices')
      .insert(device)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateDevice(deviceId: string, updates: Partial<IoTDevice>): Promise<IoTDevice> {
    const { data, error } = await supabase
      .from('iot_devices')
      .update(updates)
      .eq('id', deviceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteDevice(deviceId: string): Promise<void> {
    const { error } = await supabase
      .from('iot_devices')
      .delete()
      .eq('id', deviceId);

    if (error) throw error;
  }

  async getSensorData(deviceId: string, limit = 100): Promise<IoTSensorData[]> {
    const { data, error } = await supabase
      .from('iot_sensor_data')
      .select('*')
      .eq('device_id', deviceId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async addSensorData(sensorData: Omit<IoTSensorData, 'id' | 'created_at'>): Promise<IoTSensorData> {
    const { data, error } = await supabase
      .from('iot_sensor_data')
      .insert(sensorData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getAlerts(associationId: string, status?: string): Promise<IoTAlert[]> {
    let query = supabase
      .from('iot_alerts')
      .select('*')
      .eq('association_id', associationId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createAlert(alert: Omit<IoTAlert, 'id' | 'created_at' | 'updated_at'>): Promise<IoTAlert> {
    const { data, error } = await supabase
      .from('iot_alerts')
      .insert(alert)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async acknowledgeAlert(alertId: string, userId: string): Promise<IoTAlert> {
    const { data, error } = await supabase
      .from('iot_alerts')
      .update({
        status: 'acknowledged',
        acknowledged_by: userId,
        acknowledged_at: new Date().toISOString()
      })
      .eq('id', alertId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async resolveAlert(alertId: string, userId: string): Promise<IoTAlert> {
    const { data, error } = await supabase
      .from('iot_alerts')
      .update({
        status: 'resolved',
        resolved_by: userId,
        resolved_at: new Date().toISOString()
      })
      .eq('id', alertId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getDevicesByType(associationId: string, deviceType: string): Promise<IoTDevice[]> {
    const { data, error } = await supabase
      .from('iot_devices')
      .select('*')
      .eq('association_id', associationId)
      .eq('device_type', deviceType)
      .order('device_name');

    if (error) throw error;
    return data || [];
  }

  async getDevicesByStatus(associationId: string, status: string): Promise<IoTDevice[]> {
    const { data, error } = await supabase
      .from('iot_devices')
      .select('*')
      .eq('association_id', associationId)
      .eq('status', status)
      .order('device_name');

    if (error) throw error;
    return data || [];
  }

  async updateDeviceLastSeen(deviceId: string): Promise<void> {
    const { error } = await supabase
      .from('iot_devices')
      .update({ last_seen: new Date().toISOString() })
      .eq('id', deviceId);

    if (error) throw error;
  }

  async getDeviceAnalytics(deviceId: string, sensorType?: string, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let query = supabase
      .from('iot_sensor_data')
      .select('*')
      .eq('device_id', deviceId)
      .gte('timestamp', startDate.toISOString());

    if (sensorType) {
      query = query.eq('sensor_type', sensorType);
    }

    const { data, error } = await query.order('timestamp');

    if (error) throw error;
    return data || [];
  }
}

export const iotDeviceService = new IoTDeviceService();