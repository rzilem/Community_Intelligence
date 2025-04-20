
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { glAccountsSeedData } from "@/utils/glAccountsSeedData";

// OPTIONAL: association_id can be set to null for global GLs, or to your current association.
const association_id = null;

const GLAccountsSeeder: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const handleSeed = async () => {
    setLoading(true);
    try {
      const seed = glAccountsSeedData.map(acc => ({
        code: acc.code,
        name: acc.name,
        type: acc.type,
        association_id,
        balance: 0,
        description: acc.name,
      }));
      const { data, error } = await supabase.from("gl_accounts").insert(seed);
      if (error) throw error;
      toast.success("GL Accounts Seeded!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to seed GL accounts");
    }
    setLoading(false);
  };

  return (
    <Button onClick={handleSeed} disabled={loading}>
      {loading ? "Seeding..." : "Seed GL Accounts"}
    </Button>
  );
};

export default GLAccountsSeeder;
