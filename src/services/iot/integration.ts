import { supabase } from '@/integrations/supabase/client';
import { devLog } from '@/utils/dev-logger';

export interface IoTDevice {
  id: string;
  device_id: string;
  device_name: string;
  device_type: string;
  association_id: string;
  property_id?: string;
  status: 'online' | 'offline' | 'maintenance' | 'error';
  last_seen: string;
  battery_level?: number;
  firmware_version?: string;
  configuration: Record<string, any>;
  location: {
    building?: string;
    floor?: string;
    room?: string;
    coordinates?: { lat: number; lng: number };
  };
  installed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SensorReading {
  id: string;
  device_id: string;
  sensor_type: string;
  value: number;
  unit: string;
  timestamp: string;
  quality: 'good' | 'fair' | 'poor';
  metadata?: Record<string, any>;
}

export interface IoTAlert {
  id: string;
  device_id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  threshold_value?: number;
  actual_value?: number;
  is_acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  is_resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DeviceCommand {
  id: string;
  device_id: string;
  command_type: string;
  command_data: Record<string, any>;
  status: 'pending' | 'sent' | 'acknowledged' | 'failed';
  sent_at?: string;
  acknowledged_at?: string;
  response_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AutomationTrigger {
  id: string;
  trigger_name: string;
  device_id: string;
  condition: {
    sensor_type: string;
    operator: 'greater_than' | 'less_than' | 'equals' | 'not_equals' | 'between';
    value: number | [number, number];
    duration?: number;
  };
  actions: {
    type: 'device_command' | 'notification' | 'workflow' | 'api_call';
    config: Record<string, any>;
  }[];
  is_active: boolean;
  last_triggered?: string;
  trigger_count: number;
  created_at: string;
  updated_at: string;
}

export interface NetworkTopology {
  nodes: {
    id: string;
    type: 'gateway' | 'device' | 'sensor' | 'actuator';
    name: string;
    status: 'online' | 'offline' | 'warning';
    position: { x: number; y: number };
    metadata: Record<string, any>;
  }[];
  connections: {
    source: string;
    target: string;
    type: 'wifi' | 'zigbee' | 'bluetooth' | 'ethernet' | 'cellular';
    signal_strength?: number;
    status: 'active' | 'inactive' | 'intermittent';
  }[];
}

export interface DeviceMetrics {
  device_id: string;
  uptime: number;
  message_count: number;
  last_message: string;
  signal_strength: number;
  battery_level?: number;
  error_count: number;
  data_usage: number;
  performance_score: number;
}

// Device type templates for easy setup
export const DEVICE_TEMPLATES = {
  'temperature_sensor': {
    name: 'Temperature Sensor',
    category: 'environmental',
    defaultUnit: '°C',
    description: 'Measures ambient temperature',
    alertThresholds: { high: 30, low: 10 }
  },
  'humidity_sensor': {
    name: 'Humidity Sensor',
    category: 'environmental',
    defaultUnit: '%',
    description: 'Measures relative humidity',
    alertThresholds: { high: 80, low: 30 }
  },
  'motion_detector': {
    name: 'Motion Detector',
    category: 'security',
    defaultUnit: 'boolean',
    description: 'Detects motion in area',
    alertThresholds: { motion_detected: true }
  },
  'door_sensor': {
    name: 'Door Sensor',
    category: 'security',
    defaultUnit: 'boolean',
    description: 'Monitors door open/close state',
    alertThresholds: { door_open: true }
  },
  'smoke_detector': {
    name: 'Smoke Detector',
    category: 'safety',
    defaultUnit: 'ppm',
    description: 'Detects smoke particles',
    alertThresholds: { smoke_detected: 50, critical_level: 100 }
  },
  'water_leak_sensor': {
    name: 'Water Leak Sensor',
    category: 'safety',
    defaultUnit: 'boolean',
    description: 'Detects water presence',
    alertThresholds: { water_detected: true }
  },
  'smart_lock': {
    name: 'Smart Lock',
    category: 'security',
    defaultUnit: 'boolean',
    description: 'Electronic door lock',
    alertThresholds: { tamper_detected: true, battery_low: 20 }
  },
  'energy_meter': {
    name: 'Energy Meter',
    category: 'utility',
    defaultUnit: 'kWh',
    description: 'Measures energy consumption',
    alertThresholds: { high_usage: 1000, spike_detected: 1500 }
  },
  'air_quality_sensor': {
    name: 'Air Quality Sensor',
    category: 'environmental',
    defaultUnit: 'AQI',
    description: 'Measures air quality index',
    alertThresholds: { poor_quality: 150, hazardous: 300 }
  },
  'gas_detector': {
    name: 'Gas Leak Detector',
    category: 'safety',
    defaultUnit: 'ppm',
    description: 'Detects natural gas leaks',
    alertThresholds: { gas_detected: 10, critical_level: 25 }
  }
};

// Dashboard-compatible interface
export interface SimplifiedIoTDevice {
  id: string;
  name: string;
  type: 'sensor' | 'camera' | 'controller' | 'monitor';
  category: 'environmental' | 'security' | 'utility' | 'maintenance';
  status: 'online' | 'offline' | 'error' | 'maintenance';
  location: string;
  lastSeen: Date;
  batteryLevel?: number;
  signalStrength: number;
  data?: any;
}

export interface SimplifiedIoTMetrics {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  errorDevices: number;
  averageSignalStrength: number;
  totalDataPoints: number;
  averageResponseTime: number;
}

export class IoTIntegrationEngine {
  private devices: Map<string, SimplifiedIoTDevice> = new Map();
  private metrics: SimplifiedIoTMetrics = {
    totalDevices: 0,
    onlineDevices: 0,
    offlineDevices: 0,
    errorDevices: 0,
    averageSignalStrength: 0,
    totalDataPoints: 0,
    averageResponseTime: 0
  };

  async initialize() {
    devLog.info('Initializing IoT Integration Engine...');
    
    // Initialize with mock devices
    this.initializeMockDevices();
    
    // Start monitoring
    this.startMonitoring();
    
    devLog.info('IoT Integration Engine initialized successfully');
  }

  private initializeMockDevices() {
    const mockDevices: SimplifiedIoTDevice[] = [
      {
        id: '1',
        name: 'Temperature Sensor A1',
        type: 'sensor',
        category: 'environmental',
        status: 'online',
        location: 'Building A - Lobby',
        lastSeen: new Date(),
        batteryLevel: 85,
        signalStrength: 92,
        data: { temperature: 22.5, humidity: 45, airQuality: 'Good' }
      },
      {
        id: '2',
        name: 'Security Camera B1',
        type: 'camera',
        category: 'security',
        status: 'online',
        location: 'Building B - Parking',
        lastSeen: new Date(Date.now() - 5000),
        signalStrength: 88,
        data: { motion: false, recording: true }
      },
      {
        id: '3',
        name: 'Water Leak Detector',
        type: 'sensor',
        category: 'maintenance',
        status: 'offline',
        location: 'Building C - Basement',
        lastSeen: new Date(Date.now() - 300000),
        batteryLevel: 15,
        signalStrength: 0,
        data: { leak: false }
      },
      {
        id: '4',
        name: 'HVAC Controller',
        type: 'controller',
        category: 'utility',
        status: 'error',
        location: 'Building A - Roof',
        lastSeen: new Date(Date.now() - 60000),
        signalStrength: 72,
        data: { temperature: 18.2, setpoint: 21.0, mode: 'cooling' }
      }
    ];

    mockDevices.forEach(device => {
      this.devices.set(device.id, device);
    });
  }

  private startMonitoring() {
    setInterval(() => {
      this.updateMetrics();
    }, 5000);
  }

  private updateMetrics() {
    const devices = Array.from(this.devices.values());
    const totalDevices = devices.length;
    const onlineDevices = devices.filter(d => d.status === 'online').length;
    const offlineDevices = devices.filter(d => d.status === 'offline').length;
    const errorDevices = devices.filter(d => d.status === 'error').length;
    const averageSignalStrength = devices.reduce((sum, d) => sum + d.signalStrength, 0) / totalDevices;
    
    this.metrics = {
      totalDevices,
      onlineDevices,
      offlineDevices,
      errorDevices,
      averageSignalStrength: Math.round(averageSignalStrength),
      totalDataPoints: totalDevices * 100 + Math.floor(Math.random() * 50),
      averageResponseTime: 50 + Math.random() * 20
    };
  }

  async getDevices(associationId?: string): Promise<SimplifiedIoTDevice[]> {
    return Array.from(this.devices.values());
  }

  async getMetrics(associationId?: string): Promise<SimplifiedIoTMetrics> {
    return this.metrics;
  }

  async controlDevice(deviceId: string, action: string) {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    // Simulate device control actions
    switch (action) {
      case 'restart':
        device.status = 'maintenance';
        setTimeout(() => {
          device.status = 'online';
          device.lastSeen = new Date();
        }, 5000);
        break;
      case 'calibrate':
        device.status = 'maintenance';
        setTimeout(() => {
          device.status = 'online';
          device.lastSeen = new Date();
        }, 3000);
        break;
      case 'update':
        device.status = 'maintenance';
        setTimeout(() => {
          device.status = 'online';
          device.lastSeen = new Date();
        }, 10000);
        break;
    }

    this.devices.set(deviceId, device);
    return device;
  }

  // Legacy methods for backward compatibility
  async registerDevice(deviceData: Omit<IoTDevice, 'id' | 'created_at' | 'updated_at'>): Promise<IoTDevice> {
    try {
      // Mock implementation for now since iot_devices table doesn't exist
      const mockDevice: IoTDevice = {
        ...deviceData,
        id: Math.random().toString(36).substring(7),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      devLog.info('IoT device registered (mock)', mockDevice);
      return mockDevice;
    } catch (error) {
      devLog.error('Failed to register IoT device', error);
      throw new Error(`Failed to register device: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getDevicesLegacy(associationId: string, propertyId?: string): Promise<IoTDevice[]> {
    try {
      // Mock implementation for now
      const mockDevices: IoTDevice[] = [
        {
          id: '1',
          device_id: 'TEMP_001',
          device_name: 'Lobby Temperature Sensor',
          device_type: 'temperature_sensor',
          association_id: associationId,
          property_id: propertyId,
          status: 'online',
          last_seen: new Date().toISOString(),
          battery_level: 87,
          firmware_version: '1.2.3',
          configuration: { alert_threshold: 25, sample_rate: 60 },
          location: { building: 'Main', floor: '1', room: 'Lobby' },
          installed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          device_id: 'MOTION_001',
          device_name: 'Parking Lot Motion Detector',
          device_type: 'motion_detector',
          association_id: associationId,
          property_id: propertyId,
          status: 'online',
          last_seen: new Date().toISOString(),
          battery_level: 92,
          firmware_version: '2.1.0',
          configuration: { sensitivity: 75, detection_range: 10 },
          location: { building: 'Parking', floor: 'Ground', room: 'Lot A' },
          installed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      return mockDevices;
    } catch (error) {
      devLog.error('Failed to fetch IoT devices', error);
      return [];
    }
  }

  async updateDevice(deviceId: string, updates: Partial<IoTDevice>): Promise<IoTDevice> {
    try {
      // Mock implementation for now
      const mockDevice: IoTDevice = {
        id: deviceId,
        device_id: 'TEMP_001',
        device_name: 'Updated Device',
        device_type: 'temperature_sensor',
        association_id: 'mock-association',
        status: 'online',
        last_seen: new Date().toISOString(),
        configuration: {},
        location: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...updates
      };
      
      devLog.info('IoT device updated (mock)', mockDevice);
      return mockDevice;
    } catch (error) {
      devLog.error('Failed to update IoT device', error);
      throw new Error(`Failed to update device: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteDevice(deviceId: string): Promise<void> {
    try {
      // Mock implementation for now
      devLog.info('IoT device deleted (mock)', { deviceId });
    } catch (error) {
      devLog.error('Failed to delete IoT device', error);
      throw new Error(`Failed to delete device: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getSensorReadings(deviceId: string, timeRange?: number): Promise<SensorReading[]> {
    try {
      // Mock implementation for now
      const mockReadings: SensorReading[] = [];
      const now = new Date();
      
      for (let i = 0; i < 10; i++) {
        mockReadings.push({
          id: `reading_${i}`,
          device_id: deviceId,
          sensor_type: 'temperature',
          value: 20 + Math.random() * 10,
          unit: '°C',
          timestamp: new Date(now.getTime() - i * 60000).toISOString(),
          quality: 'good'
        });
      }
      
      return mockReadings;
    } catch (error) {
      devLog.error('Failed to fetch sensor readings', error);
      return [];
    }
  }

  async sendCommand(deviceId: string, command: Omit<DeviceCommand, 'id' | 'device_id' | 'created_at' | 'updated_at'>): Promise<DeviceCommand> {
    try {
      // Mock implementation for now
      const mockCommand: DeviceCommand = {
        ...command,
        id: Math.random().toString(36).substring(7),
        device_id: deviceId,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      devLog.info('Device command sent (mock)', mockCommand);
      return mockCommand;
    } catch (error) {
      devLog.error('Failed to send device command', error);
      throw new Error(`Failed to send command: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAlerts(associationId: string, deviceId?: string): Promise<IoTAlert[]> {
    try {
      // Mock implementation for now
      const mockAlerts: IoTAlert[] = [
        {
          id: '1',
          device_id: 'TEMP_001',
          alert_type: 'temperature_high',
          severity: 'medium',
          message: 'Temperature exceeded threshold (28°C)',
          threshold_value: 25,
          actual_value: 28,
          is_acknowledged: false,
          is_resolved: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          device_id: 'MOTION_001',
          alert_type: 'motion_detected',
          severity: 'low',
          message: 'Motion detected in parking lot',
          is_acknowledged: true,
          acknowledged_by: 'security_guard',
          acknowledged_at: new Date().toISOString(),
          is_resolved: true,
          resolved_by: 'security_guard',
          resolved_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      return deviceId ? mockAlerts.filter(alert => alert.device_id === deviceId) : mockAlerts;
    } catch (error) {
      devLog.error('Failed to fetch IoT alerts', error);
      return [];
    }
  }

  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<void> {
    try {
      // Mock implementation for now
      devLog.info('IoT alert acknowledged (mock)', { alertId, acknowledgedBy });
    } catch (error) {
      devLog.error('Failed to acknowledge IoT alert', error);
      throw new Error(`Failed to acknowledge alert: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async resolveAlert(alertId: string, resolvedBy: string): Promise<void> {
    try {
      // Mock implementation for now
      devLog.info('IoT alert resolved (mock)', { alertId, resolvedBy });
    } catch (error) {
      devLog.error('Failed to resolve IoT alert', error);
      throw new Error(`Failed to resolve alert: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createAutomationTrigger(trigger: Omit<AutomationTrigger, 'id' | 'created_at' | 'updated_at'>): Promise<AutomationTrigger> {
    try {
      // Mock implementation for now
      const mockTrigger: AutomationTrigger = {
        ...trigger,
        id: Math.random().toString(36).substring(7),
        trigger_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      devLog.info('Automation trigger created (mock)', mockTrigger);
      return mockTrigger;
    } catch (error) {
      devLog.error('Failed to create automation trigger', error);
      throw new Error(`Failed to create trigger: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAutomationTriggers(associationId: string): Promise<AutomationTrigger[]> {
    try {
      // Mock implementation for now
      return [
        {
          id: '1',
          trigger_name: 'High Temperature Alert',
          device_id: 'TEMP_001',
          condition: {
            sensor_type: 'temperature',
            operator: 'greater_than',
            value: 25,
            duration: 300
          },
          actions: [
            {
              type: 'notification',
              config: { recipients: ['maintenance@example.com'], message: 'Temperature too high' }
            }
          ],
          is_active: true,
          trigger_count: 5,
          last_triggered: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    } catch (error) {
      devLog.error('Failed to fetch automation triggers', error);
      return [];
    }
  }

  async getNetworkTopology(associationId: string): Promise<NetworkTopology> {
    try {
      // Mock implementation for now
      return {
        nodes: [
          {
            id: 'gateway_1',
            type: 'gateway',
            name: 'Main Gateway',
            status: 'online',
            position: { x: 100, y: 100 },
            metadata: { ip: '192.168.1.100', model: 'GW-2000' }
          },
          {
            id: 'temp_001',
            type: 'sensor',
            name: 'Lobby Temperature',
            status: 'online',
            position: { x: 200, y: 150 },
            metadata: { battery: 87, signal: -45 }
          },
          {
            id: 'motion_001',
            type: 'sensor',
            name: 'Parking Motion',
            status: 'online',
            position: { x: 300, y: 200 },
            metadata: { battery: 92, signal: -38 }
          }
        ],
        connections: [
          {
            source: 'gateway_1',
            target: 'temp_001',
            type: 'zigbee',
            signal_strength: -45,
            status: 'active'
          },
          {
            source: 'gateway_1',
            target: 'motion_001',
            type: 'zigbee',
            signal_strength: -38,
            status: 'active'
          }
        ]
      };
    } catch (error) {
      devLog.error('Failed to fetch network topology', error);
      throw new Error(`Failed to fetch topology: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getDeviceMetrics(deviceId: string): Promise<DeviceMetrics> {
    try {
      // Mock implementation for now
      return {
        device_id: deviceId,
        uptime: 0.987,
        message_count: 1440,
        last_message: new Date().toISOString(),
        signal_strength: -42,
        battery_level: 87,
        error_count: 2,
        data_usage: 1024,
        performance_score: 0.94
      };
    } catch (error) {
      devLog.error('Failed to fetch device metrics', error);
      throw new Error(`Failed to fetch metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async performDeviceDiscovery(associationId: string): Promise<IoTDevice[]> {
    try {
      // Mock implementation for now
      const discoveredDevices: IoTDevice[] = [
        {
          id: 'discovered_1',
          device_id: 'DISCOVERED_001',
          device_name: 'Unknown Device',
          device_type: 'unknown',
          association_id: associationId,
          status: 'offline',
          last_seen: new Date().toISOString(),
          configuration: {},
          location: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      devLog.info('Device discovery completed (mock)', { count: discoveredDevices.length });
      return discoveredDevices;
    } catch (error) {
      devLog.error('Failed to perform device discovery', error);
      throw new Error(`Failed to discover devices: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateFirmware(deviceId: string, firmwareVersion: string): Promise<void> {
    try {
      // Mock implementation for now
      devLog.info('Firmware update initiated (mock)', { deviceId, firmwareVersion });
    } catch (error) {
      devLog.error('Failed to update firmware', error);
      throw new Error(`Failed to update firmware: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async exportDeviceData(associationId: string, format: 'csv' | 'json'): Promise<string> {
    try {
      // Mock implementation for now
      const exportId = `export_${associationId}_${Date.now()}`;
      devLog.info('Device data export initiated (mock)', { exportId, format });
      return exportId;
    } catch (error) {
      devLog.error('Failed to export device data', error);
      throw new Error(`Failed to export data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const iotIntegrationEngine = new IoTIntegrationEngine();