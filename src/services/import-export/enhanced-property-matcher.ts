
import { supabase } from '@/integrations/supabase/client';
import { intelligentUnitParser, ParsedUnitInfo } from './intelligent-unit-parser';
import { devLog } from '@/utils/dev-logger';

export interface PropertyMatchResult {
  property: any | null;
  matchType: 'exact' | 'fuzzy' | 'created' | 'failed';
  confidence: number;
  reason: string;
  created?: boolean;
}

export const enhancedPropertyMatcher = {
  async findOrCreateProperty(
    folderPath: string, 
    associationId: string,
    existingProperties: any[]
  ): Promise<PropertyMatchResult> {
    devLog.info('Finding or creating property for path:', folderPath);

    // Parse unit information from folder path
    const parsedInfo = intelligentUnitParser.parseUnitFromPath(folderPath);
    if (!parsedInfo) {
      return {
        property: null,
        matchType: 'failed',
        confidence: 0,
        reason: 'Could not parse unit information from folder path'
      };
    }

    // Try to find existing property
    const existingProperty = intelligentUnitParser.fuzzyMatchProperty(parsedInfo, existingProperties);
    if (existingProperty) {
      return {
        property: existingProperty,
        matchType: existingProperty.unit_number === parsedInfo.unitNumber ? 'exact' : 'fuzzy',
        confidence: 0.9,
        reason: `Matched existing property by ${existingProperty.unit_number === parsedInfo.unitNumber ? 'exact unit number' : 'fuzzy matching'}`
      };
    }

    // Create new property if we have enough information
    if (parsedInfo.unitNumber) {
      try {
        const newProperty = await this.createPropertyFromParsedInfo(parsedInfo, associationId);
        if (newProperty) {
          // Add to existing properties list for future matching
          existingProperties.push(newProperty);
          
          return {
            property: newProperty,
            matchType: 'created',
            confidence: 0.8,
            reason: `Created new property from parsed info: ${parsedInfo.parsingMethod}`,
            created: true
          };
        }
      } catch (error) {
        devLog.error('Failed to create property:', error);
      }
    }

    return {
      property: null,
      matchType: 'failed',
      confidence: 0,
      reason: `No existing property found and could not create new property. Parsed: ${JSON.stringify(parsedInfo)}`
    };
  },

  async createPropertyFromParsedInfo(parsedInfo: ParsedUnitInfo, associationId: string): Promise<any | null> {
    devLog.info('Creating property from parsed info:', parsedInfo);

    const propertyData = {
      association_id: associationId,
      unit_number: parsedInfo.unitNumber,
      address: parsedInfo.streetAddress || `Unit ${parsedInfo.unitNumber}`,
      property_type: 'unit',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('properties')
      .insert(propertyData)
      .select('*')
      .single();

    if (error) {
      devLog.error('Failed to create property:', error);
      throw error;
    }

    devLog.info('Successfully created property:', data);
    return data;
  },

  async loadExistingProperties(associationId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('association_id', associationId);

    if (error) {
      devLog.error('Failed to load existing properties:', error);
      return [];
    }

    devLog.info(`Loaded ${data?.length || 0} existing properties for association ${associationId}`);
    return data || [];
  }
};
