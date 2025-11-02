import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type Prisma } from "@prisma/client";

export type Vendor = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    email: true;
    role: true;
    companyName: true;
    phoneNumber: true;
    address: true;
    website: true;
    taxId: true;
    approvedAt: true;
    approvedBy: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
    lastLoginAt: true;
    createdAt: true;
    updatedAt: true;
  };
}>;

type GetVendorsParams = {
  status?: string;
};

async function fetchVendors(params?: GetVendorsParams): Promise<Vendor[]> {
  const searchParams = new URLSearchParams();
  if (params?.status && params.status !== "all") {
    searchParams.append("status", params.status);
  }

  const url = `/api/vendors${
    searchParams.toString() ? `?${searchParams}` : ""
  }`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch vendors");
  }

  const data = await response.json();
  return data.vendors;
}

async function approveVendor(id: number): Promise<Vendor> {
  const response = await fetch(`/api/vendors/${id}/approve`, {
    method: "PATCH",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to approve vendor");
  }

  const result = await response.json();
  return result.vendor;
}

async function revokeVendorApproval(id: number): Promise<Vendor> {
  const response = await fetch(`/api/vendors/${id}/approve`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to revoke vendor approval");
  }

  const result = await response.json();
  return result.vendor;
}

export function useVendors(params?: GetVendorsParams) {
  return useQuery({
    queryKey: ["vendors", params],
    queryFn: () => fetchVendors(params),
  });
}

export function useApproveVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useRevokeVendorApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeVendorApproval,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
