import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Calendar, 
  FileText, 
  Award, 
  Wrench, 
  Bus, 
  Home, 
  CreditCard, 
  Package, 
  ShieldCheck, 
  LayoutDashboard,
  LogOut,
  HeartHandshake
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const academicItems = [
    { label: 'Student Management', icon: Users, path: '/academic/students', status: 'Active' },
    { label: 'Teacher Management', icon: GraduationCap, path: '/academic/teachers', status: 'Active' },
    { label: 'Parent Management', icon: HeartHandshake, path: '/academic/parents', status: 'Active' },
    { label: 'Attendance', icon: Calendar, path: '/academic/attendance', status: 'Active' },
    { label: 'Assignments', icon: BookOpen, path: '/academic/assignments', status: 'Active' },
    { label: 'Exams & Results', icon: Award, path: '/academic/exams', status: 'Active' },
    { label: 'Teacher Notes', icon: FileText, path: '/academic/notes', status: 'Active' },
  ];

  const operationsItems = [
    { label: 'Worker Management', icon: Users, status: 'Planned' },
    { label: 'Hostel', icon: Home, status: 'Planned' },
    { label: 'Transport', icon: Bus, status: 'Planned' },
    { label: 'Fees', icon: CreditCard, status: 'Planned' },
    { label: 'Inventory', icon: Package, status: 'Planned' },
    { label: 'Maintenance', icon: Wrench, status: 'Planned' },
  ];

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-slate-200 flex flex-col flex-shrink-0 shadow-lg">
        {/* Brand */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-base text-white tracking-wide leading-tight">School Management</h1>
            <p className="text-xs text-slate-400">Admin Control Panel</p>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          <div>
            <Link
              to="/"
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Foundation Dashboard</span>
            </Link>
          </div>

          {/* Dev 1 Domain: Academic & Parent */}
          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Academic & Parent Side
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                Person 1
              </span>
            </div>
            <ul className="space-y-1">
              {academicItems.map((item) => (
                <li key={item.label}>
                  {item.path ? (
                    <Link
                      to={item.path}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        location.pathname.startsWith(item.path)
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        location.pathname.startsWith(item.path)
                          ? 'bg-indigo-800 text-indigo-100'
                          : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                      }`}>
                        {item.status}
                      </span>
                    </Link>
                  ) : (
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-md text-xs text-slate-400 hover:text-slate-300 hover:bg-slate-800/60 cursor-not-allowed">
                      <div className="flex items-center space-x-2.5">
                        <item.icon className="w-4 h-4 text-slate-500" />
                        <span>{item.label}</span>
                      </div>
                      <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-400">
                        {item.status}
                      </span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Dev 2 Domain: Operations & Worker */}
          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Operations & Worker Side
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                Person 2
              </span>
            </div>
            <ul className="space-y-1">
              {operationsItems.map((item) => (
                <li key={item.label}>
                  <div className="flex items-center justify-between px-3 py-1.5 rounded-md text-xs text-slate-400 hover:text-slate-300 hover:bg-slate-800/60 cursor-not-allowed">
                    <div className="flex items-center space-x-2.5">
                      <item.icon className="w-4 h-4 text-slate-500" />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-400">
                      {item.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Architecture v1.0</span>
          </div>
          <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">Foundation</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 shadow-sm">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-semibold text-slate-700">School Admin Portal</span>
            <span className="text-slate-300">|</span>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-medium px-2 py-0.5 rounded-full border border-indigo-200">
              Technical Foundation Phase
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3 border-r border-slate-200 pr-4">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase shadow-inner">
                  {user.name ? user.name.charAt(0) : 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-slate-800 leading-tight">
                    {user.name || user.email}
                  </div>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider ${
                      user.role === 'admin'
                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}>
                      {user.role}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate max-w-[150px]">{user.email}</span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={logout}
              title="Sign out of staff portal"
              className="flex items-center space-x-1.5 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 transition font-medium cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
