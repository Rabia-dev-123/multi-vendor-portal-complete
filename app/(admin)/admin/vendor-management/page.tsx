"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import DataTable, { Column } from "@/components/tables/DataTable";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { CheckLineIcon, CloseLineIcon, ChevronDownIcon } from "@/icons";
import {
  useVendors,
  useApproveVendor,
  useRevokeVendorApproval,
} from "@/lib/hooks/useVendors";
import { useAdminFeatureAccess } from "@/lib/hooks/admin/useAdminFeatureAccess";
import { type Vendor } from "@/lib/hooks/useVendors";

export default function VendorManagementPage() {
  const router = useRouter();
  const hasAccess = useAdminFeatureAccess("manageVendors");

  const { data: vendors = [], isLoading, error: fetchError } = useVendors();
  const approveVendor = useApproveVendor();
  const revokeApproval = useRevokeVendorApproval();

  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isLoading && !hasAccess) {
      router.push("/admin/dashboard");
    }
  }, [hasAccess, isLoading, router]);

  const filteredVendors = useMemo(() => {
    let filtered = [...vendors];

    if (filterStatus === "pending") {
      filtered = filtered.filter((vendor) => !vendor.approvedAt);
    } else if (filterStatus === "approved") {
      filtered = filtered.filter((vendor) => vendor.approvedAt);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (vendor) =>
          vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vendor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (vendor.companyName &&
            vendor.companyName
              .toLowerCase()
              .includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  }, [vendors, filterStatus, searchQuery]);

  const handleApproveVendor = async (vendorId: number) => {
    if (!confirm("Are you sure you want to approve this vendor?")) return;

    try {
      await approveVendor.mutateAsync(vendorId);
      setSuccess("Vendor approved successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      alert((error as Error)?.message || "Failed to approve vendor");
    }
  };

  const handleRevokeApproval = async (vendorId: number) => {
    if (!confirm("Are you sure you want to revoke approval for this vendor?"))
      return;

    try {
      await revokeApproval.mutateAsync(vendorId);
      setSuccess("Vendor approval revoked successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      alert((error as Error)?.message || "Failed to revoke vendor approval");
    }
  };

  const columns: Column<Vendor>[] = [
    {
      header: "Name",
      cell: (vendor) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          {vendor.name}
        </span>
      ),
    },
    {
      header: "Email",
      accessor: "email",
    },
    {
      header: "Company Name",
      cell: (vendor) => vendor.companyName || "-",
    },
    {
      header: "Phone",
      cell: (vendor) => vendor.phoneNumber || "-",
    },
    {
      header: "Status",
      cell: (vendor) => {
        if (vendor.approvedAt) {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              <CheckLineIcon className="w-3 h-3" /> Approved
            </span>
          );
        } else {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
              Pending
            </span>
          );
        }
      },
    },
    {
      header: "Approved By",
      cell: (vendor) => vendor.approvedBy?.name || "-",
    },
    {
      header: "Created",
      cell: (vendor) => new Date(vendor.createdAt).toLocaleDateString(),
    },
    {
      header: "Actions",
      headerClassName: "text-right",
      cell: (vendor) => (
        <div className="flex items-center justify-end gap-2">
          {!vendor.approvedAt && (
            <button
              onClick={() => handleApproveVendor(vendor.id)}
              className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition"
              title="Approve Vendor"
            >
              <CheckLineIcon className="w-4 h-4" />
            </button>
          )}
          {vendor.approvedAt && (
            <button
              onClick={() => handleRevokeApproval(vendor.id)}
              className="p-1.5 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded transition"
              title="Revoke Approval"
            >
              <CloseLineIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  if (!hasAccess && !isLoading) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageBreadCrumb pageTitle="Vendor Management" />

      <div className="space-y-6">
        {fetchError && (
          <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg dark:bg-red-900/20 dark:text-red-400">
            {fetchError.message}
          </div>
        )}
        {success && (
          <div className="p-4 text-sm text-green-600 bg-green-50 rounded-lg dark:bg-green-900/20 dark:text-green-400">
            {success}
          </div>
        )}

        <ComponentCard title="Filters">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <Input
              type="text"
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="relative">
              <Select
                options={[
                  { value: "all", label: "All Status" },
                  { value: "pending", label: "Pending Approval" },
                  { value: "approved", label: "Approved" },
                ]}
                defaultValue={filterStatus}
                onChange={(value) => setFilterStatus(value)}
              />
              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                <ChevronDownIcon />
              </span>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title={`Vendors (${filteredVendors.length})`}>
          <DataTable<Vendor>
            data={filteredVendors as Vendor[]}
            columns={columns}
            emptyMessage="No vendors found"
          />
        </ComponentCard>
      </div>
    </>
  );
}
