import type { Metadata } from "next";
// import SuperAdminDashboard from "./superadmin/dashboard/page";
import EcommerceDashboard from "./ecommerceDashboard";

export const metadata: Metadata = {
  title: "Drop Sigma",
  description: "platform for managing your orders and vendors",
};

export default function Dashboard() {
  return <EcommerceDashboard />;
  // return <SuperAdminDashboard />;
}
