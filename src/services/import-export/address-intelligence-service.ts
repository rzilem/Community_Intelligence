
import { devLog } from '@/utils/dev-logger';

export interface AddressValidationResult {
  isValid: boolean;
  standardizedAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    zipCodeExtension?: string;
  };
  originalAddress: string;
  confidence: number;
  validationSource: 'usps' | 'google' | 'local';
  suggestions?: string[];
  geocoding?: {
    latitude: number;
    longitude: number;
    accuracy: 'exact' | 'approximate' | 'low';
  };
  propertyInfo?: {
    county: string;
    district?: string;
    zone?: string;
    estimatedValue?: number;
  };
}

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  accuracy: 'exact' | 'approximate' | 'low';
  formattedAddress: string;
  addressComponents: {
    streetNumber?: string;
    streetName?: string;
    city: string;
    county?: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export class AddressIntelligenceService {
  private uspsApiKey?: string;
  private googleApiKey?: string;
  private cache = new Map<string, AddressValidationResult>();

  constructor() {
    // In a real implementation, these would come from environment variables
    // For now, we'll implement mock validation with the option to add real APIs
    this.initializeAPIs();
  }

  private async initializeAPIs() {
    // Initialize API keys from environment or configuration
    // This would typically be handled through Supabase secrets
    devLog.info('Initializing address intelligence APIs');
  }

  async validateAddress(address: string): Promise<AddressValidationResult> {
    const cacheKey = this.normalizeAddressForCache(address);
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      devLog.info('Returning cached address validation result');
      return this.cache.get(cacheKey)!;
    }

    let result: AddressValidationResult;

    try {
      // Try USPS first for US addresses
      if (this.isUSAddress(address)) {
        result = await this.validateWithUSPS(address);
      } else {
        result = await this.validateWithGoogle(address);
      }

      // If primary validation fails, try fallback
      if (!result.isValid && this.isUSAddress(address)) {
        result = await this.validateWithGoogle(address);
      }
    } catch (error) {
      devLog.error('Address validation failed, using local validation:', error);
      result = await this.validateLocally(address);
    }

    // Cache the result
    this.cache.set(cacheKey, result);

    return result;
  }

  async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    try {
      if (this.googleApiKey) {
        return await this.geocodeWithGoogle(address);
      } else {
        return await this.geocodeLocally(address);
      }
    } catch (error) {
      devLog.error('Geocoding failed:', error);
      return null;
    }
  }

  async batchValidateAddresses(addresses: string[]): Promise<AddressValidationResult[]> {
    devLog.info(`Batch validating ${addresses.length} addresses`);
    
    const results: AddressValidationResult[] = [];
    const batchSize = 10; // Process in batches to avoid rate limits

    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize);
      const batchPromises = batch.map(address => this.validateAddress(address));
      
      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      } catch (error) {
        devLog.error(`Batch validation failed for batch starting at index ${i}:`, error);
        // Add failed results for this batch
        batch.forEach(address => {
          results.push({
            isValid: false,
            standardizedAddress: this.parseAddressComponents(address),
            originalAddress: address,
            confidence: 0,
            validationSource: 'local'
          });
        });
      }

      // Rate limiting delay
      if (i + batchSize < addresses.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  private async validateWithUSPS(address: string): Promise<AddressValidationResult> {
    // Mock USPS validation - in real implementation, this would call USPS API
    devLog.info('Validating address with USPS (mock):', address);
    
    const components = this.parseAddressComponents(address);
    const isValidFormat = this.isValidAddressFormat(address);
    
    return {
      isValid: isValidFormat,
      standardizedAddress: {
        street: this.standardizeStreet(components.street),
        city: this.standardizeCity(components.city),
        state: components.state.toUpperCase(),
        zipCode: components.zipCode,
        zipCodeExtension: this.extractZipExtension(address)
      },
      originalAddress: address,
      confidence: isValidFormat ? 0.95 : 0.3,
      validationSource: 'usps',
      geocoding: await this.getCoordinatesForAddress(address)
    };
  }

  private async validateWithGoogle(address: string): Promise<AddressValidationResult> {
    // Mock Google validation - in real implementation, this would call Google Maps API
    devLog.info('Validating address with Google (mock):', address);
    
    const components = this.parseAddressComponents(address);
    const geocoding = await this.geocodeLocally(address);
    
    return {
      isValid: geocoding !== null,
      standardizedAddress: {
        street: components.street,
        city: components.city,
        state: components.state,
        zipCode: components.zipCode
      },
      originalAddress: address,
      confidence: geocoding ? 0.85 : 0.2,
      validationSource: 'google',
      geocoding: geocoding ? {
        latitude: geocoding.latitude,
        longitude: geocoding.longitude,
        accuracy: geocoding.accuracy
      } : undefined
    };
  }

  private async validateLocally(address: string): Promise<AddressValidationResult> {
    devLog.info('Using local address validation for:', address);
    
    const components = this.parseAddressComponents(address);
    const isValid = this.isValidAddressFormat(address);
    
    return {
      isValid,
      standardizedAddress: {
        street: components.street,
        city: components.city,
        state: components.state,
        zipCode: components.zipCode
      },
      originalAddress: address,
      confidence: isValid ? 0.7 : 0.1,
      validationSource: 'local'
    };
  }

  private async geocodeWithGoogle(address: string): Promise<GeocodeResult | null> {
    // Mock Google geocoding - in real implementation, this would call Google Geocoding API
    devLog.info('Geocoding with Google (mock):', address);
    
    // Return mock coordinates for demonstration
    const mockCoordinates = this.getMockCoordinates(address);
    
    if (!mockCoordinates) return null;
    
    return {
      latitude: mockCoordinates.lat,
      longitude: mockCoordinates.lng,
      accuracy: 'approximate',
      formattedAddress: address,
      addressComponents: this.parseAddressComponents(address)
    };
  }

  private async geocodeLocally(address: string): Promise<GeocodeResult | null> {
    // Simple local geocoding using known patterns
    const components = this.parseAddressComponents(address);
    const mockCoordinates = this.getMockCoordinates(address);
    
    if (!mockCoordinates) return null;
    
    return {
      latitude: mockCoordinates.lat,
      longitude: mockCoordinates.lng,
      accuracy: 'low',
      formattedAddress: `${components.street}, ${components.city}, ${components.state} ${components.zipCode}`,
      addressComponents: components
    };
  }

  private parseAddressComponents(address: string): any {
    // Enhanced address parsing
    const parts = address.split(',').map(part => part.trim());
    
    if (parts.length >= 3) {
      const street = parts[0];
      const city = parts[1];
      const stateZip = parts[2].split(' ');
      const state = stateZip[0] || '';
      const zipCode = stateZip[1] || '';
      
      return { street, city, state, zipCode, country: 'US' };
    }
    
    // Fallback parsing for single-line addresses
    const zipMatch = address.match(/\b\d{5}(-\d{4})?\b/);
    const stateMatch = address.match(/\b[A-Z]{2}\b/);
    
    return {
      street: address,
      city: '',
      state: stateMatch ? stateMatch[0] : '',
      zipCode: zipMatch ? zipMatch[0] : '',
      country: 'US'
    };
  }

  private isUSAddress(address: string): boolean {
    // Check for US state abbreviations or zip codes
    const usStatePattern = /\b[A-Z]{2}\b/;
    const zipPattern = /\b\d{5}(-\d{4})?\b/;
    
    return usStatePattern.test(address) || zipPattern.test(address);
  }

  private isValidAddressFormat(address: string): boolean {
    // Basic format validation
    const hasNumber = /\d/.test(address);
    const hasStreet = address.length > 10;
    const hasStateOrZip = /\b[A-Z]{2}\b|\b\d{5}\b/.test(address);
    
    return hasNumber && hasStreet && hasStateOrZip;
  }

  private standardizeStreet(street: string): string {
    return street
      .replace(/\bSt\.?\b/gi, 'Street')
      .replace(/\bAve\.?\b/gi, 'Avenue')
      .replace(/\bRd\.?\b/gi, 'Road')
      .replace(/\bDr\.?\b/gi, 'Drive')
      .replace(/\bLn\.?\b/gi, 'Lane')
      .replace(/\bCt\.?\b/gi, 'Court')
      .replace(/\bBlvd\.?\b/gi, 'Boulevard')
      .trim();
  }

  private standardizeCity(city: string): string {
    return city
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private extractZipExtension(address: string): string | undefined {
    const zipMatch = address.match(/\b\d{5}-(\d{4})\b/);
    return zipMatch ? zipMatch[1] : undefined;
  }

  private async getCoordinatesForAddress(address: string): Promise<{ latitude: number; longitude: number; accuracy: 'exact' | 'approximate' | 'low' } | undefined> {
    const geocodeResult = await this.geocodeLocally(address);
    return geocodeResult ? {
      latitude: geocodeResult.latitude,
      longitude: geocodeResult.longitude,
      accuracy: geocodeResult.accuracy
    } : undefined;
  }

  private getMockCoordinates(address: string): { lat: number; lng: number } | null {
    // Mock coordinates based on common cities
    const cityCoordinates: Record<string, { lat: number; lng: number }> = {
      'austin': { lat: 30.2672, lng: -97.7431 },
      'dallas': { lat: 32.7767, lng: -96.7970 },
      'houston': { lat: 29.7604, lng: -95.3698 },
      'san antonio': { lat: 29.4241, lng: -98.4936 },
      'pflugerville': { lat: 30.4394, lng: -97.6200 }
    };
    
    const lowerAddress = address.toLowerCase();
    
    for (const [city, coords] of Object.entries(cityCoordinates)) {
      if (lowerAddress.includes(city)) {
        // Add some random variation to simulate real coordinates
        return {
          lat: coords.lat + (Math.random() - 0.5) * 0.01,
          lng: coords.lng + (Math.random() - 0.5) * 0.01
        };
      }
    }
    
    return null;
  }

  private normalizeAddressForCache(address: string): string {
    return address.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  // Public method to get property information
  async getPropertyInfo(address: string): Promise<{ county: string; estimatedValue?: number } | null> {
    try {
      // Mock property information - in real implementation, this would integrate with property APIs
      const geocoding = await this.geocodeAddress(address);
      
      if (!geocoding) return null;
      
      // Determine county based on coordinates (mock)
      const county = this.getCountyFromCoordinates(geocoding.latitude, geocoding.longitude);
      const estimatedValue = this.estimatePropertyValue(address, geocoding);
      
      return {
        county,
        estimatedValue
      };
    } catch (error) {
      devLog.error('Failed to get property info:', error);
      return null;
    }
  }

  private getCountyFromCoordinates(lat: number, lng: number): string {
    // Mock county determination - in real implementation, this would use GIS APIs
    if (lat > 30.0 && lat < 30.5 && lng > -98.0 && lng < -97.0) {
      return 'Travis County';
    } else if (lat > 32.5 && lat < 33.0 && lng > -97.0 && lng < -96.5) {
      return 'Dallas County';
    } else if (lat > 29.5 && lat < 30.0 && lng > -95.5 && lng < -95.0) {
      return 'Harris County';
    }
    
    return 'Unknown County';
  }

  private estimatePropertyValue(address: string, geocoding: GeocodeResult): number | undefined {
    // Mock property value estimation - in real implementation, this would use Zillow, Redfin, or similar APIs
    const baseValue = 300000;
    const locationMultiplier = geocoding.accuracy === 'exact' ? 1.1 : 1.0;
    
    // Simple estimation based on area (very basic mock)
    return Math.round(baseValue * locationMultiplier * (0.8 + Math.random() * 0.4));
  }
}

export const addressIntelligenceService = new AddressIntelligenceService();
