"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, QrCode, Download, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableModal } from "@/components/admin/TableModal";
import { QRModal } from "@/components/admin/QRModal";
import type { Table, Location } from "@/types";

type TableWithLocation = Table & { location: Location | null };

const STATUS_LABELS: Record<string, { label: string; variant: "success" | "destructive" | "warning" }> = {
  EMPTY: { label: "Boş", variant: "success" },
  OCCUPIED: { label: "Dolu", variant: "destructive" },
  WAITING_PAYMENT: { label: "Ödeme Bekliyor", variant: "warning" },
};

export default function TablesPage() {
  const [tables, setTables] = useState<TableWithLocation[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableModal, setTableModal] = useState<{ open: boolean; data?: TableWithLocation | null }>({ open: false });
  const [qrModal, setQrModal] = useState<{ open: boolean; table?: TableWithLocation | null }>({ open: false });
  const [activeLocation, setActiveLocation] = useState<string>("all");

  const fetchTables = useCallback(async () => {
    setLoading(true);
    try {
      const [tablesRes, locationsRes] = await Promise.all([
        fetch("/api/v1/admin/tables"),
        fetch("/api/v1/admin/locations"),
      ]);
      const [tablesData, locationsData] = await Promise.all([tablesRes.json(), locationsRes.json()]);
      if (tablesData.success) setTables(tablesData.data.tables);
      if (locationsData.success) setLocations(locationsData.data.locations);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTables(); }, [fetchTables]);

  async function deleteTable(id: string) {
    if (!confirm("Bu masayı silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/v1/admin/tables/${id}`, { method: "DELETE" });
    fetchTables();
  }

  const filteredTables = activeLocation === "all"
    ? tables
    : tables.filter((t) => t.locationId === activeLocation);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Masalar & QR Kodlar</h1>
          <p className="text-sm text-muted-foreground mt-1">{tables.length} masa toplam</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open("/api/v1/admin/tables/qr/bulk", "_blank")}>
            <Download className="w-4 h-4 mr-1" />
            Toplu QR İndir
          </Button>
          <Button onClick={() => setTableModal({ open: true })}>
            <Plus className="w-4 h-4 mr-1" />
            Masa Ekle
          </Button>
        </div>
      </div>

      {/* Bölge filtreleme */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveLocation("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeLocation === "all" ? "bg-primary text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-primary"}`}
        >
          Tümü ({tables.length})
        </button>
        {locations.map((loc) => (
          <button
            key={loc.id}
            onClick={() => setActiveLocation(loc.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeLocation === loc.id ? "bg-primary text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-primary"}`}
          >
            {loc.name} ({tables.filter((t) => t.locationId === loc.id).length})
          </button>
        ))}
      </div>

      {/* Masa grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredTables.map((table) => {
          const status = STATUS_LABELS[table.status] ?? STATUS_LABELS.EMPTY;
          return (
            <div key={table.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-primary/50 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-900 text-lg">{table.number}</p>
                  <p className="text-xs text-muted-foreground">{table.name ?? `Masa ${table.number}`}</p>
                </div>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              <div className="text-xs text-muted-foreground mb-3">
                {table.location?.name ?? "Bölge yok"} • {table.capacity} kişilik
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => setQrModal({ open: true, table })}>
                  <QrCode className="w-3 h-3 mr-1" />QR
                </Button>
                <Button size="icon" variant="ghost" className="w-8 h-8" onClick={() => setTableModal({ open: true, data: table })}>
                  <Pencil className="w-3 h-3" />
                </Button>
                <Button size="icon" variant="ghost" className="w-8 h-8 text-destructive" onClick={() => deleteTable(table.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          );
        })}
        {/* Masa ekle butonu */}
        <button
          onClick={() => setTableModal({ open: true })}
          className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-4 hover:border-primary hover:text-primary transition-colors flex flex-col items-center justify-center gap-2 text-gray-400 min-h-[120px]"
        >
          <Plus className="w-6 h-6" />
          <span className="text-sm font-medium">Yeni Masa</span>
        </button>
      </div>

      <TableModal
        open={tableModal.open}
        data={tableModal.data}
        locations={locations}
        onClose={() => setTableModal({ open: false })}
        onSave={fetchTables}
      />
      {qrModal.table && (
        <QRModal
          open={qrModal.open}
          table={qrModal.table}
          onClose={() => setQrModal({ open: false })}
        />
      )}
    </div>
  );
}
