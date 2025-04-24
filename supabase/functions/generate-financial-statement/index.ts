
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";

// CORS headers for browser access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { associationId, statementType, startDate, endDate } = await req.json();

    // Validation
    if (!associationId || !statementType || !startDate || !endDate) {
      return new Response(
        JSON.stringify({
          error: "Missing required parameters",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract financial data based on statement type
    let data;
    if (statementType === "income") {
      data = await generateIncomeStatement(supabase, associationId, startDate, endDate);
    } else if (statementType === "balance_sheet") {
      data = await generateBalanceSheet(supabase, associationId, startDate, endDate);
    } else if (statementType === "cash_flow") {
      data = await generateCashFlowStatement(supabase, associationId, startDate, endDate);
    } else {
      return new Response(
        JSON.stringify({
          error: "Invalid statement type",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Store the generated statement in the database
    const { data: statement, error } = await supabase
      .from("financial_statements")
      .insert({
        association_id: associationId,
        statement_type: statementType,
        period_start: startDate,
        period_end: endDate,
        data,
        created_by: req.headers.get("authorization")?.split(" ")[1], // Extract user ID from auth header
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, data: statement }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating financial statement:", error);

    return new Response(
      JSON.stringify({
        error: error.message || "Failed to generate financial statement",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Generate Income Statement
async function generateIncomeStatement(supabase, associationId, startDate, endDate) {
  console.log("Generating income statement", { associationId, startDate, endDate });
  
  // Fetch revenue accounts
  const { data: revenueAccounts, error: revenueError } = await supabase
    .from("gl_accounts")
    .select("id, name, code, balance")
    .eq("association_id", associationId)
    .eq("type", "revenue")
    .order("code");

  if (revenueError) throw revenueError;

  // Fetch expense accounts
  const { data: expenseAccounts, error: expenseError } = await supabase
    .from("gl_accounts")
    .select("id, name, code, balance")
    .eq("association_id", associationId)
    .eq("type", "expense")
    .order("code");

  if (expenseError) throw expenseError;

  // Calculate totals
  const totalRevenue = revenueAccounts.reduce((sum, account) => sum + Number(account.balance), 0);
  const totalExpenses = expenseAccounts.reduce((sum, account) => sum + Number(account.balance), 0);
  const netIncome = totalRevenue - totalExpenses;

  return {
    statementName: "Income Statement",
    periodStart: startDate,
    periodEnd: endDate,
    revenue: {
      accounts: revenueAccounts,
      total: totalRevenue
    },
    expenses: {
      accounts: expenseAccounts,
      total: totalExpenses
    },
    netIncome,
    createdAt: new Date().toISOString()
  };
}

// Generate Balance Sheet
async function generateBalanceSheet(supabase, associationId, asOfDate) {
  console.log("Generating balance sheet", { associationId, asOfDate });
  
  // Fetch asset accounts
  const { data: assetAccounts, error: assetError } = await supabase
    .from("gl_accounts")
    .select("id, name, code, balance")
    .eq("association_id", associationId)
    .eq("type", "asset")
    .order("code");

  if (assetError) throw assetError;

  // Fetch liability accounts
  const { data: liabilityAccounts, error: liabilityError } = await supabase
    .from("gl_accounts")
    .select("id, name, code, balance")
    .eq("association_id", associationId)
    .eq("type", "liability")
    .order("code");

  if (liabilityError) throw liabilityError;

  // Fetch equity accounts
  const { data: equityAccounts, error: equityError } = await supabase
    .from("gl_accounts")
    .select("id, name, code, balance")
    .eq("association_id", associationId)
    .eq("type", "equity")
    .order("code");

  if (equityError) throw equityError;

  // Calculate totals
  const totalAssets = assetAccounts.reduce((sum, account) => sum + Number(account.balance), 0);
  const totalLiabilities = liabilityAccounts.reduce((sum, account) => sum + Number(account.balance), 0);
  const totalEquity = equityAccounts.reduce((sum, account) => sum + Number(account.balance), 0);

  return {
    statementName: "Balance Sheet",
    asOfDate,
    assets: {
      accounts: assetAccounts,
      total: totalAssets
    },
    liabilities: {
      accounts: liabilityAccounts,
      total: totalLiabilities
    },
    equity: {
      accounts: equityAccounts,
      total: totalEquity
    },
    createdAt: new Date().toISOString()
  };
}

// Generate Cash Flow Statement
async function generateCashFlowStatement(supabase, associationId, startDate, endDate) {
  console.log("Generating cash flow statement", { associationId, startDate, endDate });
  
  // Fetch operating activities
  const { data: operatingActivities, error: operatingError } = await supabase
    .from("gl_accounts")
    .select("id, name, code, balance")
    .eq("association_id", associationId)
    .in("type", ["revenue", "expense"])
    .order("code");

  if (operatingError) throw operatingError;

  // Fetch investment activities
  const { data: investingActivities, error: investingError } = await supabase
    .from("gl_accounts")
    .select("id, name, code, balance")
    .eq("association_id", associationId)
    .eq("category", "investing")
    .order("code");

  if (investingError) throw investingError;

  // Fetch financing activities
  const { data: financingActivities, error: financingError } = await supabase
    .from("gl_accounts")
    .select("id, name, code, balance")
    .eq("association_id", associationId)
    .eq("category", "financing")
    .order("code");

  if (financingError) throw financingError;

  // Calculate totals
  const totalOperating = operatingActivities.reduce((sum, account) => {
    // For expenses, subtract; for revenue, add
    const modifier = account.type === "expense" ? -1 : 1;
    return sum + (Number(account.balance) * modifier);
  }, 0);
  
  const totalInvesting = investingActivities.reduce((sum, account) => sum + Number(account.balance), 0);
  const totalFinancing = financingActivities.reduce((sum, account) => sum + Number(account.balance), 0);
  const netCashFlow = totalOperating + totalInvesting + totalFinancing;

  return {
    statementName: "Cash Flow Statement",
    periodStart: startDate,
    periodEnd: endDate,
    operating: {
      activities: operatingActivities,
      total: totalOperating
    },
    investing: {
      activities: investingActivities,
      total: totalInvesting
    },
    financing: {
      activities: financingActivities, 
      total: totalFinancing
    },
    netCashFlow,
    createdAt: new Date().toISOString()
  };
}
