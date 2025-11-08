"use client";
import React from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

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
  designation?: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  designation: string;
  phoneNumber: string;
  address: string;
}

export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const queryClient = useQueryClient();

  const user: User = {
    id: 0,
    name: "Vendor User",
    email: "vendor@example.com", 
    role: "VENDOR",
    companyName: "Vendor Company",
    phoneNumber: "+1234567890",
    address: "Vendor Address",
    website: "https://vendor.com",
    taxId: "TAX123",
    designation: "Vendor"
  };

  const isLoading = false;

  // React Hook Form for editing
  const {
    handleSubmit,
    formState: { errors },
    reset,
    register,
  } = useForm<FormData>();

  // React Query mutation for saving
  const updateMutation = useMutation({
    mutationFn: async (userData: any) => {
      if (!user) throw new Error('No user data');
      
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update profile');
        } catch (e) {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to update profile');
        }
      }
      
      const result = await response.json();
      return result;
    },
    onSuccess: () => {
      showToast('Profile updated successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['user'] });
      closeModal();
    },
    onError: (error: Error) => {
      showToast(error.message, 'error');
    },
  });

  const onSubmit = (data: FormData) => {
    // Combine first and last name
    const cleanedData: any = {};
    
    if (data.firstName || data.lastName) {
      cleanedData.name = `${data.firstName || ''} ${data.lastName || ''}`.trim();
    }
    if (data.designation) cleanedData.designation = data.designation;
    if (data.phoneNumber) cleanedData.phoneNumber = data.phoneNumber;
    if (data.address) cleanedData.address = data.address;
    
    if (Object.keys(cleanedData).length === 0) {
      showToast('No changes to save', 'error');
      return;
    }
    
    updateMutation.mutate(cleanedData);
  };

  const customRegister = (name: keyof FormData) => {
    const { ref, ...rest } = register(name);
    
    const { min, ...filteredRest } = rest as any;
    
    return {
      ...filteredRest,
      ref,
    };
  };

  const firstName = user.name?.split(' ')[0] || 'User';
  const lastName = user.name?.split(' ').slice(1).join(' ') || '';

  return (
    <>
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
                  <div className="col-span-2 lg:col-span-1">
                    <Label>First Name</Label>
                    <Input 
                      {...customRegister("firstName")}
                      defaultValue={firstName}
                      placeholder="Enter first name"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Last Name</Label>
                    <Input 
                      {...customRegister("lastName")}
                      defaultValue={lastName}
                      placeholder="Enter last name"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Email Address</Label>
                    <Input 
                      value={user.email}
                      disabled
                      className="bg-gray-100 cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Phone</Label>
                    <Input 
                      {...customRegister("phoneNumber")}
                      defaultValue={user.phoneNumber || ""}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Designation</Label>
                    <Input 
                      {...customRegister("designation")}
                      defaultValue={user.designation || ""}
                      placeholder="Enter your designation"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Address</Label>
                    <Input 
                      {...customRegister("address")}
                      defaultValue={user.address || ""}
                      placeholder="Enter your address"
                    />
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
    </>
  );
}