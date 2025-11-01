import { FeatureFlagKey, FeatureFlags } from "../featureFlags";

/**
 * Check if a user has access to a specific feature
 *
 * @param featureFlags - The user's feature flags (from database)
 * @param featureKey - The feature key to check
 * @returns true if the user has access, false otherwise
 */
export function hasFeatureAccess(
  featureFlags: FeatureFlags | null | undefined,
  featureKey: FeatureFlagKey
): boolean {
  if (!featureFlags) {
    return false;
  }

  return featureFlags[featureKey] === true;
}

/**
 * Get a list of enabled features for a user
 *
 * @param featureFlags - The user's feature flags (from database)
 * @returns Array of enabled feature keys
 */
export function getEnabledFeatures(
  featureFlags: FeatureFlags | null | undefined
): FeatureFlagKey[] {
  if (!featureFlags) {
    return [];
  }

  return (Object.keys(featureFlags) as FeatureFlagKey[]).filter(
    (key) => featureFlags[key] === true
  );
}
