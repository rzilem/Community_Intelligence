
import { createEnhancedSupabaseClient, getUserSessionToken } from './enhanced-supabase-client';
import { devLog } from '@/utils/dev-logger';

export interface TransactionContext {
  client: any;
  rollbackData: Array<{
    table: string;
    operation: 'insert' | 'update' | 'delete';
    id?: string;
    data?: any;
  }>;
}

export class TransactionManager {
  private rollbackOperations: Array<() => Promise<void>> = [];
  private client: any;

  constructor(userToken?: string) {
    this.client = createEnhancedSupabaseClient(userToken);
  }

  static async create(): Promise<TransactionManager> {
    const token = await getUserSessionToken();
    return new TransactionManager(token);
  }

  async executeWithRollback<T>(
    operation: (context: TransactionContext) => Promise<T>
  ): Promise<T> {
    const context: TransactionContext = {
      client: this.client,
      rollbackData: []
    };

    try {
      devLog.info('[TransactionManager] Starting transaction');
      const result = await operation(context);
      devLog.info('[TransactionManager] Transaction completed successfully');
      return result;
    } catch (error) {
      devLog.error('[TransactionManager] Transaction failed, rolling back:', error);
      await this.rollback(context);
      throw error;
    }
  }

  private async rollback(context: TransactionContext): Promise<void> {
    devLog.info('[TransactionManager] Starting rollback operations');
    
    // Reverse the rollback data to undo operations in reverse order
    const reversedOperations = [...context.rollbackData].reverse();
    
    for (const operation of reversedOperations) {
      try {
        switch (operation.operation) {
          case 'insert':
            // Delete the inserted record
            if (operation.id) {
              await context.client
                .from(operation.table)
                .delete()
                .eq('id', operation.id);
              devLog.info(`[TransactionManager] Rolled back insert: ${operation.table}/${operation.id}`);
            }
            break;
            
          case 'update':
            // Restore the original data
            if (operation.id && operation.data) {
              await context.client
                .from(operation.table)
                .update(operation.data)
                .eq('id', operation.id);
              devLog.info(`[TransactionManager] Rolled back update: ${operation.table}/${operation.id}`);
            }
            break;
            
          case 'delete':
            // Restore the deleted record
            if (operation.data) {
              await context.client
                .from(operation.table)
                .insert(operation.data);
              devLog.info(`[TransactionManager] Rolled back delete: ${operation.table}`);
            }
            break;
        }
      } catch (rollbackError) {
        devLog.error(`[TransactionManager] Rollback failed for ${operation.table}:`, rollbackError);
      }
    }
    
    devLog.info('[TransactionManager] Rollback completed');
  }

  // Helper method to track insertions for rollback
  async trackedInsert(
    context: TransactionContext,
    table: string,
    data: any
  ): Promise<any> {
    const { data: result, error } = await context.client
      .from(table)
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to insert into ${table}: ${error.message}`);
    }

    // Track for rollback
    context.rollbackData.push({
      table,
      operation: 'insert',
      id: result.id
    });

    return result;
  }

  // Helper method to track updates for rollback
  async trackedUpdate(
    context: TransactionContext,
    table: string,
    id: string,
    newData: any
  ): Promise<any> {
    // First, get the current data for rollback
    const { data: currentData } = await context.client
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    const { data: result, error } = await context.client
      .from(table)
      .update(newData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update ${table}: ${error.message}`);
    }

    // Track for rollback
    context.rollbackData.push({
      table,
      operation: 'update',
      id,
      data: currentData
    });

    return result;
  }
}
