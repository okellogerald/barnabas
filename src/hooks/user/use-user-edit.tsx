import { useState, useEffect } from 'react';
import { Form, message } from 'antd';
import { UpdateUserDTO } from '@/data/user';
import { Navigation } from '@/app';
import { useParams } from 'react-router-dom';
import { UserQueries } from '@/data/user/user.queries';
import { RoleQueries } from '@/data/role/role.queries';

/**
 * Form values interface for user editing
 */
export interface UserEditFormValues {
  name: string;
  email: string;
  phoneNumber?: string;
  roleId: string;
  isActive: boolean;
  password?: string;
  confirmPassword?: string;
}

/**
 * Hook for managing user editing
 * 
 * Provides form handling, submission, validation, and navigation for editing a user
 */
export const useUserEdit = () => {
  // Get user ID from URL params
  const { id: userId = '' } = useParams<{ id: string }>();

  // Form instance
  const [form] = Form.useForm<UserEditFormValues>();

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  // User data query
  const userQuery = UserQueries.useDetail(userId);

  // Update mutation
  const updateMutation = UserQueries.useUpdate();

  // Fetch available roles for dropdown
  const rolesQuery = RoleQueries.useList();

  // Initialize form with user data when loaded
  useEffect(() => {
    if (userQuery.data) {
      const user = userQuery.data;

      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber || undefined,
        roleId: user.roleId,
        isActive: user.isActive
      });
    }
  }, [form, userQuery.data]);

  // Handle form submission
  const handleSubmit = async (values: UserEditFormValues) => {
    try {
      // Validate password if being changed
      if (changePassword) {
        if (!values.password) {
          message.error('Password is required');
          return;
        }

        if (values.password !== values.confirmPassword) {
          message.error('Passwords do not match');
          return;
        }
      }

      setIsSubmitting(true);

      // Prepare data for API
      const updateDto: UpdateUserDTO = {
        name: values.name.trim(),
        // email: values.email.trim(),
        phoneNumber: values.phoneNumber?.trim() || null,
        roleId: values.roleId,
        // isActive: values.isActive
      };

      // Include password only if being changed
      if (changePassword && values.password) {
        updateDto.password = values.password;
      }

      // Call API to update user
      await updateMutation.mutateAsync({
        id: userId,
        data: updateDto
      });

      // Show success message
      message.success('User updated successfully');

      // Navigate to user details
      Navigation.Users.toDetails(userId);
    } catch (error) {
      console.error('Error updating user:', error);
      message.error('Failed to update user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    Navigation.Users.toDetails(userId);
  };

  // Reset form to original values
  const handleReset = () => {
    if (userQuery.data) {
      const user = userQuery.data;

      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber || undefined,
        roleId: user.roleId,
        isActive: user.isActive,
        password: undefined,
        confirmPassword: undefined
      });

      setChangePassword(false);
    }
  };

  // Toggle password change option
  const togglePasswordChange = (showPasswordFields: boolean) => {
    setChangePassword(showPasswordFields);

    if (!showPasswordFields) {
      form.setFieldsValue({
        password: undefined,
        confirmPassword: undefined
      });
    }
  };

  return {
    form,
    userId,
    userData: {
      user: userQuery.data,
      loading: userQuery.isLoading,
      error: userQuery.isError
    },
    rolesData: {
      roles: rolesQuery.data?.roles || [],
      loading: rolesQuery.isLoading
    },
    isSubmitting,
    changePassword,
    togglePasswordChange,
    handleSubmit,
    handleCancel,
    handleReset
  };
};