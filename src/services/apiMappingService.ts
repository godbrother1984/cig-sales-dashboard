import { ConfigurationService } from './configurationService';
import { MappingProfile, FieldMapping } from '../types/configuration';

export interface MappedData {
  [key: string]: any;
}

export interface ApiMappingOptions {
  profile?: string;
  validateRequired?: boolean;
  defaultValues?: Record<string, any>;
}

export class ApiMappingService {
  private static instance: ApiMappingService | null = null;

  static getInstance(): ApiMappingService {
    if (!this.instance) {
      this.instance = new ApiMappingService();
    }
    return this.instance;
  }

  async mapApiResponse(
    apiResponse: any, 
    mappingType: 'salesData' | 'marginBands' | 'orderData',
    options: ApiMappingOptions = {}
  ): Promise<MappedData[]> {
    try {
      const profile = await this.getProfile(options.profile);
      const fieldMappings = profile.fieldMappings[mappingType];
      
      if (!fieldMappings) {
        throw new Error(`No field mappings found for type: ${mappingType}`);
      }

      console.log(`Mapping API response using profile: ${profile.name}`);
      
      // Handle different response structures
      const dataArray = this.extractDataArray(apiResponse, mappingType);
      
      return dataArray.map((item: any) => 
        this.mapSingleItem(item, fieldMappings, options.defaultValues)
      );

    } catch (error) {
      console.error('Error mapping API response:', error);
      throw error;
    }
  }

  async mapSingleRecord(
    record: any, 
    mappingType: 'salesData' | 'marginBands' | 'orderData',
    options: ApiMappingOptions = {}
  ): Promise<MappedData> {
    const profile = await this.getProfile(options.profile);
    const fieldMappings = profile.fieldMappings[mappingType];
    
    if (!fieldMappings) {
      throw new Error(`No field mappings found for type: ${mappingType}`);
    }

    return this.mapSingleItem(record, fieldMappings, options.defaultValues);
  }

  private async getProfile(profileName?: string): Promise<MappingProfile> {
    if (profileName) {
      const apiConfig = await ConfigurationService.getConfig('apiConfiguration');
      const profile = apiConfig.profiles[profileName];
      if (!profile) {
        throw new Error(`Profile '${profileName}' not found`);
      }
      return profile;
    } else {
      return await ConfigurationService.getActiveApiProfile();
    }
  }

  private extractDataArray(apiResponse: any, mappingType: string): any[] {
    // Handle different API response structures
    if (Array.isArray(apiResponse)) {
      return apiResponse;
    }

    // CIG Dynamics API structure
    if (apiResponse.datas) {
      switch (mappingType) {
        case 'salesData':
          return apiResponse.datas.invoice || [];
        case 'orderData':
          return apiResponse.datas.sales_order || [];
        default:
          return apiResponse.datas.invoice || [];
      }
    }

    // Generic structure
    if (apiResponse.data && Array.isArray(apiResponse.data)) {
      return apiResponse.data;
    }

    // Single object response
    return [apiResponse];
  }

  private mapSingleItem(
    source: any, 
    fieldMappings: FieldMapping,
    defaultValues?: Record<string, any>
  ): MappedData {
    const mapped: MappedData = {};

    for (const [targetField, sourcePath] of Object.entries(fieldMappings)) {
      try {
        const value = this.getValueByPath(source, sourcePath);
        mapped[targetField] = value !== undefined ? value : defaultValues?.[targetField];
      } catch (error) {
        console.warn(`Error mapping field ${targetField} from path ${sourcePath}:`, error);
        mapped[targetField] = defaultValues?.[targetField];
      }
    }

    return mapped;
  }

  private getValueByPath(obj: any, path: string): any {
    // Handle JSONPath notation (simplified implementation)
    if (path.includes('[].')) {
      // For array notation like "datas.invoice[].total_inv_amount"
      const [arrayPath, fieldName] = path.split('[].');
      const arrayData = this.getNestedValue(obj, arrayPath);
      
      if (Array.isArray(arrayData)) {
        return arrayData.map(item => this.getNestedValue(item, fieldName));
      }
      return undefined;
    }

    return this.getNestedValue(obj, path);
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && typeof current === 'object' ? current[key] : undefined;
    }, obj);
  }

  async validateMapping(
    apiResponse: any,
    mappingType: 'salesData' | 'marginBands' | 'orderData',
    profileName?: string
  ): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
    sampleMapping: MappedData | null;
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let sampleMapping: MappedData | null = null;

    try {
      const profile = await this.getProfile(profileName);
      const fieldMappings = profile.fieldMappings[mappingType];

      if (!fieldMappings) {
        errors.push(`No field mappings configured for ${mappingType}`);
        return { valid: false, errors, warnings, sampleMapping };
      }

      const dataArray = this.extractDataArray(apiResponse, mappingType);
      
      if (dataArray.length === 0) {
        warnings.push('No data found in API response');
        return { valid: true, errors, warnings, sampleMapping };
      }

      // Test mapping with first item
      sampleMapping = this.mapSingleItem(dataArray[0], fieldMappings);
      
      // Validate required fields
      for (const [targetField, sourcePath] of Object.entries(fieldMappings)) {
        const value = this.getValueByPath(dataArray[0], sourcePath);
        if (value === undefined) {
          warnings.push(`Field '${targetField}' could not be mapped from path '${sourcePath}'`);
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        sampleMapping
      };

    } catch (error) {
      errors.push(`Mapping validation failed: ${error.message}`);
      return { valid: false, errors, warnings, sampleMapping };
    }
  }

  async getAvailableProfiles(): Promise<Array<{ name: string; description: string }>> {
    const apiConfig = await ConfigurationService.getConfig('apiConfiguration');
    return Object.values(apiConfig.profiles).map(profile => ({
      name: profile.name,
      description: profile.description
    }));
  }

  async switchProfile(profileName: string): Promise<void> {
    await ConfigurationService.switchApiProfile(profileName);
  }

  async testProfileMapping(
    profileName: string,
    testData: any
  ): Promise<{
    salesData?: MappedData[];
    marginBands?: MappedData[];
    orderData?: MappedData[];
    errors: string[];
  }> {
    const results: any = { errors: [] };

    try {
      const profile = await this.getProfile(profileName);
      
      // Test each mapping type that exists in the profile
      for (const mappingType of ['salesData', 'marginBands', 'orderData'] as const) {
        if (profile.fieldMappings[mappingType]) {
          try {
            results[mappingType] = await this.mapApiResponse(
              testData, 
              mappingType, 
              { profile: profileName }
            );
          } catch (error) {
            results.errors.push(`${mappingType}: ${error.message}`);
          }
        }
      }

    } catch (error) {
      results.errors.push(`Profile test failed: ${error.message}`);
    }

    return results;
  }

  async updateFieldMapping(
    mappingType: 'salesData' | 'marginBands' | 'orderData',
    fieldMappings: FieldMapping,
    profileName?: string
  ): Promise<void> {
    const apiConfig = await ConfigurationService.getConfig('apiConfiguration');
    const targetProfile = profileName || apiConfig.activeProfile;
    
    if (!apiConfig.profiles[targetProfile]) {
      throw new Error(`Profile '${targetProfile}' not found`);
    }

    // Update the field mappings for the specific profile
    const updatedProfiles = {
      ...apiConfig.profiles,
      [targetProfile]: {
        ...apiConfig.profiles[targetProfile],
        fieldMappings: {
          ...apiConfig.profiles[targetProfile].fieldMappings,
          [mappingType]: fieldMappings
        }
      }
    };

    await ConfigurationService.updateConfig('apiConfiguration', {
      profiles: updatedProfiles
    });

    console.log(`Updated ${mappingType} field mappings for profile: ${targetProfile}`);
  }
}