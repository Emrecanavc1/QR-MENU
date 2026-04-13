"use client";

import { formatCurrency } from "@/lib/utils";

interface DataPoint {
  label: string;
  revenue: number;
}

interface Props {
  data: DataPoint[];
  title: string;
  currency?: string;
  height?: number;
}

export function RevenueChart({ data, title, currency = "TRY", height = 160 }: Props) {
  const max = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      <div className="flex items-end gap-1" style={{ height }}>
        {data.map((point, i) => {
          const heightPct = (point.revenue / max) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-1 hidden group-hover:block z-10 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                {point.label}: {formatCurrency(point.revenue, currency)}
              </div>
              {/* Bar */}
              <div
                className="w-full bg-primary rounded-t-sm opacity-80 hover:opacity-100 transition-all"
                style={{ height: `${Math.max(heightPct, 2)}%` }}
              />
            </div>
          );
        })}
      </div>
      {/* X ekseni etiketleri */}
      <div className="flex gap-1 mt-1">
        {data.map((point, i) => (
          <p key={i} className="flex-1 text-center text-xs text-muted-foreground truncate">
            {point.label}
          </p>
        ))}
      </div>
    </div>
  );
}
