import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

export function StatsCard({ title, value, subtitle, trend, icon: Icon, iconColor = "text-primary", iconBg = "bg-orange-50" }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", iconBg)}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
      </div>
      {trend !== undefined && (
        <div className={cn("flex items-center gap-1 mt-3 text-xs font-medium", trend >= 0 ? "text-green-600" : "text-red-500")}>
          <span>{trend >= 0 ? "▲" : "▼"}</span>
          <span>%{Math.abs(trend).toFixed(1)} geçen aya göre</span>
        </div>
      )}
    </div>
  );
}
