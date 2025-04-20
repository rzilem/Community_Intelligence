
// GLAccountsSeeder is no longer needed for Master Chart as all global GLs are now loaded from Supabase.
// You can use this component for custom seeds or leave for association-level seeding if desired.

import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Optional: Redirect user to Chart of Accounts page if they try to use this
const GLAccountsSeeder: React.FC = () => {
  return (
    <Button
      onClick={() => toast.info("Master Chart of Accounts is now always loaded from the database. Seeder not needed!")}
      disabled
    >
      Seeder Not Needed
    </Button>
  );
};

export default GLAccountsSeeder;
