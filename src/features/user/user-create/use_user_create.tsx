import { useState, useEffect } from 'react';
import { Form } from 'antd';
import { CreateUserDTO } from '@/data/user';
import { Navigation } from '@/app';
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from '@/lib/query';
import { ChurchManager } from '@/managers/church/church.manager';
import { RoleQueries } from '@/features/role';
import { UserQueries } from '../user.queries';
import { notifyUtils } from '@/utilities';

/**
 * Form values interface for user creation
 */
export interface UserFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  roleId: string;
  isActive: boolean;
}

/**
 * Hook for managing user creation
 * 
 * Provides form handling, submission, validation, and navigation for creating a new user
 */
export const useUserCreate = () => {
  // Form instance
  const [form] = Form.useForm<UserFormValues>();
  
  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Use mutation hook for creating user
  const createMutation = UserQueries.useCreate();
  
  // Fetch available roles for the dropdown
  const rolesQuery = RoleQueries.useList();
  
  // Fetch current church for contextual information
  const churchQuery = useQuery({
    queryKey: QueryKeys.Churches.current(),
    queryFn: async () => ChurchManager.instance.getUserChurch()
  });
  
  // Handle form submission
  const handleSubmit = async (values: UserFormValues) => {
    try {
      // Make sure passwords match
      if (values.password !== values.confirmPassword) {
        notifyUtils.error('Passwords do not match');
        return;
      }
      
      setIsSubmitting(true);
      
      // Prepare data for API
      const createDto: CreateUserDTO = {
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        phoneNumber: values.phoneNumber.trim(),
        roleId: values.roleId,
        // isActive: values.isActive,
        // churchId: AuthManager.instance.getUser()?.churchId ?? "",
      };
      
      // Call API to create user
      await createMutation.mutateAsync(createDto);
      
      // Show success message
      notifyUtils.success('User created successfully');
      
      // Navigate to user list
      Navigation.Users.toList();
    } catch (error) {
      console.error('Error creating user:', error);
      notifyUtils.error('Failed to create user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle form cancellation
  const handleCancel = () => {
    Navigation.Users.toList();
  };
  
  // Reset form to initial values
  const handleReset = () => {
    form.resetFields();
  };
  
  // Form initialization
  useEffect(() => {
    form.setFieldsValue({
      isActive: true,
      // Set other default values as needed
    });
  }, [form]);
  
  return {
    form,
    isSubmitting,
    rolesData: {
      roles: rolesQuery.data?.roles || [],
      loading: rolesQuery.isLoading
    },
    churchData: {
      church: churchQuery.data,
      loading: churchQuery.isLoading
    },
    handleSubmit,
    handleCancel,
    handleReset
  };
};