export const DEFAULT_FEATURE_FLAGS = {
  manageVendors: false,
  manageProducts: false,
  manageOrders: false,
} as const;

export type FeatureFlags = {
  [K in keyof typeof DEFAULT_FEATURE_FLAGS]: boolean;
};

export type FeatureFlagKey = keyof FeatureFlags;

export const FEATURE_FLAG_LABELS: Record<FeatureFlagKey, string> = {
  manageVendors: "Manage Vendors",
  manageProducts: "Manage Products",
  manageOrders: "Manage Orders",
};

export function getDefaultFeatureFlags(): FeatureFlags {
  return { ...DEFAULT_FEATURE_FLAGS };
}
