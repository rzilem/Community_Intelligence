
interface ParsedSearch {
  query: string;
  operators: Record<string, string | string[]>;
  filters: any;
}

export class SearchOperatorParser {
  private static operatorPatterns = {
    // Basic operators
    type: /type:(\w+)/g,
    status: /status:(\w+)/g,
    priority: /priority:(low|medium|high|urgent)/g,
    
    // Date operators
    after: /after:(\d{4}-\d{2}-\d{2})/g,
    before: /before:(\d{4}-\d{2}-\d{2})/g,
    date: /date:(\d{4}-\d{2}-\d{2})/g,
    
    // Association operators
    association: /association:([a-f0-9-]+|"[^"]+"|'[^']+')/g,
    hoa: /hoa:([a-f0-9-]+|"[^"]+"|'[^']+')/g,
    
    // Assignment operators
    assigned: /assigned:(\w+|"[^"]+"|'[^']+')/g,
    assignedto: /assignedto:(\w+|"[^"]+"|'[^']+')/g,
    
    // Amount operators
    amount: /amount:([><]=?)(\d+\.?\d*)/g,
    
    // Boolean operators
    is: /is:(open|closed|paid|unpaid|active|inactive|archived)/g,
    has: /has:(attachment|note|comment|image)/g,
    
    // Advanced operators
    in: /in:(inbox|draft|sent|trash)/g,
    tag: /tag:(\w+)/g,
    category: /category:(\w+)/g,
    
    // Negation operator
    not: /-(\w+:[^\s]+)/g
  };

  private static booleanOperators = {
    AND: /\s+AND\s+/gi,
    OR: /\s+OR\s+/gi,
    NOT: /\s+NOT\s+/gi
  };

  static parse(input: string): ParsedSearch {
    let query = input.trim();
    const operators: Record<string, string | string[]> = {};
    const filters: any = {};

    // Extract operators
    Object.entries(this.operatorPatterns).forEach(([key, pattern]) => {
      const matches = Array.from(query.matchAll(pattern));
      
      if (matches.length > 0) {
        if (key === 'amount') {
          // Special handling for amount operators
          matches.forEach(match => {
            const operator = match[1]; // >, <, >=, <=
            const value = parseFloat(match[2]);
            filters.amount = { operator, value };
          });
        } else if (key === 'not') {
          // Handle negation
          matches.forEach(match => {
            const negatedOperator = match[1];
            const [negKey, negValue] = negatedOperator.split(':');
            if (!operators.not) operators.not = [];
            (operators.not as string[]).push(`${negKey}:${negValue}`);
          });
        } else {
          // Regular operators
          const values = matches.map(match => 
            match[1].replace(/^["']|["']$/g, '') // Remove quotes
          );
          
          if (values.length === 1) {
            operators[key] = values[0];
          } else if (values.length > 1) {
            operators[key] = values;
          }
        }

        // Remove operator from query
        query = query.replace(pattern, '').trim();
      }
    });

    // Process date operators into filters
    if (operators.after || operators.before || operators.date) {
      filters.dateRange = {};
      
      if (operators.after) {
        filters.dateRange.start = operators.after;
      }
      
      if (operators.before) {
        filters.dateRange.end = operators.before;
      }
      
      if (operators.date) {
        filters.dateRange.start = operators.date;
        filters.dateRange.end = operators.date;
      }
    }

    // Process other operators into filters
    if (operators.type) {
      filters.types = Array.isArray(operators.type) ? operators.type : [operators.type];
    }

    if (operators.status) {
      filters.status = Array.isArray(operators.status) ? operators.status : [operators.status];
    }

    if (operators.priority) {
      filters.priority = Array.isArray(operators.priority) ? operators.priority : [operators.priority];
    }

    if (operators.association || operators.hoa) {
      filters.associationId = operators.association || operators.hoa;
    }

    if (operators.assigned || operators.assignedto) {
      filters.assignedTo = operators.assigned || operators.assignedto;
    }

    if (operators.is) {
      const isValues = Array.isArray(operators.is) ? operators.is : [operators.is];
      isValues.forEach(value => {
        switch (value) {
          case 'open':
          case 'closed':
            if (!filters.status) filters.status = [];
            filters.status.push(value);
            break;
          case 'paid':
          case 'unpaid':
            filters.paymentStatus = value;
            break;
          case 'active':
          case 'inactive':
          case 'archived':
            filters.status = value;
            break;
        }
      });
    }

    // Clean up query
    query = query.replace(/\s+/g, ' ').trim();

    return {
      query,
      operators,
      filters
    };
  }

  static buildQuery(query: string, filters: any): string {
    let result = query;

    if (filters.types?.length) {
      result += ` type:${filters.types[0]}`;
    }

    if (filters.status?.length) {
      result += ` status:${filters.status[0]}`;
    }

    if (filters.priority?.length) {
      result += ` priority:${filters.priority[0]}`;
    }

    if (filters.dateRange) {
      if (filters.dateRange.start) {
        result += ` after:${filters.dateRange.start}`;
      }
      if (filters.dateRange.end && filters.dateRange.end !== filters.dateRange.start) {
        result += ` before:${filters.dateRange.end}`;
      }
    }

    if (filters.associationId) {
      result += ` association:${filters.associationId}`;
    }

    return result.trim();
  }

  static getAvailableOperators(): Array<{ operator: string; description: string; example: string }> {
    return [
      { operator: 'type:', description: 'Filter by content type', example: 'type:invoice' },
      { operator: 'status:', description: 'Filter by status', example: 'status:open' },
      { operator: 'priority:', description: 'Filter by priority', example: 'priority:high' },
      { operator: 'after:', description: 'Items after date', example: 'after:2024-01-01' },
      { operator: 'before:', description: 'Items before date', example: 'before:2024-12-31' },
      { operator: 'assigned:', description: 'Assigned to user', example: 'assigned:john' },
      { operator: 'association:', description: 'From specific association', example: 'association:oak-grove' },
      { operator: 'amount:', description: 'Filter by amount', example: 'amount:>1000' },
      { operator: 'is:', description: 'Filter by state', example: 'is:paid' },
      { operator: 'has:', description: 'Has specific content', example: 'has:attachment' },
      { operator: '-', description: 'Exclude items', example: '-status:closed' }
    ];
  }
}

export default SearchOperatorParser;
