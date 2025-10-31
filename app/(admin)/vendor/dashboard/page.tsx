"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function VendorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!session || session.user.role !== "VENDOR") {
    router.push("/signin");
    return null;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Vendor Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Welcome back, {session.user.name}!
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">
            My Products
          </h3>
          <p className="mt-2 text-2xl font-semibold text-brand-500">0</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Total products listed
          </p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">
            Pending Orders
          </h3>
          <p className="mt-2 text-2xl font-semibold text-yellow-500">0</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Orders awaiting processing
          </p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">
            Total Revenue
          </h3>
          <p className="mt-2 text-2xl font-semibold text-green-500">$0.00</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            This month
          </p>
        </div>
      </div>

      <div className="mt-6 p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
          Account Details
        </h3>
        <div className="space-y-2 text-sm">
          <p className="text-gray-600 dark:text-gray-400">
            <span className="font-medium">Email:</span> {session.user.email}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            <span className="font-medium">Role:</span> {session.user.role}
          </p>
        </div>
      </div>
    </div>
  );
}

