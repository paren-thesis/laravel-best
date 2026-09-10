import type { LucideIcon } from 'lucide-react';
import { Award, FileDown, FileText, LayoutDashboard, UserCheck, UsersRound } from 'lucide-react';
import type { RoleName } from '../types';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Omitted means every signed-in role sees it. */
  roles?: RoleName[];
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/proposals', label: 'Proposals', icon: FileText },
  { to: '/team', label: 'My Team', icon: UsersRound, roles: ['student'] },
  { to: '/supervision', label: 'Supervision', icon: UserCheck, roles: ['coordinator', 'admin'] },
  {
    to: '/defense',
    label: 'Defense Scoring',
    icon: Award,
    roles: ['supervisor', 'coordinator', 'admin', 'panel_member'],
  },
  { to: '/reports', label: 'Reports', icon: FileDown, roles: ['coordinator', 'admin', 'supervisor'] },
];

export const visibleNavItems = (roles: RoleName[]): NavItem[] =>
  NAV_ITEMS.filter((item) => !item.roles || item.roles.some((role) => roles.includes(role)));
