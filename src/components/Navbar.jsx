import React from 'react';
import { 
  Bars3Icon, 
  MagnifyingGlassIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const Navbar = ({ onOpenSidebar }) => {
  return (
  <header className="sticky top-0 z-40 h-navbar bg-gradient-to-r from-primary via-secondary to-accent-blue border-b border-primary/30 text-white shadow-xl">
  <div className="px-4 sm:px-6 lg:px-8 h-full">
  <div className="flex items-center justify-between h-full">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={onOpenSidebar}
              className="lg:hidden -ml-2 p-2 text-white hover:bg-primary/30 rounded-lg shadow-md"
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" />
            </button>
            <div className="flex items-center max-w-md">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon className="h-5 w-5 text-primary" />
                </div>
                <input
                  type="search"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border-0 ring-2 ring-primary/30 rounded-lg bg-white/20 focus:ring-2 focus:ring-secondary text-sm placeholder:text-primary text-white shadow"
                />
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-6">
            {/* Notifications */}
            <button className="relative p-2 text-white hover:bg-secondary/30 rounded-lg shadow-md">
              <span className="sr-only">View notifications</span>
              <BellIcon className="h-6 w-6" />
              <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-error animate-pulse" />
            </button>

            {/* User menu */}
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">A</span>
              </div>
              <div className="hidden md:flex md:flex-col">
                <span className="text-sm font-medium text-slate-100">Administrator</span>
                <span className="text-xs text-slate-200">admin@llg.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
