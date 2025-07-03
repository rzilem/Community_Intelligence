-- Enable RLS and add policies for Week 6 tables
ALTER TABLE gl_account_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_values ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Week 6 tables
CREATE POLICY "Users can access GL account balances for their associations"
ON gl_account_balances FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access financial periods for their associations"
ON financial_periods FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access budget entries for their associations"
ON budget_entries FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access cash flow forecasts for their associations"
ON cash_flow_forecasts FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access financial reports for their associations"
ON financial_reports FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access KPI definitions for their associations"
ON kpi_definitions FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access KPI values for their associations"
ON kpi_values FOR ALL USING (
  kpi_definition_id IN (
    SELECT id FROM kpi_definitions WHERE check_user_association(association_id)
  )
);

-- Update triggers for timestamp columns
CREATE TRIGGER update_gl_account_balances_updated_at
  BEFORE UPDATE ON gl_account_balances FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_periods_updated_at
  BEFORE UPDATE ON financial_periods FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_entries_updated_at
  BEFORE UPDATE ON budget_entries FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cash_flow_forecasts_updated_at
  BEFORE UPDATE ON cash_flow_forecasts FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kpi_definitions_updated_at
  BEFORE UPDATE ON kpi_definitions FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();