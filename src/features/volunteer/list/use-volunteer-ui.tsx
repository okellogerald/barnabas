import { useState, useCallback } from 'react';

/**
 * Custom hook to manage UI state for Volunteer Opportunity pages
 * 
 * This hook centralizes all modal/drawer visibility management,
 * ensuring the page components remain focused on rendering
 * rather than managing UI state.
 */
export function useVolunteerPageUI() {
  // Modal and drawer visibility states
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isFilterDrawerOpen, setFilterDrawerOpen] = useState(false);
  
  // Create memoized handlers to prevent unnecessary re-renders
  const openCreateModal = useCallback(() => setCreateModalOpen(true), []);
  const closeCreateModal = useCallback(() => setCreateModalOpen(false), []);
  
  const openEditModal = useCallback(() => setEditModalOpen(true), []);
  const closeEditModal = useCallback(() => setEditModalOpen(false), []);
  
  const openDeleteModal = useCallback(() => setDeleteModalOpen(true), []);
  const closeDeleteModal = useCallback(() => setDeleteModalOpen(false), []);
  
  const openFilterDrawer = useCallback(() => setFilterDrawerOpen(true), []);
  const closeFilterDrawer = useCallback(() => setFilterDrawerOpen(false), []);
  
  return {
    // Modal/drawer visibility states
    isCreateModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    isFilterDrawerOpen,
    
    // Modal/drawer control methods
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
    openFilterDrawer,
    closeFilterDrawer,
  };
}