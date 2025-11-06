"use client";
import React from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// Zod validation schema
const userProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  companyName: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  taxId: z.string().optional(),
});

// Simple toast function
const showToast = (message: string, type: 'success' | 'error') => {
  // Remove any existing toasts first
  const existingToasts = document.querySelectorAll('[data-toast]');
  existingToasts.forEach(toast => toast.remove());
  
  const toast = document.createElement('div');
  toast.setAttribute('data-toast', 'true');
  toast.className = `fixed top-4 right-4 p-4 rounded-lg text-white z-50 ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  }`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    if (document.body.contains(toast)) {
      document.body.removeChild(toast);
    }
  }, 3000);
};

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  companyName?: string;
  phoneNumber?: string;
  address?: string;
  website?: string;
  taxId?: string;
}

export default function UserInfoCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const queryClient = useQueryClient();

  // React Query for fetching user data
  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async (): Promise<User> => {
      const response = await fetch('/api/user/me');
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      return response.json();
    },
  });

  // React Hook Form with Zod validation
  const {
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: "",
      companyName: "", 
      phoneNumber: "",
      address: "",
      website: "",
      taxId: ""
    }
  });

  // Debug: Log user data when it loads
  React.useEffect(() => {
    if (user) {
      console.log('🔍 USER DATA LOADED:', user);
      console.log('🔍 User ID:', user?.id);
      console.log('🔍 User Role:', user?.role);
    }
  }, [user]);

  // Populate form when user data loads or modal opens
  React.useEffect(() => {
    if (user && isOpen) {
      console.log('🔄 Resetting form with user data:', user);
      reset({
        name: user.name || "",
        companyName: user.companyName || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
        website: user.website || "",
        taxId: user.taxId || ""
      });
    }
  }, [user, isOpen, reset]);

  // React Query mutation for saving
  const updateMutation = useMutation({
    mutationFn: async (userData: any) => {
      if (!user) throw new Error('No user data');
      
      console.log('🔵 Making API call to:', `/api/users/${user.id}`);
      console.log('📤 Sending data:', userData);
      
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      console.log('📥 API Response status:', response.status);
      console.log('📥 API Response OK:', response.ok);
      
      if (!response.ok) {
        // Try to parse error as JSON, fallback to text
        try {
          const errorData = await response.json();
          console.log('❌ API Error response:', errorData);
          throw new Error(errorData.error || 'Failed to update profile');
        } catch (e) {
          const errorText = await response.text();
          console.log('❌ API Error text:', errorText);
          throw new Error(errorText || 'Failed to update profile');
        }
      }
      
      const result = await response.json();
      console.log('✅ API Success response:', result);
      return result;
    },
    onSuccess: () => {
      console.log('🎉 Update successful, showing toast');
      showToast('Profile updated successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['user'] });
      closeModal();
    },
    onError: (error: Error) => {
      console.log('💥 Update error:', error);
      // Show user-friendly error message
      const userMessage = error.message.includes('Unauthorized') 
        ? 'You are not authorized to update this profile'
        : error.message.includes('restricted')
        ? 'You cannot update restricted fields'
        : 'Failed to update profile. Please try again.';
      
      showToast(userMessage, 'error');
    },
  });

  const onSubmit = (data: any) => {
    console.log('🚀 FORM SUBMITTED with data:', data);
    console.log('📝 User ID:', user?.id);
    
    // Better data cleaning - only include fields with values
    const cleanedData: any = {};
    
    if (data.name && data.name.trim() !== "") cleanedData.name = data.name.trim();
    if (data.companyName && data.companyName.trim() !== "") cleanedData.companyName = data.companyName.trim();
    if (data.phoneNumber && data.phoneNumber.trim() !== "") cleanedData.phoneNumber = data.phoneNumber.trim();
    if (data.address && data.address.trim() !== "") cleanedData.address = data.address.trim();
    if (data.website && data.website.trim() !== "") cleanedData.website = data.website.trim();
    if (data.taxId && data.taxId.trim() !== "") cleanedData.taxId = data.taxId.trim();
    
    console.log('🧹 Cleaned data for API:', cleanedData);
    
    // Don't send empty request
    if (Object.keys(cleanedData).length === 0) {
      showToast('No changes to save', 'error');
      return;
    }
    
    updateMutation.mutate(cleanedData);
  };

  // Add debug logging for form values when modal is open
  React.useEffect(() => {
    if (isOpen) {
      console.log('📝 Modal opened, current form values:', watch());
      const subscription = watch((value) => {
        console.log('📝 Form values changed:', value);
      });
      return () => subscription.unsubscribe();
    }
  }, [watch, isOpen]);

  if (isLoading) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading user information...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="text-center text-gray-500">
          <p>Failed to load user data</p>
          <button 
            onClick={() => queryClient.refetchQueries({ queryKey: ['user'] })}
            className="mt-2 text-blue-600 hover:text-blue-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Full Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.name || 'Not set'}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Email address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.email}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Role
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.role}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Phone
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.phoneNumber || 'Not set'}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Company
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.companyName || 'Not set'}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Website
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.website || 'Not set'}
              </p>
            </div>

            <div className="col-span-2">
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.address || 'Not set'}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Tax ID
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.taxId || 'Not set'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3 dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          disabled={updateMutation.isPending}
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              fill=""
            />
          </svg>
          {updateMutation.isPending ? 'Updating...' : 'Edit'}
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={watch("name")}
                      onChange={(e) => setValue("name", e.target.value)}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={user.email}
                      disabled
                      className="bg-gray-100 cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label htmlFor="phoneNumber">Phone</Label>
                    <Input
                      id="phoneNumber"
                      value={watch("phoneNumber")}
                      onChange={(e) => setValue("phoneNumber", e.target.value)}
                      placeholder="Enter your phone number"
                    />
                    {errors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-500">{errors.phoneNumber.message}</p>
                    )}
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label htmlFor="companyName">Company</Label>
                    <Input
                      id="companyName"
                      value={watch("companyName")}
                      onChange={(e) => setValue("companyName", e.target.value)}
                      placeholder="Enter company name"
                    />
                    {errors.companyName && (
                      <p className="mt-1 text-sm text-red-500">{errors.companyName.message}</p>
                    )}
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={watch("website")}
                      onChange={(e) => setValue("website", e.target.value)}
                      placeholder="https://example.com"
                    />
                    {errors.website && (
                      <p className="mt-1 text-sm text-red-500">{errors.website.message}</p>
                    )}
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label htmlFor="taxId">Tax ID</Label>
                    <Input
                      id="taxId"
                      value={watch("taxId")}
                      onChange={(e) => setValue("taxId", e.target.value)}
                      placeholder="Enter tax ID"
                    />
                    {errors.taxId && (
                      <p className="mt-1 text-sm text-red-500">{errors.taxId.message}</p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={watch("address")}
                      onChange={(e) => setValue("address", e.target.value)}
                      placeholder="Enter your address"
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={closeModal}
                type="button"
                disabled={updateMutation.isPending}
              >
                Close
              </Button>
              <Button 
                size="sm" 
                type="submit"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}