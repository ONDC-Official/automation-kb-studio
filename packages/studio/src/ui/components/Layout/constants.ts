import { FlaskConical, GitCompare, ListTree, ShieldCheck, type LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Only shown to KB admins (the Admin console). */
  adminOnly?: boolean;
}

export const NAV: NavItem[] = [
  { label: "Author", to: "/", icon: ListTree },
  { label: "Coverage", to: "/coverage", icon: GitCompare },
  { label: "Evaluate", to: "/evaluate", icon: FlaskConical },
  { label: "Admin", to: "/admin", icon: ShieldCheck, adminOnly: true },
];
