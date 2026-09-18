import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Inbox,
  GitBranch,
  Microscope,
  Package,
  FlaskConical,
  Truck,
  FileText,
  Scale,
  FileSignature,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Demand Intake", href: "/dashboard/demand-intake", icon: Inbox },
  { label: "Baseline", href: "/dashboard/baseline", icon: GitBranch },
  {
    label: "Deep Analysis",
    href: "/dashboard/deep-analysis",
    icon: Microscope,
  },
  { label: "Products", href: "/dashboard/products", icon: Package },
  {
    label: "Abrasives Test",
    href: "/dashboard/abrasives-test",
    icon: FlaskConical,
  },
  { label: "Supply Chain", href: "/dashboard/supply-chain", icon: Truck },
  { label: "Tender", href: "/dashboard/tender", icon: FileText },
  { label: "Contracts", href: "/dashboard/contracts", icon: FileSignature },
  { label: "Decision", href: "/dashboard/decision", icon: Scale },
];
