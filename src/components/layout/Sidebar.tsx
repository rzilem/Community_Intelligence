import React from 'react';
import {
  BarChart2,
  Building,
  Inbox,
  RefreshCcw,
  FileText,
  PieChart,
  Users,
  Home,
  Calendar,
  MessageSquare,
  Settings,
  HelpCircle,
  LogOut,
  LayoutDashboard,
  LucideIcon,
  Mail,
  Bell,
  CheckSquare,
  ListChecks,
  UserPlus,
  ShoppingCart,
  Percent,
  Coins,
  DollarSign,
  Key,
  ShieldCheck,
  BookOpenCheck,
  BarChart,
  ClipboardList,
  KanbanSquare,
  Contact2,
  Badge as LucideBadge,
  Headphones,
  CircleUserRound,
  ScrollText,
  Image,
  Link as LucideLink,
  GitFork,
  ListOrdered,
  GalleryVertical,
  Lucide,
  UserCog,
  User,
  Tag,
  Tags,
  Pencil,
  Trash2,
  Copy,
  Move,
  Plus,
  Edit,
  Eye,
  EyeOff,
  ChevronsUpDown,
  ChevronDown,
  ChevronUp,
  DoubleArrowRight,
  PanelLeft,
  PanelRight,
  PanelTop,
  PanelBottom,
  PanelLeftOpen,
  PanelRightOpen,
  PanelTopOpen,
  PanelBottomOpen,
  PanelLeftClose,
  PanelRightClose,
  PanelTopClose,
  PanelBottomClose,
  PanelLeftShrink,
  PanelRightShrink,
  PanelTopShrink,
  PanelBottomShrink,
  PanelLeftExpand,
  PanelRightExpand,
  PanelTopExpand,
  PanelBottomExpand,
  PanelLeftCenter,
  PanelRightCenter,
  PanelTopCenter,
  PanelBottomCenter,
  PanelLeftAlign,
  PanelRightAlign,
  PanelTopAlign,
  PanelBottomAlign,
  PanelLeftJustify,
  PanelRightJustify,
  PanelTopJustify,
  PanelBottomJustify,
  PanelLeftDistributeHorizontal,
  PanelRightDistributeHorizontal,
  PanelTopDistributeHorizontal,
  PanelBottomDistributeHorizontal,
  PanelLeftDistributeVertical,
  PanelRightDistributeVertical,
  PanelTopDistributeVertical,
  PanelBottomDistributeVertical,
  PanelLeftDistributeBoth,
  PanelRightDistributeBoth,
  PanelTopDistributeBoth,
  PanelBottomDistributeBoth,
  PanelLeftDistributeNone,
  PanelRightDistributeNone,
  PanelTopDistributeNone,
  PanelBottomDistributeNone,
  PanelLeftDistributeEvenly,
  PanelRightDistributeEvenly,
  PanelTopDistributeEvenly,
  PanelBottomDistributeEvenly,
  PanelLeftDistributeCenter,
  PanelRightDistributeCenter,
  PanelTopDistributeCenter,
  PanelBottomDistributeCenter,
  PanelLeftDistributeAround,
  PanelRightDistributeAround,
  PanelTopDistributeAround,
  PanelBottomDistributeAround,
  PanelLeftDistributeBetween,
  PanelRightDistributeBetween,
  PanelTopDistributeBetween,
  PanelBottomDistributeBetween,
  PanelLeftDistributeStretch,
  PanelRightDistributeStretch,
  PanelTopDistributeStretch,
  PanelBottomDistributeStretch,
  PanelLeftDistributeSpaceAround,
  PanelRightDistributeSpaceAround,
  PanelTopDistributeSpaceAround,
  PanelBottomDistributeSpaceAround,
  PanelLeftDistributeSpaceBetween,
  PanelRightDistributeSpaceBetween,
  PanelTopDistributeSpaceBetween,
  PanelBottomDistributeSpaceBetween,
  PanelLeftDistributeSpaceEvenly,
  PanelRightDistributeSpaceEvenly,
  PanelTopDistributeSpaceEvenly,
  PanelBottomDistributeSpaceEvenly,
  PanelLeftDistributeSpaceStretch,
  PanelRightDistributeSpaceStretch,
  PanelTopDistributeSpaceStretch,
  PanelBottomDistributeSpaceStretch,
  PanelLeftDistributeSpaceCenter,
  PanelRightDistributeSpaceCenter,
  PanelTopDistributeSpaceCenter,
  PanelBottomDistributeSpaceCenter,
  PanelLeftDistributeSpaceAroundCenter,
  PanelRightDistributeSpaceAroundCenter,
  PanelTopDistributeSpaceAroundCenter,
  PanelBottomDistributeSpaceAroundCenter,
  PanelLeftDistributeSpaceBetweenCenter,
  PanelRightDistributeSpaceBetweenCenter,
  PanelTopDistributeSpaceBetweenCenter,
  PanelBottomDistributeSpaceBetweenCenter,
  PanelLeftDistributeSpaceEvenlyCenter,
  PanelRightDistributeSpaceEvenlyCenter,
  PanelTopDistributeSpaceEvenlyCenter,
  PanelBottomDistributeSpaceEvenlyCenter,
  PanelLeftDistributeSpaceStretchCenter,
  PanelRightDistributeSpaceStretchCenter,
  PanelTopDistributeSpaceStretchCenter,
  PanelBottomDistributeSpaceStretchCenter,
  PanelLeftDistributeSpaceAroundStretch,
  PanelRightDistributeSpaceAroundStretch,
  PanelTopDistributeSpaceAroundStretch,
  PanelBottomDistributeSpaceStretchAround,
  PanelLeftDistributeSpaceBetweenStretch,
  PanelRightDistributeSpaceBetweenStretch,
  PanelTopDistributeSpaceBetweenStretch,
  PanelBottomDistributeSpaceBetweenStretch,
  PanelLeftDistributeSpaceEvenlyStretch,
  PanelRightDistributeSpaceEvenlyStretch,
  PanelTopDistributeSpaceEvenlyStretch,
  PanelBottomDistributeSpaceEvenlyStretch,
  PanelLeftDistributeSpaceStretchStretch,
  PanelRightDistributeSpaceStretchStretch,
  PanelTopDistributeSpaceStretchStretch,
  PanelBottomDistributeSpaceStretchStretch,
  PanelLeftDistributeSpaceAroundAround,
  PanelRightDistributeSpaceAroundAround,
  PanelTopDistributeSpaceAroundAround,
  PanelBottomDistributeSpaceAroundAround,
  PanelLeftDistributeSpaceBetweenBetween,
  PanelRightDistributeSpaceBetweenBetween,
  PanelTopDistributeSpaceBetweenBetween,
  PanelBottomDistributeSpaceBetweenBetween,
  PanelLeftDistributeSpaceEvenlyEvenly,
  PanelRightDistributeSpaceEvenlyEvenly,
  PanelTopDistributeSpaceEvenlyEvenly,
  PanelBottomDistributeSpaceEvenlyEvenly,
  PanelLeftDistributeSpaceStretchStretch,
  PanelRightDistributeSpaceStretchStretch,
  PanelTopDistributeSpaceStretchStretch,
  PanelBottomDistributeSpaceStretchStretch,
  PanelLeftDistributeSpaceAroundBetween,
  PanelRightDistributeSpaceAroundBetween,
  PanelTopDistributeSpaceAroundBetween,
  PanelBottomDistributeSpaceAroundBetween,
  PanelLeftDistributeSpaceBetweenAround,
  PanelRightDistributeSpaceBetweenAround,
  PanelTopDistributeSpaceBetweenAround,
  PanelBottomDistributeSpaceBetweenAround,
  PanelLeftDistributeSpaceEvenlyAround,
  PanelRightDistributeSpaceEvenlyAround,
  PanelTopDistributeSpaceEvenlyAround,
  PanelBottomDistributeSpaceEvenlyAround,
  PanelLeftDistributeSpaceStretchAround,
  PanelRightDistributeSpaceStretchAround,
  PanelTopDistributeSpaceStretchAround,
  PanelBottomDistributeSpaceStretchAround,
  PanelLeftDistributeSpaceAroundEvenly,
  PanelRightDistributeSpaceAroundEvenly,
  PanelTopDistributeSpaceAroundEvenly,
  PanelBottomDistributeSpaceAroundEvenly,
  PanelLeftDistributeSpaceBetweenEvenly,
  PanelRightDistributeSpaceBetweenEvenly,
  PanelTopDistributeSpaceBetweenEvenly,
  PanelBottomDistributeSpaceBetweenEvenly,
  PanelLeftDistributeSpaceEvenlyBetween,
  PanelRightDistributeSpaceEvenlyBetween,
  PanelTopDistributeSpaceEvenlyBetween,
  PanelBottomDistributeSpaceEvenlyBetween,
  PanelLeftDistributeSpaceStretchEvenly,
  PanelRightDistributeSpaceStretchEvenly,
  PanelTopDistributeSpaceStretchEvenly,
  PanelBottomDistributeSpaceStretchEvenly,
  PanelLeftDistributeSpaceAroundStretch,
  PanelRightDistributeSpaceAroundStretch,
  PanelTopDistributeSpaceAroundStretch,
  PanelBottomDistributeSpaceStretchAround,
  PanelLeftDistributeSpaceBetweenStretch,
  PanelRightDistributeSpaceBetweenStretch,
  PanelTopDistributeSpaceBetweenStretch,
  PanelBottomDistributeSpaceStretchBetween,
  PanelLeftDistributeSpaceEvenlyStretch,
  PanelRightDistributeSpaceEvenlyStretch,
  PanelTopDistributeSpaceEvenlyStretch,
  PanelBottomDistributeSpaceEvenlyStretch,
  PanelLeftDistributeSpaceStretchStretch,
  PanelRightDistributeSpaceStretchStretch,
  PanelTopDistributeSpaceStretchStretch,
  PanelBottomDistributeSpaceStretchStretch,
  PanelLeftDistributeSpaceAroundAround,
  PanelRightDistributeSpaceAroundAround,
  PanelTopDistributeSpaceAroundAround,
  PanelBottomDistributeSpaceAroundAround,
  PanelLeftDistributeSpaceBetweenBetween,
  PanelRightDistributeSpaceBetweenBetween,
  PanelTopDistributeSpaceBetweenBetween,
  PanelBottomDistributeSpaceBetweenBetween,
  PanelLeftDistributeSpaceEvenlyEvenly,
  PanelRightDistributeSpaceEvenlyEvenly,
  PanelTopDistributeSpaceEvenlyEvenly,
  PanelBottomDistributeSpaceEvenlyEvenly,
  PanelLeftDistributeSpaceStretchStretch,
  PanelRightDistributeSpaceStretchStretch,
  PanelTopDistributeSpaceStretchStretch,
  PanelBottomDistributeSpaceStretchStretch,
  PanelLeftDistributeSpaceAroundBetween,
  PanelRightDistributeSpaceAroundBetween,
  PanelTopDistributeSpaceAroundBetween,
  PanelBottomDistributeSpaceAroundBetween,
  PanelLeftDistributeSpaceBetweenAround,
  PanelRightDistributeSpaceBetweenAround,
  PanelTopDistributeSpaceBetweenAround,
  PanelBottomDistributeSpaceBetweenAround,
  PanelLeftDistributeSpaceEvenlyAround,
  PanelRightDistributeSpaceEvenlyAround,
  PanelTopDistributeSpaceEvenlyAround,
  PanelBottomDistributeSpaceEvenlyAround,
  PanelLeftDistributeSpaceStretchAround,
  PanelRightDistributeSpaceStretchAround,
  PanelTopDistributeSpaceStretchAround,
  PanelBottomDistributeSpaceStretchAround,
  PanelLeftDistributeSpaceAroundEvenly,
  PanelRightDistributeSpaceAroundEvenly,
  PanelTopDistributeSpaceAroundEvenly,
  PanelBottomDistributeSpaceAroundEvenly,
  PanelLeftDistributeSpaceBetweenEvenly,
  PanelRightDistributeSpaceBetweenEvenly,
  PanelTopDistributeSpaceBetweenEvenly,
  PanelBottomDistributeSpaceBetweenEvenly,
  PanelLeftDistributeSpaceEvenlyBetween,
  PanelRightDistributeSpaceEvenlyBetween,
  PanelTopDistributeSpaceEvenlyBetween,
  PanelBottomDistributeSpaceEvenlyBetween,
  PanelLeftDistributeSpaceStretchEvenly,
  PanelRightDistributeSpaceStretchEvenly,
  PanelTopDistributeSpaceStretchEvenly,
  PanelBottomDistributeSpaceStretchEvenly,
  PanelLeftDistributeSpaceAroundStretch,
  PanelRightDistributeSpaceAroundStretch,
  PanelTopDistributeSpaceAroundStretch,
  PanelBottomDistributeSpaceStretchAround,
  PanelLeftDistributeSpaceBetweenStretch,
  PanelRightDistributeSpaceBetweenStretch,
  PanelTopDistributeSpaceBetweenStretch,
  PanelBottomDistributeSpaceStretchBetween,
  PanelLeftDistributeSpaceEvenlyStretch,
  PanelRightDistributeSpaceEvenlyStretch,
  PanelTopDistributeSpaceEvenlyStretch,
  PanelBottomDistributeSpaceEvenlyStretch,
  PanelLeftDistributeSpaceStretchStretch,
  PanelRightDistributeSpaceStretchStretch,
  PanelTopDistributeSpaceStretchStretch,
  PanelBottomDistributeSpaceStretchStretch,
  PanelLeftDistributeSpaceAroundAround,
  PanelRightDistributeSpaceAroundAround,
  PanelTopDistributeSpaceAroundAround,
  PanelBottomDistributeSpaceAroundAround,
  PanelLeftDistributeSpaceBetweenBetween,
  PanelRightDistributeSpaceBetweenBetween,
  PanelTopDistributeSpaceBetweenBetween,
  PanelBottomDistributeSpaceBetweenBetween,
  PanelLeftDistributeSpaceEvenlyEvenly,
  PanelRightDistributeSpaceEvenlyEvenly,
  PanelTopDistributeSpaceEvenlyEvenly,
  PanelBottomDistributeSpaceEvenlyEvenly,
  PanelLeftDistributeSpaceStretchStretch,
  PanelRightDistributeSpaceStretchStretch,
  PanelTopDistributeSpaceStretchStretch,
  PanelBottomDistributeSpaceStretchStretch,
  PanelLeftDistributeSpaceAroundBetween,
  PanelRightDistributeSpaceAroundBetween,
  PanelTopDistributeSpaceAroundBetween,
  PanelBottomDistributeSpaceAroundBetween,
  PanelLeftDistributeSpaceBetweenAround,
  PanelRightDistributeSpaceBetweenAround,
  PanelTopDistributeSpaceBetweenAround,
  PanelBottomDistributeSpaceBetweenAround,
  PanelLeftDistributeSpaceEvenlyAround,
  PanelRightDistributeSpaceEvenlyAround,
  PanelTopDistributeSpaceEvenlyAround,
  PanelBottomDistributeSpaceEvenlyAround,
  PanelLeftDistributeSpaceStretchAround,
  PanelRightDistributeSpaceStretchAround,
  PanelTopDistributeSpaceStretchAround,
  PanelBottomDistributeSpaceStretchAround,
  PanelLeftDistributeSpaceAroundEvenly,
  PanelRightDistributeSpaceAroundEvenly,
  PanelTopDistributeSpaceAroundEvenly,
  PanelBottomDistributeSpaceAroundEvenly,
  PanelLeftDistributeSpaceBetweenEvenly,
  PanelRightDistributeSpaceBetweenEvenly,
  PanelTopDistributeSpaceBetweenEvenly,
  PanelBottomDistributeSpaceBetweenEvenly,
  PanelLeftDistributeSpaceEvenlyBetween,
  PanelRightDistributeSpaceEvenlyBetween,
  PanelTopDistributeSpaceEvenlyBetween,
  PanelBottomDistributeSpaceEvenlyBetween,
  PanelLeftDistributeSpaceStretchEvenly,
  PanelRightDistributeSpaceStretchEvenly,
  PanelTopDistributeSpaceStretchEvenly,
  PanelBottomDistributeSpaceStretchEvenly,
  PanelLeftDistributeSpaceAroundStretch,
  PanelRightDistributeSpaceAroundStretch,
  PanelTopDistributeSpaceAroundStretch,
  PanelBottomDistributeSpaceStretchAround,
  PanelLeftDistributeSpaceBetweenStretch,
  PanelRightDistributeSpaceBetweenStretch,
  PanelTopDistributeSpaceBetweenStretch,
  PanelBottomDistributeSpaceStretchBetween,
  PanelLeftDistributeSpaceEvenlyStretch,
  PanelRightDistributeSpaceEvenlyStretch,
  PanelTopDistributeSpaceEvenlyStretch,
  PanelBottomDistributeSpaceEvenlyStretch,
  PanelLeftDistributeSpaceStretchStretch,
  PanelRightDistributeSpaceStretchStretch,
  PanelTopDistributeSpaceStretchStretch,
  PanelBottomDistributeSpaceStretchStretch,
  PanelLeftDistributeSpaceAroundAround,
  PanelRightDistributeSpaceAroundAround,
  PanelTopDistributeSpaceAroundAround,
  PanelBottomDistributeSpaceAroundAround,
  PanelLeftDistributeSpaceBetweenBetween,
  PanelRightDistributeSpaceBetweenBetween,
  PanelTopDistributeSpaceBetweenBetween,
  PanelBottomDistributeSpaceBetweenBetween,
  PanelLeftDistributeSpaceEvenlyEvenly,
  PanelRightDistributeSpaceEvenlyEvenly,
  PanelTopDistributeSpaceEvenlyEvenly,
  PanelBottomDistributeSpaceEvenlyEvenly,
  PanelLeftDistributeSpaceStretchStretch,
  PanelRightDistributeSpaceStretchStretch,
  PanelTopDistributeSpaceStretchStretch,
  PanelBottomDistributeSpaceStretchStretch,
  PanelLeftDistributeSpaceAroundBetween,
  PanelRightDistributeSpaceAroundBetween,
  PanelTopDistributeSpaceAroundBetween,
  PanelBottomDistributeSpaceAroundBetween,
  PanelLeftDistributeSpaceBetweenAround,
  PanelRightDistributeSpaceBetweenAround,
  PanelTopDistributeSpaceBetweenAround,
  PanelBottomDistributeSpaceBetweenAround,
  PanelLeftDistributeSpaceEvenlyAround,
  PanelRightDistributeSpaceEvenlyAround,
  PanelTopDistributeSpaceEvenlyAround,
  PanelBottomDistributeSpaceEvenlyAround,
  PanelLeftDistributeSpaceStretchAround,
  PanelRightDistributeSpaceStretchAround,
  PanelTopDistributeSpaceStretchAround,
  PanelBottomDistributeSpaceStretchAround,
  PanelLeftDistributeSpaceAroundEvenly,
  PanelRightDistributeSpaceAroundEvenly,
  PanelTopDistributeSpaceAroundEvenly,
  PanelBottomDistributeSpaceAroundEvenly,
  PanelLeftDistributeSpaceBetweenEvenly,
  PanelRightDistributeSpaceBetweenEvenly,
  PanelTopDistributeSpaceBetweenEvenly,
  PanelBottomDistributeSpaceBetweenEvenly,
  PanelLeftDistributeSpaceEvenlyBetween,
  PanelRightDistributeSpaceEvenlyBetween,
  PanelTopDistributeSpaceEvenlyBetween,
  PanelBottomDistributeSpaceEvenlyBetween,
  PanelLeftDistributeSpaceStretchEvenly,
  PanelRightDistributeSpaceStretchEvenly,
  PanelTopDistributeSpaceStretchEvenly,
  PanelBottomDistributeSpaceStretchEvenly,
  PanelLeftDistributeSpaceAroundStretch,
  PanelRightDistributeSpaceAroundStretch,
  PanelTopDistributeSpaceAroundStretch,
  PanelBottomDistributeSpaceStretchAround,
  PanelLeftDistributeSpaceBetweenStretch,
  PanelRightDistributeSpaceBetweenStretch,
  PanelTopDistributeSpaceBetweenStretch,
  PanelBottomDistributeSpaceStretchBetween,
  PanelLeftDistributeSpaceEvenlyStretch,
  PanelRightDistributeSpaceEvenlyStretch,
  PanelTopDistributeSpaceEvenlyStretch,
  PanelBottomDistributeSpaceEvenlyStretch,
  PanelLeftDistributeSpaceStretchStretch,
  PanelRightDistributeSpaceStretchStretch,
  PanelTopDistributeSpaceStretchStretch,
  PanelBottomDistributeSpaceStretchStretch,
  PanelLeftDistributeSpaceAroundAround,
  PanelRightDistributeSpaceAroundAround,
  PanelTopDistributeSpaceAroundAround,
  PanelBottomDistributeSpaceAroundAround,
  PanelLeftDistributeSpaceBetweenBetween,
  PanelRightDistributeSpaceBetweenBetween,
  PanelTopDistributeSpaceBetweenBetween,
  PanelBottomDistributeSpaceBetweenBetween,
  PanelLeftDistributeSpaceEvenlyEvenly,
  PanelRightDistributeSpaceEvenlyEvenly,
  PanelTopDistributeSpaceEvenlyEvenly,
  PanelBottomDistributeSpaceEvenlyEvenly,
  PanelLeftDistributeSpaceStretchStretch,
  PanelRightDistributeSpaceStretchStretch,
  PanelTopDistributeSpaceStretchStretch,
  PanelBottomDistributeSpaceStretchStretch,
  PanelLeftDistributeSpaceAroundBetween,
  PanelRightDistributeSpaceAroundBetween,
  PanelTopDistributeSpaceAroundBetween,
  PanelBottomDistributeSpaceAroundBetween,
  PanelLeftDistributeSpaceBetweenAround,
  PanelRightDistributeSpaceBetweenAround,
  PanelTopDistributeSpaceBetweenAround,
  PanelBottomDistributeSpaceBetweenAround,
  PanelLeftDistributeSpaceEvenlyAround,
  PanelRightDistributeSpaceEvenlyAround,
  PanelTopDistributeSpaceEvenlyAround,
  PanelBottomDistributeSpaceEvenlyAround,
  PanelLeftDistributeSpaceStretchAround,
  PanelRightDistributeSpaceStretchAround,
  PanelTopDistributeSpaceStretchAround,
  PanelBottomDistributeSpaceStretchAround,
  PanelLeftDistributeSpaceAroundEvenly,
  PanelRightDistributeSpaceAroundEvenly,
  PanelTopDistributeSpaceAroundEvenly,
  PanelBottomDistributeSpaceAroundEvenly,
  PanelLeftDistributeSpaceBetweenEvenly,
  PanelRightDistributeSpaceBetweenEvenly,
  PanelTopDistributeSpaceBetweenEvenly,
  PanelBottomDistributeSpaceBetweenEvenly,
  PanelLeftDistributeSpaceEvenlyBetween,
  PanelRightDistributeSpaceEvenlyBetween,
  PanelTopDistributeSpaceEvenlyBetween,
  PanelBottomDistributeSpaceEvenlyBetween,
  PanelLeftDistributeSpaceStretchEvenly,
  PanelRightDistributeSpaceStretchEvenly,
  PanelTopDistributeSpaceStretchEvenly,
  PanelBottomDistributeSpaceStretchEvenly,
  PanelLeftDistributeSpaceAroundStretch,
  PanelRightDistributeSpaceAroundStretch,
  PanelTopDistributeSpaceAroundStretch,
  PanelBottomDistributeSpaceStretchAround,
  PanelLeftDistributeSpaceBetweenStretch,
  PanelRightDistributeSpaceBetweenStretch,
  PanelTopDistributeSpaceBetweenStretch,
  PanelBottomDistributeSpaceStretchBetween,
  PanelLeftDistributeSpaceEvenlyStretch,
  PanelRightDistributeSpaceEvenlyStretch,
  PanelTopDistributeSpaceEvenlyStretch,
  PanelBottomDistributeSpaceEvenlyStretch,
  PanelLeftDistributeSpaceStretchStretch,
  PanelRightDistributeSpaceStretchStretch,
  PanelTopDistributeSpaceStretchStretch,
  PanelBottomDistributeSpaceStretchStretch,
  PanelLeftDistributeSpaceAroundAround,
  PanelRightDistributeSpaceAroundAround,
  PanelTopDistributeSpaceAroundAround,
  PanelBottomDistributeSpaceAroundAround,
  PanelLeftDistributeSpaceBetweenBetween,
  PanelRightDistributeSpaceBetweenBetween,
  PanelTopDistributeSpaceBetweenBetween,
  PanelBottomDistributeSpaceBetweenBetween,
  PanelLeftDistributeSpaceEvenlyEvenly,
  PanelRightDistributeSpaceEvenlyEvenly,
  PanelTopDistributeSpaceEvenlyEvenly,
  PanelBottomDistributeSpaceEvenlyEvenly,
  PanelLeftDistributeSpaceStretchStretch,
  PanelRightDistributeSpaceStretchStretch,
  PanelTopDistributeSpaceStretchStretch,
  PanelBottomDistributeSpaceStretchStretch,
  PanelLeftDistributeSpaceAroundBetween,
  PanelRightDistributeSpaceAroundBetween,
  PanelTopDistributeSpaceAroundBetween,
  PanelBottomDistributeSpaceAroundBetween,
  PanelLeftDistributeSpaceBetweenAround,
  PanelRightDistributeSpaceBetweenAround,
  PanelTopDistributeSpaceBetweenAround,
  PanelBottomDistributeSpaceBetweenAround,
  PanelLeftDistributeSpaceEvenlyAround,
  PanelRightDistributeSpaceEvenlyAround,
  PanelTopDistributeSpaceEvenlyAround,
  PanelBottomDistributeSpaceEvenlyAround,
  PanelLeftDistributeSpaceStretchAround,
  PanelRightDistributeSpaceStretchAround,
  PanelTopDistributeSpaceStretchAround,
  PanelBottomDistributeSpaceStretchAround,
  PanelLeftDistributeSpaceAroundEvenly,
  PanelRightDistributeSpaceAroundEvenly,
  PanelTopDistributeSpaceAroundEvenly,
  PanelBottomDistributeSpaceAroundEvenly,
  PanelLeftDistributeSpaceBetweenEvenly,
  PanelRightDistributeSpaceBetweenEvenly,
  PanelTopDistributeSpaceBetweenEvenly,
  PanelBottomDistributeSpaceBetweenEvenly,
  PanelLeftDistributeSpaceEvenlyBetween,
  PanelRightDistributeSpaceEvenlyBetween,
  PanelTopDistributeSpaceEvenlyBetween,
  PanelBottomDistributeSpaceEvenlyBetween,
  PanelLeftDistributeSpaceStretchEvenly,
  PanelRightDistributeSpaceStretchEvenly,
  PanelTopDistributeSpaceStretchEvenly,
  PanelBottomDistributeSpaceStretchEvenly,
  PanelLeftDistributeSpaceAroundStretch,
  PanelRightDistributeSpaceAroundStretch,
  PanelTopDistributeSpaceAroundStretch,
  PanelBottomDistributeSpaceStretchAround,
  PanelLeftDistributeSpaceBetweenStretch,
  PanelRightDistributeSpaceBetweenStretch,
  PanelTopDistributeSpaceBetweenStretch,
  PanelBottomDistributeSpaceStretchBetween,
  PanelLeftDistributeSpaceEvenlyStretch,
  PanelRightDistributeSpaceEvenlyStretch,
  PanelTopDistributeSpaceEvenlyStretch,
  PanelBottomDistributeSpaceEvenlyStretch,
  PanelLeftDistributeSpaceStretchStretch,
  PanelRightDistributeSpaceStretchStretch,
  PanelTopDistributeSpaceStretchStretch,
  PanelBottomDistributeSpaceStretchStretch,
} from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/components/ui/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { useWorkspace } from '@/contexts/workspace';
import { useRole } from '@/hooks/useRole';
import { useInvoiceNotifications } from '@/hooks/invoices/useInvoiceNotifications';

interface NavItemProps {
  to: string;
  icon: LucideIcon;
  children: React.ReactNode;
  badge?: number;
}

const SidebarNavItem: React.FC<NavItemProps> = ({ to, icon, children, badge }) => {
  const { pathname } = useLocation();
  const isActive = pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={cn(
        "group flex items-center space-x-2 rounded-md p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
      )}
    >
      {React.createElement(icon, { className: "h-5 w-5" })}
      <span>{children}</span>
      {badge !== undefined && badge > 0 && (
        <span className="ml-auto rounded-sm bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
          {badge}
        </span>
      )}
    </Link>
  );
};

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
  const { role } = useRole();
  const { unreadInvoicesCount } = useInvoiceNotifications();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out successfully.",
      description: "Redirecting to login page...",
    });
    navigate('/login');
  };

  const renderDashboard = () => (
    <div className="space-y-1">
      <SidebarNavItem to="/dashboard" icon={LayoutDashboard}>Dashboard</SidebarNavItem>
    </div>
  );

  const renderCommunityManagement = () => (
    <div className="space-y-1">
      <SidebarNavItem to="/community-management/homeowners" icon={Users}>Homeowners</SidebarNavItem>
      <SidebarNavItem to="/community-management/associations" icon={Home}>Associations</SidebarNavItem>
      <SidebarNavItem to="/community-management/amenities" icon={Calendar}>Amenities</SidebarNavItem>
      <SidebarNavItem to="/community-management/homeowner-requests" icon={MessageSquare}>Homeowner Requests</SidebarNavItem>
    </div>
  );

  const renderLeadManagement = () => (
    <div className="space-y-1">
      <SidebarNavItem to="/lead-management/leads" icon={Contact2}>Leads</SidebarNavItem>
      <SidebarNavItem to="/lead-management/campaigns" icon={Mail}>Campaigns</SidebarNavItem>
      <SidebarNavItem to="/lead-management/automation" icon={Zap}>Automation</SidebarNavItem>
    </div>
  );

  const renderResaleManagement = () => (
    <div className="space-y-1">
      <SidebarNavItem to="/resale-management/listings" icon={ListChecks}>Listings</SidebarNavItem>
      <SidebarNavItem to="/resale-management/calendar" icon={Calendar}>Calendar</SidebarNavItem>
      <SidebarNavItem to="/resale-management/agents" icon={UserPlus}>Agents</SidebarNavItem>
    </div>
  );

  const renderMarketplace = () => (
    <div className="space-y-1">
      <SidebarNavItem to="/marketplace/vendors" icon={ShoppingCart}>Vendors</SidebarNavItem>
      <SidebarNavItem to="/marketplace/deals" icon={Percent}>Deals</SidebarNavItem>
      <SidebarNavItem to="/marketplace/rewards" icon={Coins}>Rewards</SidebarNavItem>
    </div>
  );

  const renderAccounting = () => (
    <div className="space-y-1">
      <SidebarNavItem to="/accounting/dashboard" icon={<BarChart2 className="h-5 w-5" />}>Dashboard</SidebarNavItem>
      <SidebarNavItem to="/accounting/bank-accounts" icon={<Building className="h-5 w-5" />}>Bank Accounts</SidebarNavItem>
    
    {/* Updated to show notification badge on Invoice Queue */}
    <SidebarNavItem 
      to="/accounting/invoice-queue" 
      icon={<Inbox className="h-5 w-5" />}
      badge={unreadInvoicesCount > 0 ? unreadInvoicesCount : undefined}
    >
      Invoice Queue
    </SidebarNavItem>
    
      <SidebarNavItem to="/accounting/transactions" icon={<RefreshCcw className="h-5 w-5" />}>
        Transactions
      </SidebarNavItem>
      <SidebarNavItem to="/accounting/gl-accounts" icon={<FileText className="h-5 w-5" />}>
        GL Accounts
      </SidebarNavItem>
      <SidebarNavItem to="/accounting/budgeting" icon={<PieChart className="h-5 w-5" />}>
        Budget Planning
      </SidebarNavItem>
    </div>
  );

  const renderSystem = () => (
    <div className="space-y-1">
      <SidebarNavItem to="/system/settings" icon={Settings}>Settings</SidebarNavItem>
      <SidebarNavItem to="/system/users" icon={Users}>Users</SidebarNavItem>
      <SidebarNavItem to="/system/roles" icon={ShieldCheck}>Roles</SidebarNavItem>
      <SidebarNavItem to="/system/audit-log" icon={BookOpenCheck}>Audit Log</SidebarNavItem>
    </div>
  );

  const renderPortal = () => (
    <div className="space-y-1">
      <SidebarNavItem to="/portal/home" icon={Home}>Home</SidebarNavItem>
      <SidebarNavItem to="/portal/documents" icon={FileText}>Documents</SidebarNavItem>
      <SidebarNavItem to="/portal/calendar" icon={Calendar}>Calendar</SidebarNavItem>
      <SidebarNavItem to="/portal/messages" icon={MessageSquare}>Messages</SidebarNavItem>
      <SidebarNavItem to="/portal/payments" icon={DollarSign}>Payments</SidebarNavItem>
    </div>
  );

  const renderKnowledgeBase = () => (
    <div className="space-y-1">
      <SidebarNavItem to="/knowledge-base/articles" icon={ScrollText}>Articles</SidebarNavItem>
      <SidebarNavItem to="/knowledge-base/categories" icon={ListOrdered}>Categories</SidebarNavItem>
      <SidebarNavItem to="/knowledge-base/tags" icon={Tags}>Tags</SidebarNavItem>
      <SidebarNavItem to="/knowledge-base/media" icon={Image}>Media</SidebarNavItem>
    </div>
  );

  const renderDevelopers = () => (
    <div className="space-y-1">
      <SidebarNavItem to="/developers/api" icon={Key}>API</SidebarNavItem>
      <SidebarNavItem to="/developers/webhooks" icon={GitFork}>Webhooks</SidebarNavItem>
    </div>
  );

  return (
    <div className={cn("flex h-full w-[280px] flex-col border-r bg-background py-4", className)}>
      <div className="px-6 pb-4">
        <Link to="/dashboard" className="flex items-center font-semibold">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="32" height="32" rx="16" fill="#725BFF" />
            <path
              d="M17.875 21.3333C17.875 19.4926 16.3824 18 14.5417 18C12.701 18 11.2083 19.4926 11.2083 21.3333C11.2083 23.174 12.701 24.6667 14.5417 24.6667C16.3824 24.6667 17.875 23.174 17.875 21.3333ZM20.2083 13C20.2083 14.8407 18.7157 16.3333 16.875 16.3333C15.0343 16.3333 13.5417 14.8407 13.5417 13C13.5417 11.1593 15.0343 9.66667 16.875 9.66667C18.7157 9.66667 20.2083 11.1593 20.2083 13ZM20.875 19.6667C20.875 21.0926 22.0326 22.25 23.4583 22.25C24.884 22.25 26.0417 21.0926 26.0417 19.6667C26.0417 18.2407 24.884 17.0833 23.4583 17.0833C22.0326 17.0833 20.875 18.2407 20.875 19.6667ZM8.54167 13C8.54167 14.4259 9.69933 15.5833 11.125 15.5833C12.5507 15.5833 13.7083 14.4259 13.7083 13C13.7083 11.5741 12.5507 10.4167 11.125 10.4167C9.69933 10.4167 8.54167 11.5741 8.54167 13ZM5.95833 19.6667C5.95833 21.7333 7.64167 23.4167 9.70833 23.4167C11.775 23.4167 13.4583 21.7333 13.4583 19.6667C13.4583 17.6 11.775 15.9167 9.70833 15.9167C7.64167 15.9167 5.95833 17.6 5.95833 19.6667ZM23.4583 15.5
