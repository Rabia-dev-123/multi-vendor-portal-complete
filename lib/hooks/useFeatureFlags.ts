import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UpdateFeatureFlagsInput } from "../validations/featureFlags";
import { FeatureFlags } from "../featureFlags";

// Types
type FeatureFlagsResponse = {
  userId: number;
  userName: string;
  featureFlags: FeatureFlags;
};

type UpdateFeatureFlagsResponse = {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    featureFlags: FeatureFlags;
  };
};

/**
 * Fetch feature flags for a specific admin user
 */
async function fetchFeatureFlags(
  userId: number
): Promise<FeatureFlagsResponse> {
  const response = await fetch(`/api/users/${userId}/featureFlags`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch feature flags");
  }

  return await response.json();
}

/**
 * Update feature flags for a specific admin user
 */
async function updateFeatureFlags(
  userId: number,
  flags: UpdateFeatureFlagsInput
): Promise<UpdateFeatureFlagsResponse> {
  const response = await fetch(`/api/users/${userId}/featureFlags`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(flags),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update feature flags");
  }

  return await response.json();
}

/**
 * React Query hook to fetch feature flags for a specific admin
 */
export function useFeatureFlags(userId: number | null) {
  return useQuery({
    queryKey: ["featureFlags", userId],
    queryFn: () => fetchFeatureFlags(userId!),
    enabled: userId !== null && userId !== undefined,
  });
}

/**
 * React Query hook to update feature flags for an admin
 */
export function useUpdateFeatureFlags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      flags,
    }: {
      userId: number;
      flags: UpdateFeatureFlagsInput;
    }) => updateFeatureFlags(userId, flags),
    onSuccess: (data, variables) => {
      // Invalidate feature flags query for the specific user
      queryClient.invalidateQueries({
        queryKey: ["featureFlags", variables.userId],
      });

      // Also invalidate the users list to reflect updated flags
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
