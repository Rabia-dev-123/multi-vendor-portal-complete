import { z } from "zod";

/**
 * Zod validation schema for Feature Flags
 *
 * Validates that feature flags are an object with boolean values
 * for each defined feature key.
 */
export const featureFlagsSchema = z.object({
  manageVendors: z.boolean(),
  manageProducts: z.boolean(),
  manageOrders: z.boolean(),
});

export type FeatureFlagsInput = z.infer<typeof featureFlagsSchema>;

/**
 * Partial schema for updating feature flags
 * Allows updating individual flags without providing all of them
 */
export const updateFeatureFlagsSchema = featureFlagsSchema.partial();

export type UpdateFeatureFlagsInput = z.infer<typeof updateFeatureFlagsSchema>;
