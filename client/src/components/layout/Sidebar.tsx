import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  FlaskConical,
  FileCode2,
  ClipboardList,
  FolderKanban,
  Users2,
  MessageSquare,
  BookMarked,
  Bell,
  Settings,
  GraduationCap,
  BarChart3,
  ShieldCheck,
  Building2,
  Cpu,
  History,
  Activity,
  FileText,
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface SidebarLink {
  to: string;
  label: string;
  icon: any;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const { role } = useAuth();

  const studentLinks: SidebarLink[] = [
    { to: '/student/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/student/labs', label: 'Explore Labs', icon: FlaskConical },
    { to: '/student/experiments', label: 'My Experiments', icon: FileCode2 },
    { to: '/student/assignments', label: 'Assignments', icon: ClipboardList, badge: '2' },
    { to: '/student/projects', label: 'My Projects', icon: FolderKanban },
    { to: '/student/collaboration', label: 'Collaboration', icon: Users2, badge: 'Live' },
    { to: '/student/messages', label: 'Messages', icon: MessageSquare },
    { to: '/student/resources', label: 'Resources', icon: BookMarked },
    { to: '/student/notifications', label: 'Notifications', icon: Bell },
    { to: '/student/settings', label: 'Settings', icon: Settings },
  ];

  const teacherLinks: SidebarLink[] = [
    { to: '/teacher/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/teacher/labs', label: 'My Laboratories', icon: FlaskConical },
    { to: '/teacher/practicals', label: 'Practical Mgmt', icon: FileText },
    { to: '/teacher/assignments', label: 'Assignments', icon: ClipboardList, badge: '38' },
    { to: '/teacher/students', label: 'Student Directory', icon: GraduationCap },
    { to: '/teacher/collaboration', label: 'Faculty Collab', icon: Users2 },
    { to: '/teacher/resources', label: 'Shared Resources', icon: BookMarked },
    { to: '/teacher/messages', label: 'Messages', icon: MessageSquare },
    { to: '/teacher/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/teacher/settings', label: 'Settings', icon: Settings },
  ];

  const adminLinks: SidebarLink[] = [
    { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Directory', icon: ShieldCheck },
    { to: '/admin/students', label: 'Student Accounts', icon: GraduationCap },
    { to: '/admin/teachers', label: 'Teacher Verification', icon: Users2 },
    { to: '/admin/labs', label: 'Lab Configuration', icon: FlaskConical },
    { to: '/admin/assignments', label: 'Assignment Logs', icon: ClipboardList },
    { to: '/admin/resources', label: 'System Resources', icon: BookMarked },
    { to: '/admin/sessions', label: 'Active Sessions', icon: Activity },
    { to: '/admin/reports', label: 'Audit Logs', icon: History },
    { to: '/admin/settings', label: 'Platform Settings', icon: Settings },
  ];

  const links = role === 'teacher' ? teacherLinks : role === 'admin' ? adminLinks : studentLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 flex-1">
        <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          {role === 'teacher' ? 'Faculty Workspace' : role === 'admin' ? 'University Administration' : 'Student Workspace'}
        </div>
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group',
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold shadow-2xs'
                      : 'text-brand-muted hover:text-navy-900 hover:bg-slate-50'
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span
                    className={cn(
                      'px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                      link.badge === 'Live'
                        ? 'bg-teal-100 text-teal-700 animate-pulse'
                        : 'bg-primary/15 text-primary'
                    )}
                  >
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* University Terminal Footer */}
      <div className="p-4 border-t border-slate-100">
        <div className="p-3 bg-brand-canvas rounded-xl border border-slate-200/80 text-left">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-[11px] font-semibold text-navy-900">Virtual Lab Online</span>
          </div>
          <p className="text-[10px] text-brand-muted mt-1">
            Sandbox & SQLite WASM Ready
          </p>
        </div>
      </div>
    </aside>
  );
};
