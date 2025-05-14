import { useState } from 'react';

/**
 * Custom hook to manage UI state for the EnvelopeListPage
 * 
 * This hook centralizes all modal/drawer visibility management,
 * ensuring the page component remains focused on rendering
 * rather than managing UI state.
 */
export function useEnvelopePageUI() {
  // Modal and drawer visibility states
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isFilterDrawerOpen, setFilterDrawerOpen] = useState(false);
  
  return {
    // Modal/drawer visibility states
    isCreateModalOpen,
    isDeleteModalOpen,
    isFilterDrawerOpen,
    
    // Modal/drawer control methods
    openCreateModal: () => setCreateModalOpen(true),
    closeCreateModal: () => setCreateModalOpen(false),
    openDeleteModal: () => setDeleteModalOpen(true),
    closeDeleteModal: () => setDeleteModalOpen(false),
    openFilterDrawer: () => setFilterDrawerOpen(true),
    closeFilterDrawer: () => setFilterDrawerOpen(false),
  };
}