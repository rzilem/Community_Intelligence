
import { Home, Users, Building, CreditCard, FileText, Calendar, Settings } from 'lucide-react';

export const getFilteredNavItems = (userRole: string | null) => {
  // Define all navigation items
  const allNavItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/dashboard",
      roles: ["admin", "manager", "resident", "board-member", "accountant", "maintenance"]
    },
    {
      title: "Community Management",
      icon: Building,
      href: "/community-management",
      roles: ["admin", "manager", "board-member"]
    },
    {
      title: "Homeowners",
      icon: Users,
      href: "/homeowners",
      roles: ["admin", "manager"]
    },
    {
      title: "Accounting",
      icon: CreditCard,
      href: "/accounting/dashboard",
      roles: ["admin", "manager", "accountant", "treasurer"]
    },
    {
      title: "Documents",
      icon: FileText,
      href: "/documents",
      roles: ["admin", "manager", "resident"]
    },
    {
      title: "Calendar",
      icon: Calendar,
      href: "/calendar",
      roles: ["admin", "manager", "resident", "board-member"]
    },
    {
      title: "System Settings",
      icon: Settings,
      href: "/system/settings",
      roles: ["admin"]
    }
  ];

  // If no role is specified, only show minimal navigation
  if (!userRole) {
    return allNavItems.filter(item => 
      ["Dashboard"].includes(item.title)
    );
  }

  // Admin gets all items
  if (userRole === 'admin') {
    return allNavItems;
  }

  // Filter items based on user's role
  return allNavItems.filter(item => item.roles.includes(userRole));
};
