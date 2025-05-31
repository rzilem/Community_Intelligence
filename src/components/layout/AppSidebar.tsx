import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import {
  Building2,
  Home,
  Users,
  FileText,
  Calendar,
  DollarSign,
  Settings,
  Shield,
  BarChart3,
  Wrench,
  MessageSquare,
  FileCheck,
  CreditCard,
  MapPin,
  UserCheck,
  Bell,
  Archive,
  Calculator,
  TrendingUp,
  ClipboardList,
  Gavel,
  Camera,
  Mail,
  Phone,
  Globe,
  Database,
  Lock,
  UserPlus,
  Building,
  Wallet,
  PieChart,
  Receipt,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Download,
  Upload,
  Printer,
  Share2,
  Edit,
  Trash2,
  Plus,
  Eye,
  Key,
  Zap,
  Target,
  Award,
  HelpCircle,
  BookOpen,
  LifeBuoy,
  Megaphone,
  Calendar as CalendarIcon,
  Car,
  Waves,
  Trees,
  Dumbbell,
  Utensils,
  Wifi,
  ShoppingCart,
  Package,
  Truck,
  Clipboard,
  FileImage,
  Video,
  Music,
  Image,
  FolderOpen,
  Link as LinkIcon,
  Tag,
  Star,
  Heart,
  Bookmark,
  Flag,
  AlertCircle,
  Info,
  CheckSquare,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Octagon
} from 'lucide-react';

const menuItems = [
  {
    title: 'OVERVIEW',
    items: [
      { 
        title: 'Dashboard', 
        url: '/dashboard', 
        icon: Home,
        description: 'Main overview and analytics'
      },
      { 
        title: 'Portfolio Manager', 
        url: '/portfolio', 
        icon: Building,
        description: 'Manage multiple HOAs'
      },
      { 
        title: 'Quick Actions', 
        url: '/quick-actions', 
        icon: Zap,
        description: 'Fast access to common tasks'
      },
    ],
  },
  {
    title: 'PROPERTIES & RESIDENTS',
    items: [
      { 
        title: 'Properties', 
        url: '/properties', 
        icon: Building2,
        description: 'Property management and details'
      },
      { 
        title: 'Property Details', 
        url: '/properties/details', 
        icon: MapPin,
        description: 'Individual property information'
      },
      { 
        title: 'Residents', 
        url: '/residents', 
        icon: Users,
        description: 'Resident management and profiles'
      },
      { 
        title: 'Resident Directory', 
        url: '/residents/directory', 
        icon: UserCheck,
        description: 'Searchable resident directory'
      },
      { 
        title: 'Move In/Out', 
        url: '/residents/move', 
        icon: UserPlus,
        description: 'Manage resident transitions'
      },
    ],
  },
  {
    title: 'AMENITIES & FACILITIES',
    items: [
      { 
        title: 'Amenity Booking', 
        url: '/amenities', 
        icon: Calendar,
        description: 'Reserve community amenities'
      },
      { 
        title: 'Pool & Spa', 
        url: '/amenities/pool', 
        icon: Waves,
        description: 'Pool and spa reservations'
      },
      { 
        title: 'Clubhouse', 
        url: '/amenities/clubhouse', 
        icon: Building,
        description: 'Clubhouse and event space'
      },
      { 
        title: 'Fitness Center', 
        url: '/amenities/fitness', 
        icon: Dumbbell,
        description: 'Gym and fitness facilities'
      },
      { 
        title: 'Tennis Courts', 
        url: '/amenities/tennis', 
        icon: Target,
        description: 'Court reservations and leagues'
      },
      { 
        title: 'Parking', 
        url: '/amenities/parking', 
        icon: Car,
        description: 'Parking space management'
      },
    ],
  },
  {
    title: 'MAINTENANCE & SERVICES',
    items: [
      { 
        title: 'Work Orders', 
        url: '/maintenance', 
        icon: Wrench,
        description: 'Maintenance request management'
      },
      { 
        title: 'Service Requests', 
        url: '/maintenance/requests', 
        icon: ClipboardList,
        description: 'Submit and track requests'
      },
      { 
        title: 'Vendor Management', 
        url: '/maintenance/vendors', 
        icon: Truck,
        description: 'Contractor and vendor directory'
      },
      { 
        title: 'Preventive Maintenance', 
        url: '/maintenance/preventive', 
        icon: Calendar,
        description: 'Scheduled maintenance tasks'
      },
      { 
        title: 'Emergency Services', 
        url: '/maintenance/emergency', 
        icon: AlertTriangle,
        description: 'Emergency contact and procedures'
      },
    ],
  },
  {
    title: 'FINANCIAL MANAGEMENT',
    items: [
      { 
        title: 'Assessments', 
        url: '/assessments', 
        icon: DollarSign,
        description: 'HOA fees and assessments'
      },
      { 
        title: 'Payment Processing', 
        url: '/assessments/payments', 
        icon: CreditCard,
        description: 'Online payment system'
      },
      { 
        title: 'Accounting', 
        url: '/accounting', 
        icon: Calculator,
        description: 'Financial accounting and books'
      },
      { 
        title: 'Budget Management', 
        url: '/accounting/budget', 
        icon: PieChart,
        description: 'Annual budgets and forecasts'
      },
      { 
        title: 'Financial Reports', 
        url: '/reports/financial', 
        icon: TrendingUp,
        description: 'Financial statements and reports'
      },
      { 
        title: 'Delinquency Management', 
        url: '/assessments/delinquency', 
        icon: AlertCircle,
        description: 'Overdue payment tracking'
      },
      { 
        title: 'Reserve Funds', 
        url: '/accounting/reserves', 
        icon: Wallet,
        description: 'Reserve fund management'
      },
    ],
  },
  {
    title: 'COMMUNICATIONS',
    items: [
      { 
        title: 'Messages & Announcements', 
        url: '/communications', 
        icon: MessageSquare,
        description: 'Community communications'
      },
      { 
        title: 'Email Campaigns', 
        url: '/communications/email', 
        icon: Mail,
        description: 'Mass email communications'
      },
      { 
        title: 'SMS Notifications', 
        url: '/communications/sms', 
        icon: Phone,
        description: 'Text message alerts'
      },
      { 
        title: 'Website Management', 
        url: '/communications/website', 
        icon: Globe,
        description: 'Community website and portal'
      },
      { 
        title: 'Emergency Alerts', 
        url: '/communications/emergency', 
        icon: Bell,
        description: 'Emergency notification system'
      },
      { 
        title: 'Newsletter', 
        url: '/communications/newsletter', 
        icon: Megaphone,
        description: 'Community newsletter'
      },
    ],
  },
  {
    title: 'DOCUMENTS & RECORDS',
    items: [
      { 
        title: 'Document Library', 
        url: '/documents', 
        icon: FileText,
        description: 'Community documents and files'
      },
      { 
        title: 'CC&Rs', 
        url: '/documents/ccrs', 
        icon: Gavel,
        description: 'Covenants and restrictions'
      },
      { 
        title: 'Meeting Minutes', 
        url: '/documents/minutes', 
        icon: ClipboardList,
        description: 'Board meeting records'
      },
      { 
        title: 'Forms & Applications', 
        url: '/documents/forms', 
        icon: FileCheck,
        description: 'Resident forms and applications'
      },
      { 
        title: 'Insurance Documents', 
        url: '/documents/insurance', 
        icon: Shield,
        description: 'Insurance policies and claims'
      },
      { 
        title: 'Contracts', 
        url: '/documents/contracts', 
        icon: Receipt,
        description: 'Vendor contracts and agreements'
      },
      { 
        title: 'Photos & Media', 
        url: '/documents/media', 
        icon: Camera,
        description: 'Community photos and videos'
      },
    ],
  },
  {
    title: 'COMPLIANCE & GOVERNANCE',
    items: [
      { 
        title: 'ARC Requests', 
        url: '/arc', 
        icon: FileCheck,
        description: 'Architectural review committee'
      },
      { 
        title: 'Violations', 
        url: '/violations', 
        icon: Shield,
        description: 'Rule violations and enforcement'
      },
      { 
        title: 'Board Management', 
        url: '/governance/board', 
        icon: Users,
        description: 'Board member management'
      },
      { 
        title: 'Elections', 
        url: '/governance/elections', 
        icon: CheckCircle,
        description: 'Board elections and voting'
      },
      { 
        title: 'Legal Affairs', 
        url: '/governance/legal', 
        icon: Gavel,
        description: 'Legal matters and compliance'
      },
      { 
        title: 'Audit Trail', 
        url: '/compliance/audit', 
        icon: Search,
        description: 'System audit and compliance logs'
      },
    ],
  },
  {
    title: 'REPORTING & ANALYTICS',
    items: [
      { 
        title: 'Reports Dashboard', 
        url: '/reports', 
        icon: BarChart3,
        description: 'All reports and analytics'
      },
      { 
        title: 'Custom Reports', 
        url: '/reports/custom', 
        icon: Filter,
        description: 'Build custom reports'
      },
      { 
        title: 'Operational Reports', 
        url: '/reports/operational', 
        icon: ClipboardList,
        description: 'Day-to-day operations reports'
      },
      { 
        title: 'Compliance Reports', 
        url: '/reports/compliance', 
        icon: CheckSquare,
        description: 'Regulatory compliance reports'
      },
      { 
        title: 'Analytics', 
        url: '/analytics', 
        icon: TrendingUp,
        description: 'Advanced data analytics'
      },
    ],
  },
  {
    title: 'ADMINISTRATION',
    items: [
      { 
        title: 'User Management', 
        url: '/admin/users', 
        icon: UserCheck,
        description: 'Manage system users and roles'
      },
      { 
        title: 'HOA Settings', 
        url: '/admin/hoa-settings', 
        icon: Settings,
        description: 'HOA-specific configurations'
      },
      { 
        title: 'Portal Customization', 
        url: '/admin/portal', 
        icon: Globe,
        description: 'Customize community portal'
      },
      { 
        title: 'System Settings', 
        url: '/settings', 
        icon: Settings,
        description: 'Global system settings'
      },
      { 
        title: 'Security & Permissions', 
        url: '/admin/security', 
        icon: Lock,
        description: 'Security and access control'
      },
      { 
        title: 'Data Management', 
        url: '/admin/data', 
        icon: Database,
        description: 'Data import, export, and backup'
      },
      { 
        title: 'Integration Settings', 
        url: '/admin/integrations', 
        icon: LinkIcon,
        description: 'Third-party integrations'
      },
    ],
  },
  {
    title: 'SUPPORT & HELP',
    items: [
      { 
        title: 'Help Center', 
        url: '/help', 
        icon: HelpCircle,
        description: 'Documentation and tutorials'
      },
      { 
        title: 'Training Resources', 
        url: '/help/training', 
        icon: BookOpen,
        description: 'Training materials and guides'
      },
      { 
        title: 'Support Tickets', 
        url: '/support', 
        icon: LifeBuoy,
        description: 'Technical support and assistance'
      },
      { 
        title: 'System Status', 
        url: '/status', 
        icon: CheckCircle,
        description: 'System health and status'
      },
    ],
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar 
      className="border-r-0 w-80" 
      style={{
        background: 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 25%, #3b82f6 50%, #2563eb 75%, #1d4ed8 100%)',
        boxShadow: '4px 0 20px rgba(59, 130, 246, 0.15)'
      }}
    >
      <SidebarHeader style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <Link to="/dashboard" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          color: 'white',
          fontWeight: '700',
          fontSize: '1.1rem',
          textDecoration: 'none'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            borderRadius: '8px',
            padding: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}>
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span>Community Intelligence</span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="px-1 overflow-y-auto max-h-[calc(100vh-80px)]">
        {menuItems.map((group) => (
          <SidebarGroup key={group.title} className="mb-2">
            <SidebarGroupLabel style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: '600',
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: '12px 12px 6px 12px',
              paddingBottom: '4px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className="w-full justify-start text-sm"
                        style={{
                          color: isActive ? '#1e40af' : 'rgba(255, 255, 255, 0.9)',
                          background: isActive ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
                          borderRadius: '6px',
                          margin: '1px 6px',
                          fontWeight: isActive ? '600' : '500',
                          transition: 'all 0.2s ease',
                          boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none',
                          fontSize: '0.85rem',
                          padding: '6px 12px',
                          minHeight: '36px'
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.transform = 'translateX(4px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                            e.currentTarget.style.transform = 'translateX(0)';
                          }
                        }}
                        title={item.description}
                      >
                        <Link to={item.url} className="flex items-center gap-2 w-full">
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}