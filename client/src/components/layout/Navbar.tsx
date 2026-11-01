import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Bell,
  Search,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Sparkles,
  Layers,
  FlaskConical,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { MOCK_NOTIFICATIONS } from '../../services/mockData';

export const Navbar: React.FC = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const unreadNotifs = MOCK_NOTIFICATIONS.filter((n) => !n.isRead);

  const getDashboardPath = () => {
    if (role === 'student') return '/student/dashboard';
    if (role === 'teacher') return '/teacher/dashboard';
    if (role === 'admin') return '/admin/dashboard';
    return '/';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Brand & Left Links */}
      <div className="flex items-center gap-6">
        <Link to={getDashboardPath()} className="flex items-center gap-2.5 group">
          <img
            src="/lumio-logo.svg"
            alt="LUMIO Logo"
            className="w-8 h-8 rounded-lg shadow-xs group-hover:scale-105 transition-transform"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-navy-900 tracking-tight">LUMIO</span>
              <Badge variant="aqua" size="sm" className="hidden sm:inline-flex">
                v1.0
              </Badge>
            </div>
          </div>
        </Link>

        {user && (
          <div className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-200">
            <Link
              to={role === 'student' ? '/student/labs' : '/teacher/labs'}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-muted hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <FlaskConical className="w-3.5 h-3.5 text-primary" />
              <span>Explore Labs</span>
            </Link>
            <Link
              to={role === 'student' ? '/student/collaboration' : '/teacher/collaboration'}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-muted hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-teal-600" />
              <span>Collaboration</span>
            </Link>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* University Badge */}
        {user && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200/80 rounded-full text-xs text-brand-muted">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium text-navy-900">{user.university}</span>
            <span className="text-slate-400">|</span>
            <span>{user.department}</span>
          </div>
        )}

        {/* Notifications Dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifMenu(!showNotifMenu);
                setShowProfileMenu(false);
              }}
              className="relative p-2 text-slate-500 hover:text-navy-900 hover:bg-slate-100 rounded-xl transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-white"></span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-floating border border-slate-200 p-3 z-50 animate-fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
                  <h4 className="text-xs font-bold text-navy-900">Notifications</h4>
                  <span className="text-[11px] text-primary font-medium cursor-pointer">
                    Mark all read
                  </span>
                </div>
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto mt-1">
                  {MOCK_NOTIFICATIONS.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        setShowNotifMenu(false);
                        if (notif.link) navigate(notif.link);
                      }}
                      className="p-2.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-navy-900">{notif.title}</span>
                        {!notif.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        )}
                      </div>
                      <p className="text-[11px] text-brand-muted mt-0.5 leading-snug">
                        {notif.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Profile Menu */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifMenu(false);
              }}
              className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
              />
              <div className="text-left hidden md:block">
                <p className="text-xs font-semibold text-navy-900 leading-none">{user.name}</p>
                <p className="text-[10px] text-brand-muted mt-0.5 capitalize">{user.role}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-floating border border-slate-200 py-1.5 z-50 animate-fade-in">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-semibold text-navy-900">{user.name}</p>
                  <p className="text-[11px] text-brand-muted truncate">{user.email}</p>
                  <Badge
                    variant={user.role === 'teacher' ? 'aqua' : user.role === 'admin' ? 'warning' : 'primary'}
                    size="sm"
                    className="mt-1 capitalize"
                  >
                    {user.role} Portal
                  </Badge>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate(`/${role}/profile`);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-brand-text hover:bg-slate-50 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate(`/${role}/settings`);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-brand-text hover:bg-slate-50 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Account Settings</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-3.5 py-1.5 text-xs font-semibold text-navy-900 hover:text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-3.5 py-1.5 text-xs font-semibold bg-primary hover:bg-primary-dark text-white rounded-lg shadow-xs transition-colors"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
