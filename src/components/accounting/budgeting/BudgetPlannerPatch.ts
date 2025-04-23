
/**
 * This utility file provides conversion functions for the BudgetPlanner component
 * to help transition between camelCase and snake_case formats
 */

import { Budget, BudgetEntry } from '@/types/accounting-types';

// Convert from snake_case (DB format) to camelCase (UI format)
export const convertToCamelCase = (data: any): any => {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => convertToCamelCase(item));
  }
  
  if (data && typeof data === 'object') {
    const converted: any = {};
    
    Object.keys(data).forEach(key => {
      // Map common snake_case fields to camelCase
      const camelKey = key
        .replace(/association_id/g, 'associationId')
        .replace(/gl_account_id/g, 'glAccountId')
        .replace(/annual_total/g, 'annualTotal')
        .replace(/monthly_amounts/g, 'monthlyAmounts')
        .replace(/fund_type/g, 'fundType')
        .replace(/total_revenue/g, 'totalRevenue')
        .replace(/total_expenses/g, 'totalExpenses')
        .replace(/created_at/g, 'createdAt')
        .replace(/created_by/g, 'createdBy')
        .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      
      converted[camelKey] = convertToCamelCase(data[key]);
    });
    
    return converted;
  }
  
  return data;
};

// Convert from camelCase (UI format) to snake_case (DB format)
export const convertToSnakeCase = (data: any): any => {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => convertToSnakeCase(item));
  }
  
  if (data && typeof data === 'object') {
    const converted: any = {};
    
    Object.keys(data).forEach(key => {
      // Map common camelCase fields to snake_case
      const snakeKey = key
        .replace(/associationId/g, 'association_id')
        .replace(/glAccountId/g, 'gl_account_id')
        .replace(/annualTotal/g, 'annual_total')
        .replace(/monthlyAmounts/g, 'monthly_amounts')
        .replace(/fundType/g, 'fund_type')
        .replace(/totalRevenue/g, 'total_revenue')
        .replace(/totalExpenses/g, 'total_expenses')
        .replace(/createdAt/g, 'created_at')
        .replace(/createdBy/g, 'created_by')
        .replace(/([A-Z])/g, (_, letter) => `_${letter.toLowerCase()}`);
      
      converted[snakeKey] = convertToSnakeCase(data[key]);
    });
    
    return converted;
  }
  
  return data;
};

// Budget specific conversions
export const formatBudgetForAPI = (budget: Partial<Budget>): any => {
  return {
    association_id: budget.associationId,
    name: budget.name,
    year: budget.year,
    status: budget.status,
    fund_type: budget.fundType,
    description: budget.description,
    total_revenue: budget.totalRevenue,
    total_expenses: budget.totalExpenses
  };
};

export const formatBudgetEntryForAPI = (entry: Partial<BudgetEntry>): any => {
  return {
    gl_account_id: entry.glAccountId,
    annual_total: entry.annualTotal,
    monthly_amounts: entry.monthlyAmounts,
    previous_year_actual: entry.previousYearActual,
    previous_year_budget: entry.previousYearBudget,
    notes: entry.notes
  };
};

// Use these functions in the BudgetPlanner component
