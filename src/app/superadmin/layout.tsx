import { SuperAdminSidebar } from "@/components/superadmin/SuperAdminSidebar";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <SuperAdminSidebar />
      <main className="flex-1 bg-gray-50 overflow-auto">{children}</main>
    </div>
  );
}
