
import { devLog } from '@/utils/dev-logger';

export interface AddressValidationResult {
  isValid: boolean;
  confidence: number;
  standardizedAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  geocoding?: {
    latitude: number;
    longitude: number;
  };
  suggestions?: string[];
  metadata?: {
    deliveryPoint?: string;
    carrierRoute?: string;
    dpvConfirmation?: boolean;
  };
}

export interface PropertyInfo {
  county: string;
  estimatedValue?: number;
  propertyType?: string;
  taxAssessment?: number;
  lastSaleDate?: string;
  lastSalePrice?: number;
  yearBuilt?: number;
  squareFootage?: number;
}

export class AddressIntelligenceService {
  private uspsApiKey: string | null = null;
  private googleMapsApiKey: string | null = null;
  private zillowApiKey: string | null = null;

  constructor() {
    // API keys will be loaded from Supabase secrets
    this.loadApiKeys();
  }

  private async loadApiKeys(): Promise<void> {
    try {
      // These would be loaded from Supabase secrets in production
      this.uspsApiKey = await this.getSecret('USPS_API_KEY');
      this.googleMapsApiKey = await this.getSecret('GOOGLE_MAPS_API_KEY');
      this.zillowApiKey = await this.getSecret('ZILLOW_API_KEY');
    } catch (error) {
      devLog.warn('API keys not configured, using fallback validation');
    }
  }

  private async getSecret(key: string): Promise<string | null> {
    // In production, this would call Supabase edge function to get secrets
    return process.env[key] || null;
  }

  async validateAddress(address: string): Promise<AddressValidationResult> {
    devLog.info('Validating address:', address);

    try {
      // Try USPS first for US addresses
      if (this.uspsApiKey && this.isUSAddress(address)) {
        const uspsResult = await this.validateWithUSPS(address);
        if (uspsResult.isValid) {
          // Enhance with Google geocoding
          const geocoding = await this.geocodeWithGoogle(address);
          return { ...uspsResult, geocoding };
        }
      }

      // Fallback to Google Maps validation
      if (this.googleMapsApiKey) {
        return await this.validateWithGoogle(address);
      }

      // Final fallback to basic validation
      return this.basicAddressValidation(address);
      
    } catch (error) {
      devLog.error('Address validation failed:', error);
      return this.basicAddressValidation(address);
    }
  }

  async batchValidateAddresses(addresses: string[]): Promise<AddressValidationResult[]> {
    devLog.info(`Batch validating ${addresses.length} addresses`);
    
    // Process in batches of 25 to respect API limits
    const batchSize = 25;
    const results: AddressValidationResult[] = [];
    
    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize);
      const batchPromises = batch.map(address => this.validateAddress(address));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Add delay between batches to avoid rate limiting
      if (i + batchSize < addresses.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }

  async getPropertyInfo(address: string): Promise<PropertyInfo | null> {
    try {
      if (this.zillowApiKey) {
        return await this.getPropertyFromZillow(address);
      }
      
      // Fallback to mock data for development
      return this.getMockPropertyInfo(address);
      
    } catch (error) {
      devLog.error('Property info lookup failed:', error);
      return null;
    }
  }

  private isUSAddress(address: string): boolean {
    // Simple heuristic to detect US addresses
    const usPatterns = [
      /\b\d{5}(-\d{4})?\b/, // ZIP code
      /\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/i
    ];
    
    return usPatterns.some(pattern => pattern.test(address));
  }

  private async validateWithUSPS(address: string): Promise<AddressValidationResult> {
    // USPS Address Validation API integration
    const response = await fetch('https://production.shippingapis.com/shippingapi.dll', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: this.buildUSPSRequest(address)
    });

    const xmlText = await response.text();
    return this.parseUSPSResponse(xmlText);
  }

  private buildUSPSRequest(address: string): string {
    const addressParts = this.parseAddressComponents(address);
    
    return `<?xml version="1.0"?>
      <AddressValidateRequest USERID="${this.uspsApiKey}">
        <Revision>1</Revision>
        <Address ID="1">
          <Address1>${addressParts.apartment || ''}</Address1>
          <Address2>${addressParts.street || ''}</Address2>
          <City>${addressParts.city || ''}</City>
          <State>${addressParts.state || ''}</State>
          <Zip5>${addressParts.zip || ''}</Zip5>
          <Zip4/>
        </Address>
      </AddressValidateRequest>`;
  }

  private parseUSPSResponse(xmlText: string): AddressValidationResult {
    // Parse USPS XML response
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    const error = xmlDoc.querySelector('Error');
    if (error) {
      return {
        isValid: false,
        confidence: 0,
        standardizedAddress: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'US'
        },
        suggestions: [error.textContent || 'Address validation failed']
      };
    }

    const address = xmlDoc.querySelector('Address');
    if (!address) {
      throw new Error('Invalid USPS response');
    }

    return {
      isValid: true,
      confidence: 0.95,
      standardizedAddress: {
        street: address.querySelector('Address2')?.textContent || '',
        city: address.querySelector('City')?.textContent || '',
        state: address.querySelector('State')?.textContent || '',
        zipCode: `${address.querySelector('Zip5')?.textContent || ''}${address.querySelector('Zip4')?.textContent ? '-' + address.querySelector('Zip4')?.textContent : ''}`,
        country: 'US'
      },
      metadata: {
        deliveryPoint: address.querySelector('DeliveryPoint')?.textContent || undefined,
        carrierRoute: address.querySelector('CarrierRoute')?.textContent || undefined,
        dpvConfirmation: address.querySelector('DPVConfirmation')?.textContent === 'Y'
      }
    };
  }

  private async validateWithGoogle(address: string): Promise<AddressValidationResult> {
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.googleMapsApiKey}`);
    const data = await response.json();

    if (data.status !== 'OK' || !data.results.length) {
      return this.basicAddressValidation(address);
    }

    const result = data.results[0];
    const components = this.parseGoogleComponents(result.address_components);

    return {
      isValid: true,
      confidence: this.calculateGoogleConfidence(result),
      standardizedAddress: {
        street: `${components.streetNumber} ${components.route}`.trim(),
        city: components.city,
        state: components.state,
        zipCode: components.zipCode,
        country: components.country
      },
      geocoding: {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng
      }
    };
  }

  private async geocodeWithGoogle(address: string): Promise<{ latitude: number; longitude: number } | undefined> {
    if (!this.googleMapsApiKey) return undefined;

    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.googleMapsApiKey}`);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng
        };
      }
    } catch (error) {
      devLog.error('Google geocoding failed:', error);
    }

    return undefined;
  }

  private async getPropertyFromZillow(address: string): Promise<PropertyInfo | null> {
    // Zillow API integration (or alternative property API)
    try {
      const response = await fetch(`https://api.bridgedataoutput.com/api/v2/zestimates_v2/zestimates?access_token=${this.zillowApiKey}&address=${encodeURIComponent(address)}`);
      const data = await response.json();

      if (data.bundle && data.bundle.length > 0) {
        const property = data.bundle[0];
        return {
          county: property.CountyOrParish || 'Unknown',
          estimatedValue: property.ZestimateAmount,
          propertyType: property.PropertyType,
          taxAssessment: property.TaxAssessedValue,
          lastSaleDate: property.LastSaleDate,
          lastSalePrice: property.LastSalePrice,
          yearBuilt: property.YearBuilt,
          squareFootage: property.LivingArea
        };
      }
    } catch (error) {
      devLog.error('Zillow API error:', error);
    }

    return null;
  }

  private getMockPropertyInfo(address: string): PropertyInfo {
    // Mock property data for development
    const mockCounties = ['Los Angeles County', 'Orange County', 'San Diego County', 'Riverside County'];
    const mockTypes = ['single_family', 'condo', 'townhouse', 'apartment'];

    return {
      county: mockCounties[Math.floor(Math.random() * mockCounties.length)],
      estimatedValue: Math.floor(Math.random() * 500000) + 200000,
      propertyType: mockTypes[Math.floor(Math.random() * mockTypes.length)],
      taxAssessment: Math.floor(Math.random() * 400000) + 150000,
      yearBuilt: Math.floor(Math.random() * 50) + 1970,
      squareFootage: Math.floor(Math.random() * 2000) + 800
    };
  }

  private basicAddressValidation(address: string): AddressValidationResult {
    const components = this.parseAddressComponents(address);
    
    return {
      isValid: !!(components.street && components.city && components.state),
      confidence: 0.5,
      standardizedAddress: {
        street: components.street || '',
        city: components.city || '',
        state: components.state || '',
        zipCode: components.zip || '',
        country: components.country || 'US'
      },
      suggestions: components.street && components.city ? [] : ['Address appears incomplete']
    };
  }

  private parseAddressComponents(address: string): any {
    // Basic address parsing
    const parts = address.split(',').map(p => p.trim());
    
    if (parts.length >= 3) {
      const stateZipMatch = parts[parts.length - 1].match(/^([A-Z]{2})\s+(\d{5}(-\d{4})?)$/);
      
      return {
        street: parts[0],
        apartment: parts.length > 3 ? parts[1] : undefined,
        city: parts[parts.length - 2],
        state: stateZipMatch ? stateZipMatch[1] : '',
        zip: stateZipMatch ? stateZipMatch[2] : '',
        country: 'US'
      };
    }

    return {
      street: parts[0] || '',
      city: parts[1] || '',
      state: '',
      zip: '',
      country: 'US'
    };
  }

  private parseGoogleComponents(components: any[]): any {
    const result = {
      streetNumber: '',
      route: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    };

    components.forEach(component => {
      const types = component.types;
      
      if (types.includes('street_number')) {
        result.streetNumber = component.long_name;
      } else if (types.includes('route')) {
        result.route = component.long_name;
      } else if (types.includes('locality')) {
        result.city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        result.state = component.short_name;
      } else if (types.includes('postal_code')) {
        result.zipCode = component.long_name;
      } else if (types.includes('country')) {
        result.country = component.short_name;
      }
    });

    return result;
  }

  private calculateGoogleConfidence(result: any): number {
    let confidence = 0.7; // Base confidence
    
    if (result.geometry.location_type === 'ROOFTOP') {
      confidence = 0.95;
    } else if (result.geometry.location_type === 'RANGE_INTERPOLATED') {
      confidence = 0.85;
    } else if (result.geometry.location_type === 'GEOMETRIC_CENTER') {
      confidence = 0.75;
    }

    return confidence;
  }
}

export const addressIntelligenceService = new AddressIntelligenceService();
