import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  DocumentChartBarIcon,
  ArrowLeftOnRectangleIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabaseClient';

const Sidebar = ({ open = false, onClose = () => {}, user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Navigation for all users
  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Wards', href: '/wards', icon: UsersIcon },
    { name: 'Projects', href: '/projects', icon: ClipboardDocumentListIcon },
    { name: 'Budgets', href: '/budgets', icon: BanknotesIcon },
    { name: 'Reports', href: '/reports', icon: DocumentChartBarIcon },
  ];

  // Admin-only navigation
  const adminNavigation = [
    { name: 'Admin Settings', href: '/admin/settings', icon: Cog6ToothIcon },
    // Add more admin-only links here
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) return null;

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 md:hidden ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
        <div
          className={`absolute inset-0 bg-black/30 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
          onClick={onClose}
        />
        <aside className={`absolute left-0 top-0 bottom-0 w-64 bg-gradient-sidebar shadow-lg transform transition-transform ${open ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center space-x-2">
                <Link to="/" onClick={onClose} className="h-8 w-8 rounded bg-primary-500 flex items-center justify-center hover:opacity-90 transition-opacity">
                  <span className="text-lg font-bold text-white">L</span>
                </Link>
                <h1 className="text-lg font-bold text-slate-900">LLG</h1>
              </div>
              <button onClick={onClose} className="p-2 text-slate-700 hover:bg-slate-100 rounded-md">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-4 flex-1 px-2 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200
                      ${isActive ? 'bg-primary-100 text-primary-700 font-semibold shadow' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'}`}
                  >
                    <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-primary-600' : 'text-slate-500 group-hover:text-slate-900'}`} />
                    {item.name}
                  </Link>
                );
              })}
              {/* Admin-only links */}
              {user?.role?.toLowerCase() === 'admin' && (
                <div className="mt-4 border-t pt-4">
                  {adminNavigation.map((item) => {
                    const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={onClose}
                        className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200
                          ${isActive ? 'bg-primary-100 text-primary-700 font-semibold shadow' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'}`}
                      >
                        <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-primary-600' : 'text-slate-500 group-hover:text-slate-900'}`} />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </nav>
            <div className="p-4 border-t">
              <button onClick={handleLogout} className="group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors duration-200">
                <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5 flex-shrink-0 text-red-600" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-sidebar md:flex-col fixed inset-y-0 z-20">
        <div className="flex min-h-0 flex-1 flex-col border-r border-slate-100 bg-gradient-sidebar shadow-sidebar text-slate-900">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                  <span className="text-lg font-extrabold text-white drop-shadow">L</span>
                </div>
                <h1 className="text-xl font-extrabold text-white drop-shadow">LLG Platform</h1>
              </div>
            </div>
            <nav className="mt-8 flex-1 space-y-1 px-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2.5 text-base font-bold rounded-lg transition-all duration-200 shadow-lg
                      ${isActive ? 'bg-gradient-to-r from-primary to-secondary text-white scale-105' : 'text-white hover:bg-gradient-to-r hover:from-primary hover:to-secondary hover:scale-105'}`}
                  >
                    <item.icon className="mr-3 h-6 w-6 flex-shrink-0 text-white drop-shadow" />
                    {item.name}
                  </Link>
                );
              })}
              {/* Admin-only links */}
              {user?.role?.toLowerCase() === 'admin' && (
                <div className="mt-4 border-t pt-4">
                  {adminNavigation.map((item) => {
                    const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`group flex items-center px-3 py-2.5 text-base font-bold rounded-lg transition-all duration-200 shadow-lg
                          ${isActive ? 'bg-gradient-to-r from-primary to-secondary text-white scale-105' : 'text-white hover:bg-gradient-to-r hover:from-primary hover:to-secondary hover:scale-105'}`}
                      >
                        <item.icon className="mr-3 h-6 w-6 flex-shrink-0 text-white drop-shadow" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t border-slate-100 p-4">
            <button onClick={handleLogout} className="group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-red-50 active:bg-red-100 transition-colors duration-200">
              <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5 flex-shrink-0 text-rose-600" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
 