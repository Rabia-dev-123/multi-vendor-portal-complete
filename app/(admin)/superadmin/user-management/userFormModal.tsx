"use client";
import React, { useState, useEffect } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import Checkbox from "@/components/form/input/Checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { ChevronDownIcon, EyeIcon, EyeCloseIcon } from "@/icons";
import { UserFormData } from "./page";
import { createUserSchema, updateUserSchema } from "@/lib/validations/user";
import type { UserRole } from "@/lib/prisma";

// User Form Modal Component
function UserFormModal({
  title,
  formData,
  setFormData,
  onSubmit,
  onClose,
  isEdit,
  showPassword,
  setShowPassword,
  open,
  onOpenChange,
  isSubmitting,
  error,
}: {
  title: string;
  formData: UserFormData;
  setFormData: React.Dispatch<React.SetStateAction<UserFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isEdit: boolean;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting?: boolean;
  error?: string;
}) {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Clear validation errors when modal opens
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValidationErrors({});
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    try {
      // Validate with Zod
      const schema = isEdit ? updateUserSchema : createUserSchema;
      schema.parse(formData);

      // If validation passes, call the onSubmit handler
      onSubmit(e);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{title}</DialogTitle>
            <DialogClose onClose={onClose} />
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <DialogBody>
            {/* API Error */}
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}
            {/* Name */}
            <div>
              <Label>
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                error={!!validationErrors.name}
                hint={validationErrors.name}
              />
            </div>

            {/* Email */}
            <div>
              <Label>
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                error={!!validationErrors.email}
                hint={validationErrors.email}
              />
            </div>

            {/* Password */}
            <div>
              <Label>
                Password {!isEdit && <span className="text-red-500">*</span>}
                {isEdit && (
                  <span className="text-xs text-gray-500">
                    {" "}
                    (leave empty to keep current)
                  </span>
                )}
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Enter password"
                  error={!!validationErrors.password}
                  hint={validationErrors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                >
                  {showPassword ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Role */}
            <div>
              <Label>
                Role <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Select
                  options={[
                    { value: "VENDOR", label: "Vendor" },
                    { value: "ADMIN", label: "Admin" },
                    { value: "SUPER_ADMIN", label: "Super Admin" },
                  ]}
                  defaultValue={formData.role}
                  onChange={(value) =>
                    setFormData({ ...formData, role: value as UserRole })
                  }
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
              {validationErrors.role && (
                <p className="mt-1.5 text-xs text-error-500">
                  {validationErrors.role}
                </p>
              )}
            </div>

            {/* Role-specific fields */}
            {formData.role === "VENDOR" && (
              <>
                <div>
                  <Label>Company Name</Label>
                  <Input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                    error={!!validationErrors.companyName}
                    hint={validationErrors.companyName}
                  />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Address</Label>
                  <TextArea
                    value={formData.address}
                    onChange={(value) =>
                      setFormData({ ...formData, address: value })
                    }
                    rows={2}
                    placeholder="Enter address"
                  />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input
                    type="url"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                    placeholder="https://example.com"
                    error={!!validationErrors.website}
                    hint={validationErrors.website}
                  />
                </div>
                <div>
                  <Label>Tax ID</Label>
                  <Input
                    type="text"
                    value={formData.taxId}
                    onChange={(e) =>
                      setFormData({ ...formData, taxId: e.target.value })
                    }
                  />
                </div>
                {!isEdit && (
                  <Checkbox
                    id="autoApprove"
                    checked={formData.autoApprove || false}
                    onChange={(checked) =>
                      setFormData({ ...formData, autoApprove: checked })
                    }
                    label="Auto-approve this vendor"
                  />
                )}
              </>
            )}

            {(formData.role === "ADMIN" || formData.role === "SUPER_ADMIN") && (
              <div>
                <Label>Designation</Label>
                <Input
                  type="text"
                  value={formData.designation}
                  onChange={(e) =>
                    setFormData({ ...formData, designation: e.target.value })
                  }
                  placeholder="e.g., Operations Manager"
                />
              </div>
            )}
          </DialogBody>

          <DialogFooter className="pr-4 pb-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-brand-500 hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? "Submitting..."
                : isEdit
                ? "Update User"
                : "Create User"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default UserFormModal;
