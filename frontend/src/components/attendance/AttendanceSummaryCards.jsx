import React from 'react';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  HelpCircle, 
  Percent, 
  RefreshCw 
} from 'lucide-react';

export const AttendanceSummaryCards = ({ summary, isLoading }) => {
  const {
    total = 0,
    present = 0,
    absent = 0,
    late = 0,
    excused = 0,
    attendanceRate = 0,
  } = summary || {};

  const cards = [
    {
      label: 'Total Recorded',
      value: total,
      subtext: 'Attendance entries',
      icon: Users,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      label: 'Present',
      value: present,
      subtext: total > 0 ? `${Math.round((present / total) * 100)}% of total` : '0%',
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      label: 'Absent',
      value: absent,
      subtext: total > 0 ? `${Math.round((absent / total) * 100)}% of total` : '0%',
      icon: XCircle,
      color: 'text-rose-600 bg-rose-50 border-rose-100',
    },
    {
      label: 'Late',
      value: late,
      subtext: total > 0 ? `${Math.round((late / total) * 100)}% of total` : '0%',
      icon: Clock,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      label: 'Excused',
      value: excused,
      subtext: total > 0 ? `${Math.round((excused / total) * 100)}% of total` : '0%',
      icon: HelpCircle,
      color: 'text-sky-600 bg-sky-50 border-sky-100',
    },
    {
      label: 'Attendance Rate',
      value: `${attendanceRate}%`,
      subtext: total > 0 ? 'Present / Total recorded' : 'No records today',
      icon: Percent,
      color: 'text-violet-600 bg-violet-50 border-violet-100',
      isRate: true,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-slate-200 animate-pulse h-24">
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
            <div className="h-6 bg-slate-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {card.label}
            </span>
            <div className={`p-1.5 rounded-lg border ${card.color}`}>
              <card.icon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-slate-900 font-mono">
              {card.value}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">{card.subtext}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AttendanceSummaryCards;
