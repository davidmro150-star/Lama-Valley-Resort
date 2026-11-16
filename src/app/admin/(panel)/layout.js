
import { auth } from "@/auth";
import { redirect } from "next/navigation";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default async function AdminPanelLayout({ children }) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/admin/login");
  }

  return (
    <div className="admin-layout flex min-h-screen bg-[#f7f5ef]">
      <div className="admin-sidebar">
        <AdminSidebar />
      </div>

      <div className="admin-content min-w-0 flex-1">
        <div className="admin-header">
          <AdminHeader />
        </div>

        <main className="admin-main min-h-[calc(100vh-82px)] p-5 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
