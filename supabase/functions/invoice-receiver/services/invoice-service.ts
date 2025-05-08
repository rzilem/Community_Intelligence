
import { LoggingService } from "./logging-service.ts";
import { corsHeaders } from "../utils/cors-headers.ts";

export async function storeInvoice(invoiceData: any, requestId: string, loggingService: LoggingService, supabase: any) {
  try {
    const { data: invoice, error: insertError } = await supabase
      .from('invoices')
      .insert(invoiceData)
      .select();
    
    if (insertError) {
      await loggingService.logError(requestId, "Error inserting invoice", insertError);
      return { 
        success: false, 
        error: "Database error", 
        details: insertError.message 
      };
    }
    
    await loggingService.logInfo(requestId, "Invoice created successfully", { id: invoice[0].id });
    
    return { 
      success: true, 
      message: "Invoice created", 
      invoice: invoice[0] 
    };
  } catch (dbError: any) {
    await loggingService.logError(requestId, "Database error creating invoice", dbError);
    return { 
      success: false, 
      error: "Database error", 
      details: dbError.message 
    };
  }
}
