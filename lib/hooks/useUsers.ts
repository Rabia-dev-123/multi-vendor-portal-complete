import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateUserInput, UpdateUserInput } from "../validations/user";
import { type Prisma } from "@prisma/client";

export type User = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    email: true;
    role: true;
    featureFlags: true;
    approvedAt: true;
    approvedBy: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
  };
}>;

type GetUsersParams = {
  role?: string;
  status?: string;
};

// API Functions
async function fetchUsers(params?: GetUsersParams): Promise<User[]> {
  const searchParams = new URLSearchParams();
  if (params?.role && params.role !== "all") {
    searchParams.append("role", params.role);
  }
  if (params?.status && params.status !== "all") {
    searchParams.append("status", params.status);
  }

  const url = `/api/users${searchParams.toString() ? `?${searchParams}` : ""}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch users");
  }

  const data = await response.json();
  return data.users;
}

async function createUser(data: CreateUserInput): Promise<User> {
  const response = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create user");
  }

  const result = await response.json();
  return result.user;
}

async function updateUser(id: number, data: UpdateUserInput): Promise<User> {
  const response = await fetch(`/api/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update user");
  }

  const result = await response.json();
  return result.user;
}

async function deleteUser(id: number): Promise<void> {
  const response = await fetch(`/api/users/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete user");
  }
}

async function approveUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}/approve`, {
    method: "PATCH",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to approve user");
  }

  const result = await response.json();
  return result.user;
}

async function revokeUserApproval(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}/approve`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to revoke user approval");
  }

  const result = await response.json();
  return result.user;
}

// React Query Hooks
export function useUsers(params?: GetUsersParams) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => fetchUsers(params),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserInput }) =>
      updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useApproveUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useRevokeUserApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeUserApproval,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
