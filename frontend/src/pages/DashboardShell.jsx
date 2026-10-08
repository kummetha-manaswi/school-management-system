import React from 'react';
import { useHealthCheck } from '../hooks/useHealthCheck';
import { 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Server, 
  Smartphone, 
  Layers, 
  Users, 
  ShieldCheck,
  Code
} from 'lucide-react';

export const DashboardShell = () => {
  const { data: health, isLoading, isError, error, refetch, isFetching } = useHealthCheck();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-medium mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Project Foundation Ready</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">School Management System</h2>
            <p className="text-indigo-200 text-sm mt-1 max-w-2xl">
              Centralized platform shell for Academic, Parent, Operations, and Worker workflows.
              Business logic is isolated for concurrent two-developer collaboration.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 font-mono">
              v1.0.0-foundation
            </span>
          </div>
        </div>
      </div>

      {/* Backend API Health Status Check Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800">Backend API Integration Status</h3>
              <p className="text-xs text-slate-500">Live health verification against <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-mono">GET /api/health</code></p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Check Health</span>
          </button>
        </div>

        <div className="mt-4">
          {isLoading ? (
            <div className="flex items-center space-x-3 text-slate-500 text-sm py-2">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Pinging backend health endpoint...</span>
            </div>
          ) : isError ? (
            <div className="flex items-start space-x-3 bg-amber-50 border border-amber-200 p-4 rounded-lg text-amber-800 text-sm">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Backend server not reachable at configured URL</p>
                <p className="text-xs text-amber-700 mt-1">
                  Ensure the Express server is running on port 5000 (<code className="font-mono">npm run dev:backend</code>).
                </p>
                <p className="text-xs text-amber-600 font-mono mt-2">Error: {error?.message || 'Connection refused'}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-emerald-900">Backend API is Healthy</p>
                  <p className="text-xs text-emerald-700">{health?.message || 'School Management API is running'}</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold uppercase px-2.5 py-1 rounded bg-emerald-200/80 text-emerald-900">
                {health?.status || 'OK'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Two-Developer Architecture Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Person 1 Box */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
              <h3 className="font-semibold text-slate-800">Person 1: Academic & Parent</h3>
            </div>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-medium px-2 py-0.5 rounded border border-indigo-200">
              Module Scope
            </span>
          </div>
          <div className="mt-4 space-y-2 text-xs text-slate-600">
            <p className="text-slate-500">Assigned business modules (ready for phase 2 implementation):</p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              {['Student Management', 'Teacher Management', 'Attendance Tracking', 'Assignments', 'Exams & Results', 'Parent App (Mobile)'].map((mod) => (
                <div key={mod} className="p-2 rounded bg-slate-50 border border-slate-200/60 font-medium text-slate-700 flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  <span>{mod}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Person 2 Box */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <h3 className="font-semibold text-slate-800">Person 2: Operations & Worker</h3>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 font-medium px-2 py-0.5 rounded border border-emerald-200">
              Module Scope
            </span>
          </div>
          <div className="mt-4 space-y-2 text-xs text-slate-600">
            <p className="text-slate-500">Assigned business modules (ready for phase 2 implementation):</p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              {['Worker Management', 'Worker App (Mobile)', 'Hostel Management', 'Transport Management', 'Fee Management', 'Inventory & Maintenance'].map((mod) => (
                <div key={mod} className="p-2 rounded bg-slate-50 border border-slate-200/60 font-medium text-slate-700 flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>{mod}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Technical Stack Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-start space-x-3">
          <div className="p-2 rounded bg-indigo-50 text-indigo-600">
            <Code className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800">Web Portal</h4>
            <p className="text-xs text-slate-500 mt-0.5">React 18 + Vite + Tailwind CSS + TanStack Query</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-start space-x-3">
          <div className="p-2 rounded bg-blue-50 text-blue-600">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800">Backend API</h4>
            <p className="text-xs text-slate-500 mt-0.5">Node.js + Express + Mongoose (REST API)</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-start space-x-3">
          <div className="p-2 rounded bg-purple-50 text-purple-600">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800">Mobile Apps</h4>
            <p className="text-xs text-slate-500 mt-0.5">React Native + Expo (Parent / Staff / Worker)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardShell;
