import React from 'react';
import { ShieldAlert, AlertTriangle, Info, Play, CheckCircle2, Shield } from 'lucide-react';

interface BadgeProps {
  value: string;
}

export const SeverityBadge: React.FC<BadgeProps> = ({ value }) => {
  const normalized = value.toUpperCase();
  
  let styles = 'bg-slate-900/80 text-slate-400 border-slate-700/80';
  let icon = <Info className="w-3.5 h-3.5 mr-1" />;
  
  if (normalized === 'CRITICAL') {
    styles = 'bg-red-950/40 text-cyberRed border-red-500/50 glow-border-red';
    icon = <ShieldAlert className="w-3.5 h-3.5 mr-1 animate-pulse" />;
  } else if (normalized === 'HIGH') {
    styles = 'bg-orange-950/40 text-orange-400 border-orange-500/50';
    icon = <AlertTriangle className="w-3.5 h-3.5 mr-1" />;
  } else if (normalized === 'MEDIUM') {
    styles = 'bg-yellow-950/40 text-cyberYellow border-yellow-500/50';
    icon = <AlertTriangle className="w-3.5 h-3.5 mr-1" />;
  } else if (normalized === 'LOW') {
    styles = 'bg-blue-950/40 text-cyberBlue border-blue-500/50';
    icon = <Info className="w-3.5 h-3.5 mr-1" />;
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold border transition-all ${styles}`}>
      {icon}
      {value}
    </span>
  );
};

export const StatusBadge: React.FC<BadgeProps> = ({ value }) => {
  const normalized = value.toUpperCase();
  
  let styles = 'bg-slate-900/80 text-slate-400 border-slate-700/80';
  let icon = <Info className="w-3.5 h-3.5 mr-1" />;
  
  if (normalized === 'ACTIVE') {
    styles = 'bg-emerald-950/40 text-cyberGreen border-emerald-500/50 cyber-active glow-border-green';
    icon = <Shield className="w-3.5 h-3.5 mr-1 animate-pulse" />;
  } else if (normalized === 'INVESTIGATED') {
    styles = 'bg-purple-950/40 text-cyberPurple border-purple-500/50';
    icon = <Play className="w-3.5 h-3.5 mr-1" />;
  } else if (normalized === 'RESOLVED') {
    styles = 'bg-blue-950/40 text-cyberBlue border-blue-500/50';
    icon = <CheckCircle2 className="w-3.5 h-3.5 mr-1" />;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] uppercase font-mono font-bold border transition-all ${styles}`}>
      {icon}
      {value}
    </span>
  );
};
