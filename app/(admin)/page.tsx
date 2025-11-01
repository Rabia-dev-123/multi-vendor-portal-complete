import type { Metadata } from "next";
// import SuperAdminDashboard from "./superadmin/dashboard/page";
import EcommerceDashboard from "./ecommerceDashboard";

export const metadata: Metadata = {
  title:
    "Multi Vendor Portal Dashboard | TailAdmin - Next.js Dashboard Template",
  description: "This is the main dashboard for Multi Vendor Portal",
};

export default function Dashboard() {
  return <EcommerceDashboard />;
  // return <SuperAdminDashboard />;
}
