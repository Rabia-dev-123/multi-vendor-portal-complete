"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import Label from "@/components/form/Label";
import {
  useFeatureFlags,
  useUpdateFeatureFlags,
} from "@/lib/hooks/useFeatureFlags";
import {
  FEATURE_FLAG_LABELS,
  type FeatureFlagKey,
  getDefaultFeatureFlags,
} from "@/lib/featureFlags";
import { UpdateFeatureFlagsInput } from "@/lib/validations/featureFlags";

type FeatureFlagsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
  userName: string;
  onClose: () => void;
};

export default function FeatureFlagsModal({
  open,
  onOpenChange,
  userId,
  userName,
  onClose,
}: FeatureFlagsModalProps) {
  const { data, isLoading } = useFeatureFlags(open ? userId : null);
  const updateFlags = useUpdateFeatureFlags();

  const [localFlags, setLocalFlags] = useState<UpdateFeatureFlagsInput>(
    getDefaultFeatureFlags()
  );

  useEffect(() => {
    if (open && data?.featureFlags) {
      // Use startTransition to avoid blocking render
      React.startTransition(() => {
        setLocalFlags(data.featureFlags);
      });
    }
  }, [open, data]);

  const handleToggle = (key: FeatureFlagKey, checked: boolean) => {
    setLocalFlags((prev) => ({
      ...prev,
      [key]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateFlags.mutateAsync({ userId, flags: localFlags });
      onClose();
    } catch (error) {
      console.error("Failed to update feature flags:", error);
    }
  };

  const handleCancel = () => {
    if (data?.featureFlags) {
      setLocalFlags(data.featureFlags);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Feature Permissions</DialogTitle>
            <DialogClose onClose={handleCancel} />
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <DialogBody>
            {/* User Info */}
            <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Managing permissions for:
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {userName}
              </p>
            </div>

            {/* Error Display */}
            {updateFlags.error && (
              <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-lg dark:bg-red-900/20 dark:text-red-400">
                {updateFlags.error.message}
              </div>
            )}

            {/* Loading State */}
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Enable or disable specific features for this admin:
                </p>

                {/* Feature Toggles */}
                {(Object.keys(FEATURE_FLAG_LABELS) as FeatureFlagKey[]).map(
                  (key) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
                    >
                      <div className="flex-1">
                        <Label className="font-medium text-gray-900 dark:text-white">
                          {FEATURE_FLAG_LABELS[key]}
                        </Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {getFeatureDescription(key)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggle(key, !localFlags[key])}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
                          localFlags[key]
                            ? "bg-brand-500"
                            : "bg-gray-200 dark:bg-gray-700"
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${
                            localFlags[key]
                              ? "translate-x-5"
                              : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </DialogBody>

          <DialogFooter className="pr-4 pb-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateFlags.isPending || isLoading}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-brand-500 hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateFlags.isPending ? "Saving..." : "Save Changes"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Get a descriptive text for each feature flag
 */
function getFeatureDescription(key: FeatureFlagKey): string {
  const descriptions: Record<FeatureFlagKey, string> = {
    manageVendors: "Approve, edit, and manage vendor accounts",
    manageProducts: "Add, edit, and manage product listings",
    manageOrders: "View and process customer orders",
  };

  return descriptions[key];
}
