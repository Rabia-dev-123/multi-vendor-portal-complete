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

// Simple toast function (same as your other component)
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
      
      console.log('🔵 UserMetaCard - Making API call to:', `/api/users/${user.id}`);
      console.log('📤 UserMetaCard - Sending data:', userData);
      
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      console.log('📥 UserMetaCard - API Response status:', response.status);
      
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
      console.log('✅ UserMetaCard - API Success response:', result);
      return result;
    },
    onSuccess: () => {
      console.log('🎉 UserMetaCard - Update successful');
      showToast('Profile updated successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['user'] });
      closeModal();
    },
    onError: (error: Error) => {
      console.log('💥 UserMetaCard - Update error:', error);
      showToast(error.message, 'error');
    },
  });

  // Populate form when user data loads or modal opens
  React.useEffect(() => {
    if (user && isOpen) {
      console.log('🔄 UserMetaCard - Resetting form with user data:', user);
      reset({
        firstName: user.name?.split(' ')[0] || "",
        lastName: user.name?.split(' ').slice(1).join(' ') || "",
        designation: user.designation || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
      });
    }
  }, [user, isOpen, reset]);

  const onSubmit = (data: FormData) => {
    console.log('🚀 UserMetaCard - FORM SUBMITTED with data:', data);
    
    // Combine first and last name
    const cleanedData: any = {};
    
    if (data.firstName || data.lastName) {
      cleanedData.name = `${data.firstName || ''} ${data.lastName || ''}`.trim();
    }
    if (data.designation) cleanedData.designation = data.designation;
    if (data.phoneNumber) cleanedData.phoneNumber = data.phoneNumber;
    if (data.address) cleanedData.address = data.address;
    
    console.log('🧹 UserMetaCard - Cleaned data for API:', cleanedData);
    
    if (Object.keys(cleanedData).length === 0) {
      showToast('No changes to save', 'error');
      return;
    }
    
    updateMutation.mutate(cleanedData);
  };

  // Custom register function to filter out incompatible props
  const customRegister = (name: keyof FormData) => {
    const { ref, ...rest } = register(name);
    
    // Remove min property if it exists and is a number
    const { min, ...filteredRest } = rest as any;
    
    return {
      ...filteredRest,
      ref,
    };
  };

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

  // Split name for display
  const firstName = user.name?.split(' ')[0] || 'User';
  const lastName = user.name?.split(' ').slice(1).join(' ') || '';

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <Image
                width={80}
                height={80}
                src="/images/user/owner.jpg"
                alt="user"
              />
            </div>
            <div className="order-3 xl:order-2">
              {/* USING REAL USER DATA */}
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {user.name || 'Not set'}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.designation || 'Not set'}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.address || 'Not set'}
                </p>
              </div>
            </div>
            <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
              {/* Social links - you can make these dynamic too if stored in database */}
              <a
                target="_blank"
                rel="noreferrer"
                href="https://www.facebook.com/PimjoHQ"
                className="flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3 dark:hover:text-gray-200"
              >
                <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.6666 11.2503H13.7499L14.5833 7.91699H11.6666V6.25033C11.6666 5.39251 11.6666 4.58366 13.3333 4.58366H14.5833V1.78374C14.3118 1.7477 13.2858 1.66699 12.2023 1.66699C9.94025 1.66699 8.33325 3.04771 8.33325 5.58342V7.91699H5.83325V11.2503H8.33325V18.3337H11.6666V11.2503Z" fill=""/>
                </svg>
              </a>

              <a
                href="https://x.com/PimjoHQ"
                target="_blank"
                rel="noreferrer"
                className="flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3 dark:hover:text-gray-200"
              >
                <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.1708 1.875H17.9274L11.9049 8.75833L18.9899 18.125H13.4424L9.09742 12.4442L4.12578 18.125H1.36745L7.80912 10.7625L1.01245 1.875H6.70078L10.6283 7.0675L15.1708 1.875ZM14.2033 16.475H15.7308L5.87078 3.43833H4.23162L14.2033 16.475Z" fill=""/>
                </svg>
              </a>

              <a
                href="https://www.linkedin.com/company/pimjo"
                target="_blank"
                rel="noreferrer"
                className="flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3 dark:hover:text-gray-200"
              >
                <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5.78381 4.16645C5.78351 4.84504 5.37181 5.45569 4.74286 5.71045C4.11391 5.96521 3.39331 5.81321 2.92083 5.32613C2.44836 4.83904 2.31837 4.11413 2.59216 3.49323C2.86596 2.87233 3.48886 2.47942 4.16715 2.49978C5.06804 2.52682 5.78422 3.26515 5.78381 4.16645ZM5.83381 7.06645H2.50048V17.4998H5.83381V7.06645ZM11.1005 7.06645H7.78381V17.4998H11.0672V12.0248C11.0672 8.97475 15.0422 8.69142 15.0422 12.0248V17.4998H18.3338V10.8914C18.3338 5.74978 12.4505 5.94145 11.0672 8.46642L11.1005 7.06645Z" fill=""/>
                </svg>
              </a>

              <a
                href="https://instagram.com/PimjoHQ"
                target="_blank"
                rel="noreferrer"
                className="flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3 dark:hover:text-gray-200"
              >
                <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.8567 1.66699C11.7946 1.66854 12.2698 1.67351 12.6805 1.68573L12.8422 1.69102C13.0291 1.69766 13.2134 1.70599 13.4357 1.71641C14.3224 1.75738 14.9273 1.89766 15.4586 2.10391C16.0078 2.31572 16.4717 2.60183 16.9349 3.06503C17.3974 3.52822 17.6836 3.99349 17.8961 4.54141C18.1016 5.07197 18.2419 5.67753 18.2836 6.56433C18.2935 6.78655 18.3015 6.97088 18.3081 7.15775L18.3133 7.31949C18.3255 7.73011 18.3311 8.20543 18.3328 9.1433L18.3335 9.76463C18.3336 9.84055 18.3336 9.91888 18.3336 9.99972L18.3335 10.2348L18.333 10.8562C18.3314 11.794 18.3265 12.2694 18.3142 12.68L18.3089 12.8417C18.3023 13.0286 18.294 13.213 18.2836 13.4351C18.2426 14.322 18.1016 14.9268 17.8961 15.458C16.6842 16.0074 16.3974 16.4713 15.9349 16.9345C15.4717 17.397 15.0057 17.6831 14.4586 17.8955C13.9273 18.1011 13.3224 18.2414 12.4357 18.2831C12.2134 18.293 12.0291 18.3011 11.8422 18.3076L11.6805 18.3128C11.2698 18.3251 10.7946 18.3306 9.8567 18.3324L9.2353 18.333C9.1594 18.333 9.0811 18.333 9.0002 18.333H8.7652L8.1438 18.3325C7.2059 18.331 6.7306 18.326 6.3200 18.3137L6.1582 18.3085C5.9714 18.3018 5.78703 18.2935 5.5648 18.2831C4.6780 18.2421 4.0738 18.1011 3.5419 17.8955C2.9933 17.6838 2.5287 17.397 2.0655 16.9345C1.6023 16.4713 1.3169 16.0053 1.1044 15.458C0.8982 14.9268 0.7586 14.322 0.7169 13.4351C0.7070 13.213 0.6989 13.0286 0.6924 12.8417L0.6871 12.68C0.6749 12.2694 0.6694 11.794 0.6676 10.8562L0.6675 9.1433C0.6690 8.20543 0.6740 7.73011 0.6862 7.31949L0.6915 7.15775C0.6981 6.97088 0.7064 6.78655 0.7169 6.56433C0.7579 5.67683 0.8982 5.07266 1.1044 4.54141C1.3162 3.9928 1.6023 3.52822 2.0655 3.06503C2.5287 2.60183 2.9940 2.31641 3.5419 2.10391C4.0732 1.89766 4.6773 1.75808 5.5648 1.71641C5.7870 1.70652 5.9714 1.69844 6.1582 1.6919L6.3200 1.68666C6.7306 1.67446 7.2059 1.6689 8.1438 1.6671L9.8567 1.66699ZM9.0002 5.83308C6.6978 5.83308 4.8336 7.69935 4.8336 9.99972C4.8336 12.3021 6.6998 14.1664 9.0002 14.1664C11.3027 14.1664 13.1669 12.3001 13.1669 9.99972C13.1669 7.69732 11.3006 5.83308 9.0002 5.83308ZM9.0002 7.49974C10.381 7.49974 11.5002 8.61863 11.5002 9.99972C11.5002 11.3805 10.3813 12.4997 9.0002 12.4997C7.6195 12.4997 6.5002 11.3809 6.5002 9.99972C6.5002 8.61897 7.6191 7.49974 9.0002 7.49974ZM13.3752 4.58308C12.8008 4.58308 12.3336 5.04967 12.3336 5.62403C12.3336 6.19841 12.8002 6.66572 13.3752 6.66572C13.9496 6.66572 14.4169 6.19913 14.4169 5.62403C14.4169 5.04967 13.9488 4.58236 13.3752 4.58308Z" fill=""/>
                </svg>
              </a>
            </div>
          </div>
          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3 dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
            disabled={updateMutation.isPending}
          >
            <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z" fill=""/>
            </svg>
            {updateMutation.isPending ? 'Updating...' : 'Edit'}
          </button>
        </div>
      </div>

      {/* EDIT MODAL */}
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