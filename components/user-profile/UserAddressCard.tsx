"use client";
import React from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

// Simple toast function
const showToast = (message: string, type: 'success' | 'error') => {
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

export default function UserAddressCard() {
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

  // React Hook Form for address fields
  const {
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      address: "",
      taxId: ""
    }
  });

  // Populate form when user data loads or modal opens
  React.useEffect(() => {
    if (user && isOpen) {
      console.log('Resetting address form with user data:', user);
      reset({
        address: user.address || "",
        taxId: user.taxId || ""
      });
    }
  }, [user, isOpen, reset]);

  // React Query mutation for saving
  const updateMutation = useMutation({
    mutationFn: async (userData: any) => {
      if (!user) throw new Error('No user data');
      
      console.log('🔵 Making API call to:', `/api/users/${user.id}`);
      console.log('📤 Sending address data:', userData);
      
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      console.log('📥 API Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log('❌ API Error response:', errorData);
        throw new Error(errorData.error || 'Failed to update address');
      }
      
      const result = await response.json();
      console.log('✅ API Success response:', result);
      return result;
    },
    onSuccess: () => {
      console.log('🎉 Address update successful');
      showToast('Address updated successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['user'] });
      closeModal();
    },
    onError: (error: Error) => {
      console.log('💥 Address update error:', error);
      showToast(error.message, 'error');
    },
  });

  const onSubmit = (data: any) => {
    console.log('🚀 ADDRESS FORM SUBMITTED with data:', data);
    
    // Prepare data for API - only address and taxId
    const cleanedData: any = {};
    
    if (data.address && data.address.trim() !== "") cleanedData.address = data.address.trim();
    if (data.taxId && data.taxId.trim() !== "") cleanedData.taxId = data.taxId.trim();
    
    console.log('🧹 Cleaned address data for API:', cleanedData);
    
    // Don't send empty request
    if (Object.keys(cleanedData).length === 0) {
      showToast('No changes to save', 'error');
      return;
    }
    
    updateMutation.mutate(cleanedData);
  };

  // Parse address to show country, city/state (for display only)
  const parseAddressForDisplay = (address: string | null | undefined) => {
    // Handle null, undefined, or empty address
    if (!address || address.trim() === "") {
      return {
        country: "Not set",
        cityState: "Not set"
      };
    }
    
    // Simple parsing - you can make this smarter based on your address format
    const parts = address.split(',');
    if (parts.length >= 3) {
      return {
        country: parts[parts.length - 1].trim() || "Not set",
        cityState: parts.slice(0, -1).join(', ').trim() || "Not set"
      };
    }
    return {
      country: "Not set",
      cityState: address.trim() || "Not set"
    };
  };

  const { country, cityState } = parseAddressForDisplay(user?.address);

  if (isLoading) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading address information...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="text-center text-gray-500">Failed to load address data</div>
      </div>
    );
  }

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              Address
            </h4>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Country
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {country}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  City/State
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {cityState}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Full Address
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user.address || 'Not set'}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  TAX ID
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
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Address
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your address details.
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5">
                <div className="col-span-2">
                  <Label htmlFor="address">Full Address</Label>
                  <Input
                    id="address"
                    value={watch("address")}
                    onChange={(e) => setValue("address", e.target.value)}
                    placeholder="Enter your full address (street, city, state, country)"
                  />
                </div>

                <div>
                  <Label htmlFor="taxId">TAX ID</Label>
                  <Input
                    id="taxId"
                    value={watch("taxId")}
                    onChange={(e) => setValue("taxId", e.target.value)}
                    placeholder="Enter TAX ID"
                  />
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
    </>
  );
}