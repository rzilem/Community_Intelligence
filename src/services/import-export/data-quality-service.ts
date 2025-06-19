
import { devLog } from '@/utils/dev-logger';

export interface DataQualityIssue {
  id: string;
  type: 'missing_data' | 'invalid_format' | 'inconsistent_data' | 'duplicate_data' | 'outlier' | 'constraint_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  field: string;
  record: any;
  recordIndex: number;
  description: string;
  suggestedFix?: string;
  autoFixable: boolean;
  confidence: number;
}

export interface DataQualityRule {
  id: string;
  name: string;
  description: string;
  field: string;
  ruleType: 'required' | 'format' | 'range' | 'enum' | 'pattern' | 'custom';
  configuration: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
}

export interface DataQualityReport {
  overallScore: number;
  totalRecords: number;
  totalIssues: number;
  issuesByType: Record<string, number>;
  issuesBySeverity: Record<string, number>;
  issues: DataQualityIssue[];
  fieldQualityScores: Record<string, number>;
  recommendations: string[];
  fixableIssues: number;
  processingTime: number;
}

export const dataQualityService = {
  async assessDataQuality(data: any[], rules: DataQualityRule[] = []): Promise<DataQualityReport> {
    const startTime = Date.now();
    devLog.info('Starting data quality assessment...');
    
    const issues: DataQualityIssue[] = [];
    const defaultRules = this.getDefaultQualityRules();
    const allRules = [...defaultRules, ...rules];
    
    // Assess each record
    for (let i = 0; i < data.length; i++) {
      const record = data[i];
      const recordIssues = await this.assessRecord(record, i, allRules);
      issues.push(...recordIssues);
    }
    
    // Calculate quality metrics
    const report = this.buildQualityReport(data, issues, Date.now() - startTime);
    
    devLog.info('Data quality assessment complete:', {
      totalRecords: data.length,
      totalIssues: issues.length,
      overallScore: report.overallScore
    });
    
    return report;
  },

  async assessRecord(record: any, index: number, rules: DataQualityRule[]): Promise<DataQualityIssue[]> {
    const issues: DataQualityIssue[] = [];
    
    for (const rule of rules.filter(r => r.isActive)) {
      const fieldValue = record[rule.field];
      const issue = await this.applyRule(rule, fieldValue, record, index);
      
      if (issue) {
        issues.push(issue);
      }
    }
    
    // Additional cross-field validations
    const crossFieldIssues = this.performCrossFieldValidation(record, index);
    issues.push(...crossFieldIssues);
    
    return issues;
  },

  async applyRule(rule: DataQualityRule, fieldValue: any, record: any, recordIndex: number): Promise<DataQualityIssue | null> {
    let isValid = true;
    let description = '';
    let suggestedFix = '';
    
    switch (rule.ruleType) {
      case 'required':
        isValid = fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
        description = `Required field '${rule.field}' is missing`;
        suggestedFix = 'Provide a value for this field';
        break;
        
      case 'format':
        isValid = this.validateFormat(fieldValue, rule.configuration);
        description = `Field '${rule.field}' has invalid format`;
        suggestedFix = `Expected format: ${rule.configuration.expectedFormat}`;
        break;
        
      case 'range':
        isValid = this.validateRange(fieldValue, rule.configuration);
        description = `Field '${rule.field}' is outside valid range`;
        suggestedFix = `Value should be between ${rule.configuration.min} and ${rule.configuration.max}`;
        break;
        
      case 'enum':
        isValid = this.validateEnum(fieldValue, rule.configuration);
        description = `Field '${rule.field}' contains invalid value`;
        suggestedFix = `Valid values: ${rule.configuration.allowedValues.join(', ')}`;
        break;
        
      case 'pattern':
        isValid = this.validatePattern(fieldValue, rule.configuration);
        description = `Field '${rule.field}' doesn't match expected pattern`;
        suggestedFix = `Should match pattern: ${rule.configuration.pattern}`;
        break;
        
      case 'custom':
        const customResult = await this.validateCustom(fieldValue, rule.configuration, record);
        isValid = customResult.isValid;
        description = customResult.description;
        suggestedFix = customResult.suggestedFix;
        break;
    }
    
    if (!isValid) {
      return {
        id: `${recordIndex}-${rule.field}-${rule.id}`,
        type: this.mapRuleTypeToIssueType(rule.ruleType),
        severity: rule.severity,
        field: rule.field,
        record,
        recordIndex,
        description,
        suggestedFix,
        autoFixable: this.isAutoFixable(rule.ruleType, rule.configuration),
        confidence: 0.9
      };
    }
    
    return null;
  },

  validateFormat(value: any, config: any): boolean {
    if (!value) return true; // Skip validation for empty values unless required
    
    const str = String(value);
    
    switch (config.type) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
      case 'phone':
        return /^\+?[\d\s\-\(\)]+$/.test(str);
      case 'date':
        return !isNaN(Date.parse(str));
      case 'number':
        return !isNaN(Number(str));
      case 'postal_code':
        return /^\d{5}(-\d{4})?$/.test(str);
      default:
        return true;
    }
  },

  validateRange(value: any, config: any): boolean {
    if (value === null || value === undefined) return true;
    
    const num = Number(value);
    if (isNaN(num)) return false;
    
    const { min, max } = config;
    return (!min || num >= min) && (!max || num <= max);
  },

  validateEnum(value: any, config: any): boolean {
    if (!value) return true;
    return config.allowedValues.includes(value);
  },

  validatePattern(value: any, config: any): boolean {
    if (!value) return true;
    const regex = new RegExp(config.pattern, config.flags || '');
    return regex.test(String(value));
  },

  async validateCustom(value: any, config: any, record: any): Promise<{ isValid: boolean; description: string; suggestedFix: string }> {
    // Execute custom validation function
    try {
      const result = await config.validator(value, record);
      return {
        isValid: result.isValid,
        description: result.description || 'Custom validation failed',
        suggestedFix: result.suggestedFix || 'Review and correct the value'
      };
    } catch (error) {
      return {
        isValid: false,
        description: 'Custom validation error',
        suggestedFix: 'Check validation logic'
      };
    }
  },

  performCrossFieldValidation(record: any, index: number): DataQualityIssue[] {
    const issues: DataQualityIssue[] = [];
    
    // Date consistency checks
    if (record.start_date && record.end_date) {
      const startDate = new Date(record.start_date);
      const endDate = new Date(record.end_date);
      
      if (startDate > endDate) {
        issues.push({
          id: `${index}-date-consistency`,
          type: 'inconsistent_data',
          severity: 'high',
          field: 'start_date,end_date',
          record,
          recordIndex: index,
          description: 'Start date is after end date',
          suggestedFix: 'Ensure start date comes before end date',
          autoFixable: false,
          confidence: 1.0
        });
      }
    }
    
    // Address consistency
    if (record.state && record.country) {
      if (record.country === 'US' && record.state && record.state.length !== 2) {
        issues.push({
          id: `${index}-state-format`,
          type: 'invalid_format',
          severity: 'medium',
          field: 'state',
          record,
          recordIndex: index,
          description: 'US state should be 2-letter code',
          suggestedFix: 'Use 2-letter state abbreviation (e.g., CA, NY)',
          autoFixable: true,
          confidence: 0.8
        });
      }
    }
    
    // Financial data consistency
    if (record.amount && record.total_amount) {
      const amount = Number(record.amount);
      const total = Number(record.total_amount);
      
      if (!isNaN(amount) && !isNaN(total) && amount > total) {
        issues.push({
          id: `${index}-amount-consistency`,
          type: 'inconsistent_data',
          severity: 'high',
          field: 'amount,total_amount',
          record,
          recordIndex: index,
          description: 'Amount exceeds total amount',
          suggestedFix: 'Verify amount calculations',
          autoFixable: false,
          confidence: 0.9
        });
      }
    }
    
    return issues;
  },

  getDefaultQualityRules(): DataQualityRule[] {
    return [
      {
        id: 'email-format',
        name: 'Email Format',
        description: 'Validates email address format',
        field: 'email',
        ruleType: 'format',
        configuration: { type: 'email' },
        severity: 'medium',
        isActive: true
      },
      {
        id: 'phone-format',
        name: 'Phone Format',
        description: 'Validates phone number format',
        field: 'phone',
        ruleType: 'format',
        configuration: { type: 'phone' },
        severity: 'low',
        isActive: true
      },
      {
        id: 'required-name',
        name: 'Required Name',
        description: 'Name field is required',
        field: 'name',
        ruleType: 'required',
        configuration: {},
        severity: 'high',
        isActive: true
      },
      {
        id: 'amount-range',
        name: 'Amount Range',
        description: 'Amount should be positive',
        field: 'amount',
        ruleType: 'range',
        configuration: { min: 0 },
        severity: 'medium',
        isActive: true
      }
    ];
  },

  mapRuleTypeToIssueType(ruleType: string): DataQualityIssue['type'] {
    const mapping: Record<string, DataQualityIssue['type']> = {
      'required': 'missing_data',
      'format': 'invalid_format',
      'range': 'constraint_violation',
      'enum': 'invalid_format',
      'pattern': 'invalid_format',
      'custom': 'constraint_violation'
    };
    
    return mapping[ruleType] || 'constraint_violation';
  },

  isAutoFixable(ruleType: string, config: any): boolean {
    const autoFixableTypes = ['format'];
    return autoFixableTypes.includes(ruleType);
  },

  buildQualityReport(data: any[], issues: DataQualityIssue[], processingTime: number): DataQualityReport {
    const totalRecords = data.length;
    const totalIssues = issues.length;
    
    // Calculate overall score (0-100)
    const maxPossibleIssues = totalRecords * 10; // Assume max 10 issues per record
    const overallScore = Math.max(0, Math.round(100 - (totalIssues / maxPossibleIssues) * 100));
    
    // Group issues by type and severity
    const issuesByType: Record<string, number> = {};
    const issuesBySeverity: Record<string, number> = {};
    
    issues.forEach(issue => {
      issuesByType[issue.type] = (issuesByType[issue.type] || 0) + 1;
      issuesBySeverity[issue.severity] = (issuesBySeverity[issue.severity] || 0) + 1;
    });
    
    // Calculate field quality scores
    const fieldQualityScores: Record<string, number> = {};
    const fieldIssueCounts: Record<string, number> = {};
    
    issues.forEach(issue => {
      fieldIssueCounts[issue.field] = (fieldIssueCounts[issue.field] || 0) + 1;
    });
    
    // Get all fields from data
    const allFields = new Set<string>();
    data.forEach(record => {
      Object.keys(record).forEach(field => allFields.add(field));
    });
    
    allFields.forEach(field => {
      const issueCount = fieldIssueCounts[field] || 0;
      fieldQualityScores[field] = Math.max(0, Math.round(100 - (issueCount / totalRecords) * 100));
    });
    
    const fixableIssues = issues.filter(issue => issue.autoFixable).length;
    const recommendations = this.generateRecommendations(issues, overallScore);
    
    return {
      overallScore,
      totalRecords,
      totalIssues,
      issuesByType,
      issuesBySeverity,
      issues,
      fieldQualityScores,
      recommendations,
      fixableIssues,
      processingTime
    };
  },

  generateRecommendations(issues: DataQualityIssue[], overallScore: number): string[] {
    const recommendations: string[] = [];
    
    if (overallScore >= 90) {
      recommendations.push('Excellent data quality! Only minor issues detected.');
    } else if (overallScore >= 70) {
      recommendations.push('Good data quality with some areas for improvement.');
    } else if (overallScore >= 50) {
      recommendations.push('Moderate data quality issues require attention.');
    } else {
      recommendations.push('Poor data quality - significant cleanup needed before import.');
    }
    
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    if (criticalIssues > 0) {
      recommendations.push(`${criticalIssues} critical issues must be resolved before proceeding.`);
    }
    
    const autoFixableCount = issues.filter(i => i.autoFixable).length;
    if (autoFixableCount > 0) {
      recommendations.push(`${autoFixableCount} issues can be automatically fixed.`);
    }
    
    // Field-specific recommendations
    const fieldIssues = issues.reduce((acc, issue) => {
      acc[issue.field] = (acc[issue.field] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topIssueFields = Object.entries(fieldIssues)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    
    if (topIssueFields.length > 0) {
      recommendations.push(`Focus cleanup efforts on: ${topIssueFields.map(([field]) => field).join(', ')}`);
    }
    
    return recommendations;
  },

  async autoFixIssues(data: any[], issues: DataQualityIssue[]): Promise<{ fixedData: any[]; fixedIssues: DataQualityIssue[]; unfixedIssues: DataQualityIssue[] }> {
    const fixedData = JSON.parse(JSON.stringify(data)); // Deep clone
    const fixedIssues: DataQualityIssue[] = [];
    const unfixedIssues: DataQualityIssue[] = [];
    
    for (const issue of issues) {
      if (issue.autoFixable) {
        const fixed = await this.attemptAutoFix(fixedData[issue.recordIndex], issue);
        if (fixed) {
          fixedIssues.push(issue);
        } else {
          unfixedIssues.push(issue);
        }
      } else {
        unfixedIssues.push(issue);
      }
    }
    
    return { fixedData, fixedIssues, unfixedIssues };
  },

  async attemptAutoFix(record: any, issue: DataQualityIssue): Promise<boolean> {
    try {
      switch (issue.type) {
        case 'invalid_format':
          return this.fixFormatIssue(record, issue);
        case 'missing_data':
          return this.fixMissingData(record, issue);
        default:
          return false;
      }
    } catch (error) {
      devLog.error('Auto-fix failed:', error);
      return false;
    }
  },

  fixFormatIssue(record: any, issue: DataQualityIssue): boolean {
    const value = record[issue.field];
    
    // Phone number formatting
    if (issue.field === 'phone' && value) {
      const digits = String(value).replace(/\D/g, '');
      if (digits.length === 10) {
        record[issue.field] = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
        return true;
      }
    }
    
    // Email formatting
    if (issue.field === 'email' && value) {
      record[issue.field] = String(value).toLowerCase().trim();
      return true;
    }
    
    return false;
  },

  fixMissingData(record: any, issue: DataQualityIssue): boolean {
    // For now, we can't automatically fix missing required data
    // This would require business logic or user input
    return false;
  }
};
