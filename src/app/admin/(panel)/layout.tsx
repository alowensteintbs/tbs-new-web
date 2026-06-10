import type { Metadata } from "next";
import { SidebarShell } from "../_components/sidebar";
import { Topbar } from "../_components/topbar";

export const metadata: Metadata = {
  title: { default: "Admin — TBS", template: "%s · TBS Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarShell>
      <Topbar title="Panel de administración" />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </SidebarShell>
  );
}
