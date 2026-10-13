import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DemandBadgeProps {
  level: 'Low' | 'Moderate' | 'High';
  ratio?: number;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const DemandBadge: React.FC<DemandBadgeProps> = ({
  level,
  ratio,
  showIcon = true,
  size = 'md',
}) => {
  const configs = {
    High: {
      bg: 'bg-emerald-50 border-emerald-300 text-emerald-800',
      dot: 'bg-emerald-500',
      icon: TrendingUp,
      label: 'High Demand',
    },
    Moderate: {
      bg: 'bg-amber-50 border-amber-300 text-amber-800',
      dot: 'bg-amber-500',
      icon: Minus,
      label: 'Moderate Demand',
    },
    Low: {
      bg: 'bg-slate-100 border-slate-300 text-slate-700',
      dot: 'bg-slate-400',
      icon: TrendingDown,
      label: 'Low Demand',
    },
  };

  const current = configs[level] || configs.Moderate;
  const Icon = current.icon;

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${current.bg} ${sizeStyles[size]} transition-all`}
      title={ratio ? `Demand Ratio: ${ratio}x (Requested / Available)` : current.label}
    >
      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${current.dot}`} />
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span>{current.label}</span>
      {ratio !== undefined && <span className="opacity-75 font-mono text-[11px]">({ratio}x)</span>}
    </span>
  );
};
