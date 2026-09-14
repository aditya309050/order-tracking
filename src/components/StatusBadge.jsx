import React from 'react';
import { CheckCircle2, Clock, Package, Truck, CheckCheck, Cog } from 'lucide-react';

export const STATUS_CONFIG = {
  CONFIRMED: {
    label: 'Order Confirmed',
    shortLabel: 'Confirmed',
    badgeClass: 'bg-slate-900/90 text-sky-400 border-sky-500/25',
    dotClass: 'bg-sky-400',
    icon: Clock,
    step: 1,
  },
  IN_PROCESS: {
    label: 'In Production',
    shortLabel: 'Production',
    badgeClass: 'bg-slate-900/90 text-amber-400 border-amber-500/25',
    dotClass: 'bg-amber-400',
    icon: Cog,
    step: 2,
  },
  COMPLETED: {
    label: 'QC Inspected',
    shortLabel: 'QC Passed',
    badgeClass: 'bg-slate-900/90 text-indigo-300 border-indigo-500/25',
    dotClass: 'bg-indigo-400',
    icon: CheckCircle2,
    step: 3,
  },
  PACKED: {
    label: 'Staged for Transit',
    shortLabel: 'Staged',
    badgeClass: 'bg-slate-900/90 text-purple-300 border-purple-500/25',
    dotClass: 'bg-purple-400',
    icon: Package,
    step: 4,
  },
  OUT_FOR_DELIVERY: {
    label: 'Out with Driver',
    shortLabel: 'In Transit',
    badgeClass: 'bg-slate-900/90 text-teal-300 border-teal-500/25',
    dotClass: 'bg-teal-400',
    icon: Truck,
    step: 5,
  },
  DELIVERED: {
    label: 'Fulfilled & Delivered',
    shortLabel: 'Fulfilled',
    badgeClass: 'bg-slate-900/90 text-emerald-400 border-emerald-500/25',
    dotClass: 'bg-emerald-400',
    icon: CheckCheck,
    step: 6,
  },
};

export default function StatusBadge({ status, size = 'md', showIcon = true, pulse = false }) {
  const config = STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    shortLabel: status || 'Unknown',
    badgeClass: 'bg-slate-900/90 text-slate-400 border-slate-700/40',
    dotClass: 'bg-slate-400',
    icon: Clock,
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 tracking-tight font-medium',
    md: 'text-xs px-2.5 py-1 font-medium tracking-tight',
    lg: 'text-xs sm:text-sm px-3 py-1.5 font-semibold',
  };

  const iconSizes = { sm: 11, md: 13, lg: 15 };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border shadow-sm ${config.badgeClass} ${sizeClasses[size] || sizeClasses.md}`}
    >
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        {pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dotClass}`} />
        )}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${config.dotClass}`} />
      </span>
      {showIcon && <Icon size={iconSizes[size] || 13} className="shrink-0 opacity-80" />}
      <span>{size === 'sm' ? config.shortLabel : config.label}</span>
    </span>
  );
}
