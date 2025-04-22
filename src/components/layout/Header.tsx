
import { Button } from "@/components/ui/button";
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { Menu } from "lucide-react";

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  return (
    <header className="flex h-16 items-center px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
        <Menu className="h-5 w-5" />
      </Button>
      <div className="ml-auto flex items-center space-x-2">
        <NotificationCenter />
      </div>
    </header>
  );
}
