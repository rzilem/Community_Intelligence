// Simplified IoT service with mock data to avoid database schema issues
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
  // Mock data for development
  private mockDevices: IoTDevice[] = [
    {
      id: '1',
      association_id: '',
      device_name: 'Main Entrance Sensor',
      device_type: 'security',
      status: 'active',
      location: 'Main Entrance',
      battery_level: 85,
      signal_strength: 92,
      configuration: {},
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      association_id: '',
      device_name: 'Pool Temperature Monitor',
      device_type: 'temperature',
      status: 'active',
      location: 'Pool Area',
      battery_level: 72,
      signal_strength: 88,
      configuration: {},
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  private mockAlerts: IoTAlert[] = [
    {
      id: '1',
      device_id: '1',
      association_id: '',
      alert_type: 'threshold',
      severity: 'medium',
      title: 'Low Battery Warning',
      description: 'Device battery level is below 20%',
      status: 'active',
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  private mockSensorData: IoTSensorData[] = [
    {
      id: '1',
      device_id: '1',
      sensor_type: 'battery',
      value: 85,
      unit: '%',
      timestamp: new Date().toISOString(),
      metadata: {},
      created_at: new Date().toISOString()
    }
  ];

  async getDevices(associationId: string): Promise<IoTDevice[]> {
    return this.mockDevices.map(d => ({ ...d, association_id: associationId }));
  }

  async getDevice(deviceId: string): Promise<IoTDevice | null> {
    const device = this.mockDevices.find(d => d.id === deviceId);
    return device || null;
  }

  async createDevice(device: Omit<IoTDevice, 'id' | 'created_at' | 'updated_at'>): Promise<IoTDevice> {
    const newDevice: IoTDevice = {
      ...device,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.mockDevices.push(newDevice);
    return newDevice;
  }

  async updateDevice(deviceId: string, updates: Partial<IoTDevice>): Promise<IoTDevice> {
    const index = this.mockDevices.findIndex(d => d.id === deviceId);
    if (index === -1) throw new Error('Device not found');
    
    this.mockDevices[index] = {
      ...this.mockDevices[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    return this.mockDevices[index];
  }

  async deleteDevice(deviceId: string): Promise<void> {
    const index = this.mockDevices.findIndex(d => d.id === deviceId);
    if (index !== -1) {
      this.mockDevices.splice(index, 1);
    }
  }

  async getSensorData(deviceId: string, limit = 100): Promise<IoTSensorData[]> {
    return this.mockSensorData
      .filter(d => d.device_id === deviceId)
      .slice(0, limit);
  }

  async addSensorData(sensorData: Omit<IoTSensorData, 'id' | 'created_at'>): Promise<IoTSensorData> {
    const newData: IoTSensorData = {
      ...sensorData,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    this.mockSensorData.push(newData);
    return newData;
  }

  async getAlerts(associationId: string, status?: string): Promise<IoTAlert[]> {
    let alerts = this.mockAlerts.map(a => ({ ...a, association_id: associationId }));
    
    if (status) {
      alerts = alerts.filter(a => a.status === status);
    }
    
    return alerts;
  }

  async createAlert(alert: Omit<IoTAlert, 'id' | 'created_at' | 'updated_at'>): Promise<IoTAlert> {
    const newAlert: IoTAlert = {
      ...alert,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.mockAlerts.push(newAlert);
    return newAlert;
  }

  async acknowledgeAlert(alertId: string, userId: string): Promise<IoTAlert> {
    const index = this.mockAlerts.findIndex(a => a.id === alertId);
    if (index === -1) throw new Error('Alert not found');
    
    this.mockAlerts[index] = {
      ...this.mockAlerts[index],
      status: 'acknowledged',
      acknowledged_by: userId,
      acknowledged_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return this.mockAlerts[index];
  }

  async resolveAlert(alertId: string, userId: string): Promise<IoTAlert> {
    const index = this.mockAlerts.findIndex(a => a.id === alertId);
    if (index === -1) throw new Error('Alert not found');
    
    this.mockAlerts[index] = {
      ...this.mockAlerts[index],
      status: 'resolved',
      resolved_by: userId,
      resolved_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return this.mockAlerts[index];
  }

  async getDevicesByType(associationId: string, deviceType: string): Promise<IoTDevice[]> {
    return this.mockDevices
      .filter(d => d.device_type === deviceType)
      .map(d => ({ ...d, association_id: associationId }));
  }

  async getDevicesByStatus(associationId: string, status: string): Promise<IoTDevice[]> {
    return this.mockDevices
      .filter(d => d.status === status)
      .map(d => ({ ...d, association_id: associationId }));
  }

  async updateDeviceLastSeen(deviceId: string): Promise<void> {
    const index = this.mockDevices.findIndex(d => d.id === deviceId);
    if (index !== -1) {
      this.mockDevices[index].last_seen = new Date().toISOString();
      this.mockDevices[index].updated_at = new Date().toISOString();
    }
  }

  async getDeviceAnalytics(deviceId: string, sensorType?: string, days = 7) {
    let data = this.mockSensorData.filter(d => d.device_id === deviceId);
    
    if (sensorType) {
      data = data.filter(d => d.sensor_type === sensorType);
    }
    
    // Generate mock time series data
    const results = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      results.push({
        id: `mock-${i}`,
        device_id: deviceId,
        sensor_type: sensorType || 'temperature',
        value: 20 + Math.random() * 10,
        unit: '°C',
        timestamp: date.toISOString(),
        metadata: {},
        created_at: date.toISOString()
      });
    }
    
    return results;
  }
}

export const iotDeviceService = new IoTDeviceService();