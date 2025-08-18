import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface WorkflowEvent {
  type: string;
  vendor_id?: string;
  association_id: string;
  data: Record<string, any>;
}

interface WorkflowAction {
  type: string;
  config: Record<string, any>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { event }: { event: WorkflowEvent } = await req.json();
    
    if (!event.association_id) {
      throw new Error('association_id is required');
    }

    console.log('Processing workflow event:', event);

    // Find matching active automations
    const { data: automations, error: automationsError } = await supabase
      .from('vendor_workflow_automations')
      .select('*')
      .eq('association_id', event.association_id)
      .eq('is_active', true)
      .eq('trigger_type', event.type);

    if (automationsError) {
      console.error('Error fetching automations:', automationsError);
      throw automationsError;
    }

    if (!automations || automations.length === 0) {
      console.log('No matching automations found for event type:', event.type);
      return new Response(
        JSON.stringify({ message: 'No matching automations found', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const executionResults = [];

    // Process each matching automation
    for (const automation of automations) {
      try {
        // Check trigger conditions
        if (!evaluateTriggerConditions(automation.trigger_conditions, event.data)) {
          console.log(`Automation ${automation.id} conditions not met, skipping`);
          continue;
        }

        // Create execution record
        const { data: execution, error: executionError } = await supabase
          .from('vendor_workflow_executions')
          .insert({
            automation_id: automation.id,
            vendor_id: event.vendor_id,
            association_id: event.association_id,
            trigger_data: event.data,
            execution_status: 'running',
            started_at: new Date().toISOString()
          })
          .select()
          .single();

        if (executionError) {
          console.error('Error creating execution:', executionError);
          continue;
        }

        console.log(`Started execution ${execution.id} for automation ${automation.id}`);

        // Process actions
        const actionResults = [];
        const actions = automation.actions as WorkflowAction[];

        for (const action of actions) {
          const actionResult = await processAction(action, execution.id, event, supabase);
          actionResults.push(actionResult);
        }

        // Update execution status
        const executionStatus = actionResults.every(r => r.status === 'completed') ? 'completed' : 'failed';
        
        await supabase
          .from('vendor_workflow_executions')
          .update({
            execution_status: executionStatus,
            result: { actions: actionResults },
            completed_at: new Date().toISOString()
          })
          .eq('id', execution.id);

        executionResults.push({
          automation_id: automation.id,
          execution_id: execution.id,
          status: executionStatus,
          actions_processed: actionResults.length
        });

      } catch (error) {
        console.error(`Error processing automation ${automation.id}:`, error);
        executionResults.push({
          automation_id: automation.id,
          status: 'failed',
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Workflow processing completed',
        processed: executionResults.length,
        results: executionResults
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in workflow executor:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function evaluateTriggerConditions(conditions: any, eventData: any): boolean {
  if (!conditions || Object.keys(conditions).length === 0) {
    return true; // No conditions means always match
  }

  // Simple condition evaluation - can be expanded
  for (const [key, expectedValue] of Object.entries(conditions)) {
    if (eventData[key] !== expectedValue) {
      return false;
    }
  }

  return true;
}

async function processAction(
  action: WorkflowAction, 
  executionId: string, 
  event: WorkflowEvent,
  supabase: any
): Promise<any> {
  const startTime = new Date().toISOString();
  
  try {
    // Create action log
    const { data: actionLog } = await supabase
      .from('vendor_workflow_action_logs')
      .insert({
        execution_id: executionId,
        action_type: action.type,
        action_config: action.config,
        status: 'running',
        started_at: startTime
      })
      .select()
      .single();

    let result: any = {};

    switch (action.type) {
      case 'send_notification':
        result = await sendNotification(action.config, event, supabase);
        break;
      
      case 'create_maintenance_request':
        result = await createMaintenanceRequest(action.config, event, supabase);
        break;
      
      case 'update_vendor_status':
        result = await updateVendorStatus(action.config, event, supabase);
        break;
      
      case 'post_comment':
        result = await postComment(action.config, event, supabase);
        break;
      
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }

    // Update action log with success
    await supabase
      .from('vendor_workflow_action_logs')
      .update({
        status: 'completed',
        result,
        completed_at: new Date().toISOString()
      })
      .eq('id', actionLog.id);

    return { status: 'completed', action_type: action.type, result };

  } catch (error) {
    console.error(`Error processing action ${action.type}:`, error);
    
    // Update action log with error
    await supabase
      .from('vendor_workflow_action_logs')
      .update({
        status: 'failed',
        error_message: error.message,
        completed_at: new Date().toISOString()
      })
      .eq('id', actionLog?.id);

    return { status: 'failed', action_type: action.type, error: error.message };
  }
}

async function sendNotification(config: any, event: WorkflowEvent, supabase: any) {
  // Create a communication record
  const { data: communication, error } = await supabase
    .from('communications')
    .insert({
      association_id: event.association_id,
      subject: config.subject || 'Workflow Notification',
      content: config.message || 'Automated workflow notification',
      message_type: 'email',
      status: 'sent',
      metadata: {
        workflow_triggered: true,
        event_type: event.type,
        vendor_id: event.vendor_id
      }
    })
    .select()
    .single();

  if (error) throw error;
  
  return { communication_id: communication.id, message: 'Notification sent' };
}

async function createMaintenanceRequest(config: any, event: WorkflowEvent, supabase: any) {
  // Create a maintenance request
  const { data: request, error } = await supabase
    .from('maintenance_requests')
    .insert({
      association_id: event.association_id,
      property_id: config.property_id,
      title: config.title || 'Workflow Generated Request',
      description: config.description || 'Automatically generated from workflow',
      priority: config.priority || 'medium',
      status: 'open',
      source: 'workflow_automation'
    })
    .select()
    .single();

  if (error) throw error;
  
  return { request_id: request.id, message: 'Maintenance request created' };
}

async function updateVendorStatus(config: any, event: WorkflowEvent, supabase: any) {
  if (!event.vendor_id) {
    throw new Error('vendor_id required for update_vendor_status action');
  }

  const { data: vendor, error } = await supabase
    .from('vendors')
    .update({
      status: config.new_status,
      notes: config.notes ? (vendor?.notes ? `${vendor.notes}\n${config.notes}` : config.notes) : vendor?.notes
    })
    .eq('id', event.vendor_id)
    .select()
    .single();

  if (error) throw error;
  
  return { vendor_id: event.vendor_id, new_status: config.new_status, message: 'Vendor status updated' };
}

async function postComment(config: any, event: WorkflowEvent, supabase: any) {
  // This could post to a vendor profile, maintenance request, etc.
  // For now, we'll create a generic communication record
  const { data: comment, error } = await supabase
    .from('communications')
    .insert({
      association_id: event.association_id,
      subject: 'Workflow Comment',
      content: config.comment,
      message_type: 'internal_note',
      status: 'sent',
      metadata: {
        workflow_comment: true,
        event_type: event.type,
        vendor_id: event.vendor_id
      }
    })
    .select()
    .single();

  if (error) throw error;
  
  return { comment_id: comment.id, message: 'Comment posted' };
}