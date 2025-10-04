import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
// CHANGED: Replaced 'Package' with 'Briefcase' icon
import { LayoutDashboard, Users, ShieldAlert, BarChart3, Briefcase } from 'lucide-react';

const navLinks = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/admin/dashboard' },
  { icon: Users, label: 'User Management', to: '/admin/users' },
  { icon: Briefcase, label: 'Group Management', to: '/admin/groups' }, // <-- UPDATED ICON
  { icon: ShieldAlert, label: 'Disputes', to: '/admin/disputes' },
  { icon: BarChart3, label: 'Analytics', to: '/admin/analytics' },
];

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
            DapBuddy Admin
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                  isActive
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300'
                    : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`
              }
            >
              <link.icon className="w-5 h-5" />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;