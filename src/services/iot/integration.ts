import { supabase } from '@/integrations/supabase/client';
import { devLog } from '@/utils/dev-logger';

export interface IoTDevice {
  id: string;
  association_id: string;
  property_id?: string;
  device_name: string;
  device_type: IoTDeviceType;
  category: IoTDeviceCategory;
  status: 'online' | 'offline' | 'maintenance' | 'error';
  last_communication: string;
  battery_level?: number;
  signal_strength?: number;
  firmware_version: string;
  location: string;
  configuration: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type IoTDeviceType = 
  | 'temperature_sensor'
  | 'humidity_sensor' 
  | 'air_quality_monitor'
  | 'smart_lock'
  | 'security_camera'
  | 'motion_sensor'
  | 'water_meter'
  | 'electricity_monitor'
  | 'smoke_detector'
  | 'carbon_monoxide_sensor'
  | 'water_leak_sensor'
  | 'smart_thermostat'
  | 'light_sensor'
  | 'noise_monitor'
  | 'weather_station'
  | 'door_sensor'
  | 'window_sensor'
  | 'vibration_monitor'
  | 'pool_monitor'
  | 'parking_sensor'
  | 'ev_charger'
  | 'elevator_monitor'
  | 'gas_detector';

export type IoTDeviceCategory = 
  | 'environmental'
  | 'security'
  | 'utility'
  | 'safety'
  | 'maintenance'
  | 'access_control'
  | 'energy'
  | 'comfort';

export interface IoTSensorReading {
  device_id: string;
  timestamp: string;
  value: number;
  unit: string;
  quality: 'good' | 'poor' | 'unknown';
  metadata?: Record<string, any>;
}

export interface IoTAlert {
  id: string;
  device_id: string;
  alert_type: 'threshold_exceeded' | 'device_offline' | 'low_battery' | 'maintenance_required' | 'security_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  is_acknowledged: boolean;
  created_at: string;
  acknowledged_at?: string;
  acknowledged_by?: string;
}

export const IoTDeviceSpecs: Record<IoTDeviceType, {
  name: string;
  category: IoTDeviceCategory;
  defaultUnit: string;
  description: string;
  alertThresholds: Record<string, number>;
}> = {
  temperature_sensor: {
    name: 'Temperature Sensor',
    category: 'environmental',
    defaultUnit: '°F',
    description: 'Monitors ambient temperature',
    alertThresholds: { high: 85, low: 32 }
  },
  humidity_sensor: {
    name: 'Humidity Sensor', 
    category: 'environmental',
    defaultUnit: '%',
    description: 'Monitors relative humidity levels',
    alertThresholds: { high: 70, low: 30 }
  },
  air_quality_monitor: {
    name: 'Air Quality Monitor',
    category: 'environmental',
    defaultUnit: 'AQI',
    description: 'Monitors air quality index and pollutants',
    alertThresholds: { high: 150, moderate: 100 }
  },
  smart_lock: {
    name: 'Smart Lock',
    category: 'access_control',
    defaultUnit: 'status',
    description: 'Electronic door lock with remote control',
    alertThresholds: { low_battery: 20 }
  },
  security_camera: {
    name: 'Security Camera',
    category: 'security',
    defaultUnit: 'status',
    description: 'Video surveillance camera with AI analysis',
    alertThresholds: { motion_detected: 1 }
  },
  motion_sensor: {
    name: 'Motion Sensor',
    category: 'security',
    defaultUnit: 'status',
    description: 'Detects movement in monitored areas',
    alertThresholds: { motion_detected: 1 }
  },
  water_meter: {
    name: 'Smart Water Meter',
    category: 'utility',
    defaultUnit: 'gallons',
    description: 'Monitors water usage and flow rates',
    alertThresholds: { high_usage: 1000, leak_detected: 5 }
  },
  electricity_monitor: {
    name: 'Electricity Monitor',
    category: 'energy',
    defaultUnit: 'kWh',
    description: 'Monitors electrical consumption',
    alertThresholds: { high_usage: 50 }
  },
  smoke_detector: {
    name: 'Smoke Detector',
    category: 'safety',
    defaultUnit: 'ppm',
    description: 'Detects smoke and fire hazards',
    alertThresholds: { smoke_detected: 1, low_battery: 20 }
  },
  carbon_monoxide_sensor: {
    name: 'Carbon Monoxide Sensor',
    category: 'safety',
    defaultUnit: 'ppm',
    description: 'Detects dangerous CO levels',
    alertThresholds: { danger_level: 50, warning_level: 30 }
  },
  water_leak_sensor: {
    name: 'Water Leak Sensor',
    category: 'safety',
    defaultUnit: 'status',
    description: 'Detects water leaks and flooding',
    alertThresholds: { leak_detected: 1 }
  },
  smart_thermostat: {
    name: 'Smart Thermostat',
    category: 'comfort',
    defaultUnit: '°F',
    description: 'Intelligent climate control system',
    alertThresholds: { high_temp: 85, low_temp: 60 }
  },
  light_sensor: {
    name: 'Light Sensor',
    category: 'environmental',
    defaultUnit: 'lux',
    description: 'Monitors ambient light levels',
    alertThresholds: { high_light: 1000, low_light: 50 }
  },
  noise_monitor: {
    name: 'Noise Monitor',
    category: 'environmental',
    defaultUnit: 'dB',
    description: 'Monitors noise pollution levels',
    alertThresholds: { high_noise: 70, quiet_hours_violation: 50 }
  },
  weather_station: {
    name: 'Weather Station',
    category: 'environmental',
    defaultUnit: 'multiple',
    description: 'Comprehensive weather monitoring',
    alertThresholds: { high_wind: 25, low_pressure: 29.8 }
  },
  door_sensor: {
    name: 'Door Sensor',
    category: 'security',
    defaultUnit: 'status',
    description: 'Monitors door open/close status',
    alertThresholds: { door_open_too_long: 300 }
  },
  window_sensor: {
    name: 'Window Sensor',
    category: 'security',
    defaultUnit: 'status',
    description: 'Monitors window open/close status',
    alertThresholds: { window_open_too_long: 600 }
  },
  vibration_monitor: {
    name: 'Vibration Monitor',
    category: 'maintenance',
    defaultUnit: 'Hz',
    description: 'Monitors equipment vibration levels',
    alertThresholds: { high_vibration: 5, maintenance_required: 3 }
  },
  pool_monitor: {
    name: 'Pool Monitor',
    category: 'maintenance',
    defaultUnit: 'pH',
    description: 'Monitors pool chemical levels',
    alertThresholds: { high_ph: 7.8, low_ph: 7.2, low_chlorine: 1.0 }
  },
  parking_sensor: {
    name: 'Parking Sensor',
    category: 'utility',
    defaultUnit: 'status',
    description: 'Detects parking space occupancy',
    alertThresholds: { space_occupied: 1 }
  },
  ev_charger: {
    name: 'EV Charging Station',
    category: 'energy',
    defaultUnit: 'kW',
    description: 'Electric vehicle charging management',
    alertThresholds: { charging_complete: 1, fault_detected: 1 }
  },
  elevator_monitor: {
    name: 'Elevator Monitor',
    category: 'maintenance',
    defaultUnit: 'status',
    description: 'Monitors elevator operation and maintenance',
    alertThresholds: { maintenance_due: 1, fault_detected: 1 }
  },
  gas_detector: {
    name: 'Gas Leak Detector',
    category: 'safety',
    defaultUnit: 'ppm',
    description: 'Detects natural gas leaks',
    alertThresholds: { gas_detected: 10, critical_level: 25 }
  }
};

export class IoTIntegrationEngine {
  async registerDevice(deviceData: Omit<IoTDevice, 'id' | 'created_at' | 'updated_at'>): Promise<IoTDevice> {
    try {
      const { data, error } = await supabase
        .from('iot_devices')
        .insert(deviceData)
        .select()
        .single();

      if (error) throw error;
      
      devLog.info('Registered IoT device', data);
      return data as IoTDevice;
    } catch (error) {
      devLog.error('Failed to register IoT device', error);
      throw new Error(`Failed to register device: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getDevices(associationId: string, propertyId?: string): Promise<IoTDevice[]> {
    try {
      let query = supabase
        .from('iot_devices')
        .select('*')
        .eq('association_id', associationId);

      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data as IoTDevice[]) || [];
    } catch (error) {
      devLog.error('Failed to fetch IoT devices', error);
      throw new Error(`Failed to fetch devices: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateDeviceStatus(deviceId: string, status: IoTDevice['status']): Promise<void> {
    try {
      const { error } = await supabase
        .from('iot_devices')
        .update({ 
          status, 
          last_communication: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', deviceId);

      if (error) throw error;
      
      devLog.info('Updated device status', { deviceId, status });
    } catch (error) {
      devLog.error('Failed to update device status', error);
      throw new Error(`Failed to update device: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async recordSensorReading(reading: IoTSensorReading): Promise<void> {
    try {
      const { error } = await supabase
        .from('iot_sensor_readings')
        .insert(reading);

      if (error) throw error;
      
      // Check for alert thresholds
      await this.checkAlertThresholds(reading);
      
      devLog.info('Recorded sensor reading', reading);
    } catch (error) {
      devLog.error('Failed to record sensor reading', error);
      throw new Error(`Failed to record reading: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAlerts(associationId: string, unacknowledgedOnly = false): Promise<IoTAlert[]> {
    try {
      let query = supabase
        .from('iot_alerts')
        .select(`
          *,
          iot_devices!inner(association_id)
        `)
        .eq('iot_devices.association_id', associationId);

      if (unacknowledgedOnly) {
        query = query.eq('is_acknowledged', false);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data as IoTAlert[]) || [];
    } catch (error) {
      devLog.error('Failed to fetch IoT alerts', error);
      throw new Error(`Failed to fetch alerts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('iot_alerts')
        .update({
          is_acknowledged: true,
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: userId
        })
        .eq('id', alertId);

      if (error) throw error;
      
      devLog.info('Acknowledged IoT alert', { alertId, userId });
    } catch (error) {
      devLog.error('Failed to acknowledge alert', error);
      throw new Error(`Failed to acknowledge alert: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async checkAlertThresholds(reading: IoTSensorReading): Promise<void> {
    try {
      // Get device information
      const { data: device, error } = await supabase
        .from('iot_devices')
        .select('device_type, association_id, property_id, device_name')
        .eq('id', reading.device_id)
        .single();

      if (error || !device) return;

      const specs = IoTDeviceSpecs[device.device_type as IoTDeviceType];
      if (!specs) return;

      const thresholds = specs.alertThresholds;
      let alertTriggered = false;
      let alertType: IoTAlert['alert_type'] = 'threshold_exceeded';
      let severity: IoTAlert['severity'] = 'medium';
      let message = '';

      // Check thresholds
      Object.entries(thresholds).forEach(([threshold, value]) => {
        if (threshold === 'high' && reading.value > value) {
          alertTriggered = true;
          severity = 'high';
          message = `${device.device_name} reading (${reading.value} ${reading.unit}) exceeds high threshold (${value})`;
        } else if (threshold === 'low' && reading.value < value) {
          alertTriggered = true;
          severity = 'medium';
          message = `${device.device_name} reading (${reading.value} ${reading.unit}) below low threshold (${value})`;
        } else if (threshold === 'critical_level' && reading.value > value) {
          alertTriggered = true;
          severity = 'critical';
          message = `CRITICAL: ${device.device_name} reading (${reading.value} ${reading.unit}) exceeds critical threshold (${value})`;
        }
      });

      if (alertTriggered) {
        await supabase
          .from('iot_alerts')
          .insert({
            device_id: reading.device_id,
            alert_type: alertType,
            severity,
            message,
            is_acknowledged: false
          });
      }
    } catch (error) {
      devLog.error('Failed to check alert thresholds', error);
    }
  }

  async getDeviceAnalytics(deviceId: string, timeRange: '24h' | '7d' | '30d' = '24h'): Promise<Record<string, any>> {
    try {
      const timeRangeHours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
      const startTime = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('iot_sensor_readings')
        .select('*')
        .eq('device_id', deviceId)
        .gte('timestamp', startTime)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      const readings = data || [];
      const analytics = {
        total_readings: readings.length,
        average_value: readings.reduce((sum, r) => sum + r.value, 0) / readings.length || 0,
        min_value: Math.min(...readings.map(r => r.value)),
        max_value: Math.max(...readings.map(r => r.value)),
        data_quality: readings.filter(r => r.quality === 'good').length / readings.length || 0,
        readings_by_hour: this.groupReadingsByHour(readings)
      };

      return analytics;
    } catch (error) {
      devLog.error('Failed to get device analytics', error);
      throw new Error(`Failed to get analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private groupReadingsByHour(readings: IoTSensorReading[]): Record<string, number> {
    const grouped: Record<string, number[]> = {};
    
    readings.forEach(reading => {
      const hour = new Date(reading.timestamp).getHours().toString().padStart(2, '0');
      if (!grouped[hour]) grouped[hour] = [];
      grouped[hour].push(reading.value);
    });

    const averages: Record<string, number> = {};
    Object.entries(grouped).forEach(([hour, values]) => {
      averages[hour] = values.reduce((sum, val) => sum + val, 0) / values.length;
    });

    return averages;
  }
}

export const iotIntegrationEngine = new IoTIntegrationEngine();