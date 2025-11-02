"use client";
import React, { useState, useMemo } from "react";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import DataTable, { Column } from "@/components/tables/DataTable";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import {
  PlusIcon,
  PencilIcon,
  CheckLineIcon,
  CloseLineIcon,
  TrashBinIcon,
  ChevronDownIcon,
  BoltIcon,
} from "@/icons";
import UserFormModal from "./userFormModal";
import FeatureFlagsModal from "./FeatureFlagsModal";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useApproveUser,
  useRevokeUserApproval,
} from "@/lib/hooks/useUsers";
import { type UserRole } from "@/lib/prisma";
import { type User } from "@/lib/hooks/useUsers";

export type UserFormData = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  companyName?: string;
  phoneNumber?: string;
  address?: string;
  website?: string;
  taxId?: string;
  designation?: string;
  autoApprove?: boolean;
};

export default function UserManagementPage() {
  // React Query hooks
  const { data: users = [], isLoading, error: fetchError } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const approveUser = useApproveUser();
  const revokeApproval = useRevokeUserApproval();

  // Local state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFeatureFlagsModal, setShowFeatureFlagsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    role: "VENDOR",
    companyName: "",
    phoneNumber: "",
    address: "",
    website: "",
    taxId: "",
    designation: "",
    autoApprove: false,
  });

  // Filtered users using useMemo
  const filteredUsers = useMemo(() => {
    let filtered = [...users];

    // Filter by role
    if (filterRole !== "all") {
      filtered = filtered.filter((user) => user.role === filterRole);
    }

    // Filter by status
    if (filterStatus === "pending") {
      filtered = filtered.filter(
        (user) => user.role === "VENDOR" && !user.approvedAt
      );
    } else if (filterStatus === "approved") {
      filtered = filtered.filter((user) => user.approvedAt);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (user.companyName &&
            user.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  }, [users, filterRole, filterStatus, searchQuery]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");

    try {
      await createUser.mutateAsync(formData);
      setSuccess("User created successfully");
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      // Error will be displayed in the form
      console.error(error);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setSuccess("");

    try {
      await updateUser.mutateAsync({ id: selectedUser.id, data: formData });
      setSuccess("User updated successfully");
      setShowEditModal(false);
      setSelectedUser(null);
      resetForm();
    } catch (error) {
      // Error will be displayed in the form
      console.error(error);
    }
  };

  const handleApproveUser = async (userId: number) => {
    if (!confirm("Are you sure you want to approve this vendor?")) return;

    try {
      await approveUser.mutateAsync(userId);
      setSuccess("Vendor approved successfully");
    } catch (error) {
      alert((error as Error)?.message || "Failed to approve vendor");
    }
  };

  const handleRevokeApproval = async (userId: number) => {
    if (!confirm("Are you sure you want to revoke approval for this vendor?"))
      return;

    try {
      await revokeApproval.mutateAsync(userId);
      setSuccess("Vendor approval revoked successfully");
    } catch (error) {
      alert((error as Error)?.message || "Failed to revoke vendor approval");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await deleteUser.mutateAsync(userId);
      setSuccess("User deleted successfully");
    } catch (error) {
      alert((error as Error)?.message || "Failed to delete user");
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      companyName: user.companyName || "",
      phoneNumber: user.phoneNumber || "",
      address: user.address || "",
      website: user.website || "",
      taxId: user.taxId || "",
      designation: user.designation || "",
    });
    setShowEditModal(true);
  };

  const openFeatureFlagsModal = (user: User) => {
    setSelectedUser(user);
    setShowFeatureFlagsModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "VENDOR",
      companyName: "",
      phoneNumber: "",
      address: "",
      website: "",
      taxId: "",
      designation: "",
      autoApprove: false,
    });
  };

  // Define table columns
  const columns: Column<User>[] = [
    {
      header: "Name",
      cell: (user) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          {user.name}
        </span>
      ),
    },
    {
      header: "Email",
      accessor: "email",
    },
    {
      header: "Role",
      cell: (user) => {
        const colors: Record<string, string> = {
          SUPER_ADMIN:
            "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
          ADMIN:
            "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
          VENDOR:
            "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        };
        return (
          <span
            className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
              colors[user.role] || "bg-gray-100 text-gray-800"
            }`}
          >
            {user.role.replace("_", " ")}
          </span>
        );
      },
    },
    {
      header: "Company/Designation",
      cell: (user) => user.companyName || user.designation || "-",
    },
    {
      header: "Status",
      cell: (user) => {
        if (user.role === "VENDOR") {
          if (user.approvedAt) {
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
        }
        return "-";
      },
    },
    {
      header: "Created",
      cell: (user) => new Date(user.createdAt).toLocaleDateString(),
    },
    {
      header: "Actions",
      headerClassName: "text-right",
      cell: (user) => (
        <div className="flex items-center justify-end gap-2">
          {user.role === "VENDOR" && !user.approvedAt && (
            <button
              onClick={() => handleApproveUser(user.id)}
              className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition"
              title="Approve Vendor"
            >
              <CheckLineIcon className="w-4 h-4" />
            </button>
          )}
          {user.role === "VENDOR" && user.approvedAt && (
            <button
              onClick={() => handleRevokeApproval(user.id)}
              className="p-1.5 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded transition"
              title="Revoke Approval"
            >
              <CloseLineIcon className="w-4 h-4" />
            </button>
          )}
          {user.role === "ADMIN" && (
            <button
              onClick={() => openFeatureFlagsModal(user)}
              className="text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition"
              title="Manage Feature Permissions"
            >
              <BoltIcon />
            </button>
          )}
          <button
            onClick={() => openEditModal(user)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition"
            title="Edit User"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteUser(user.id)}
            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
            title="Delete User"
          >
            <TrashBinIcon className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageBreadCrumb pageTitle="User Management" />

      <div className="space-y-6">
        {/* Alerts */}
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

        {/* Filters and Actions */}
        <ComponentCard title="Filters and Actions">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              {/* Search */}
              <Input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {/* Role Filter */}
              <div className="relative">
                <Select
                  options={[
                    { value: "all", label: "All Roles" },
                    { value: "SUPER_ADMIN", label: "Super Admin" },
                    { value: "ADMIN", label: "Admin" },
                    { value: "VENDOR", label: "Vendor" },
                  ]}
                  defaultValue={filterRole}
                  onChange={(value) => setFilterRole(value)}
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>

              {/* Status Filter */}
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

            {/* Create User Button */}
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white transition rounded-lg bg-brand-500 hover:bg-brand-600"
            >
              <PlusIcon className="w-4 h-4" />
              Create User
            </button>
          </div>
        </ComponentCard>

        {/* Users Table */}
        <ComponentCard title={`Users (${filteredUsers.length})`}>
          <DataTable<User>
            data={filteredUsers as User[]}
            columns={columns}
            emptyMessage="No users found"
          />
        </ComponentCard>
      </div>

      <UserFormModal
        title="Create New User"
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleCreateUser}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        isEdit={false}
        open={showCreateModal}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        onOpenChange={(open) => {
          setShowCreateModal(open);
          if (!open) resetForm();
        }}
        isSubmitting={createUser.isPending}
        error={createUser.error?.message}
      />

      <UserFormModal
        title="Edit User"
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleUpdateUser}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
          resetForm();
        }}
        isEdit={true}
        open={showEditModal}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        onOpenChange={(open) => {
          setShowEditModal(open);
          if (!open) {
            setSelectedUser(null);
            resetForm();
          }
        }}
        isSubmitting={updateUser.isPending}
        error={updateUser.error?.message}
      />

      {selectedUser && (
        <FeatureFlagsModal
          open={showFeatureFlagsModal}
          onOpenChange={(open) => {
            setShowFeatureFlagsModal(open);
            if (!open) {
              setSelectedUser(null);
            }
          }}
          userId={selectedUser.id}
          userName={selectedUser.name}
          onClose={() => {
            setShowFeatureFlagsModal(false);
            setSelectedUser(null);
            setSuccess("Feature permissions updated successfully");
          }}
        />
      )}
    </>
  );
}
