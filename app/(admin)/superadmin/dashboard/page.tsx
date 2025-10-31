"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SuperAdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!session || session.user.role !== "SUPER_ADMIN") {
    router.push("/signin");
    return null;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Super Admin Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Welcome back, {session.user.name}!
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">
            Total Admins
          </h3>
          <p className="mt-2 text-2xl font-semibold text-purple-500">0</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Active administrators
          </p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">
            Total Vendors
          </h3>
          <p className="mt-2 text-2xl font-semibold text-brand-500">0</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            All vendors
          </p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">
            System Health
          </h3>
          <p className="mt-2 text-2xl font-semibold text-green-500">100%</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            All systems operational
          </p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">
            Total Revenue
          </h3>
          <p className="mt-2 text-2xl font-semibold text-green-600">$0.00</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Platform revenue
          </p>
        </div>
      </div>

      <div className="mt-6 p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
          System Overview
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Recent Activity
            </h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              No recent activity
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Account Details
            </h4>
            <div className="mt-1 space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <p>
                <span className="font-medium">Email:</span> {session.user.email}
              </p>
              <p>
                <span className="font-medium">Role:</span> {session.user.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

