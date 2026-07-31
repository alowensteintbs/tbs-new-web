import type { Metadata } from "next";
import { getUser } from "@/lib/auth/dal";
import { SidebarShell } from "../_components/sidebar";
import { Topbar } from "../_components/topbar";

export const metadata: Metadata = {
  title: { default: "Admin — TBS", template: "%s · TBS Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  return (
    <SidebarShell role={user?.role}>
      <Topbar title="Panel de administración" />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </SidebarShell>
  );
}
