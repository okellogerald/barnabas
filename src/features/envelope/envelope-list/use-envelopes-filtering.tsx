import { useCallback, useEffect, useState } from 'react';
import { Form } from 'antd';
import { SortDirection } from '@/lib/query';
import { useEnvelopeFilterStore } from '@/features/envelope/envelope-list';
import { EnvelopesListSuccessState } from './use-envelopes';

/**
 * Custom hook to handle filtering and sorting logic for the EnvelopeListPage
 * 
 * This hook encapsulates all the logic related to:
 * - Tracking active filters
 * - Handling filter form submission
 * - Applying and resetting filters
 * - Managing sort order and direction
 * 
 * @param state - The envelope list state from useEnvelopesList hook
 */
export function useEnvelopeFiltering(state: any) {
  // Form instance for filter drawer
  const [form] = Form.useForm();
  
  // Get filter state from Zustand store
  const filterStore = useEnvelopeFilterStore();
  
  // Track number of active filters
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  
  // Calculate active filters count whenever filters change
  useEffect(() => {
    // Count non-empty filter values, ignoring sortBy and sortDirection
    const count = Object.entries(filterStore.filters)
      .filter(([key, value]) => 
        key !== 'sortBy' && 
        key !== 'sortDirection' && 
        value !== undefined && 
        value !== null && 
        value !== ''
      ).length;
      
    setActiveFiltersCount(count);
  }, [filterStore.filters]);

  // Handle filter application
  const handleApplyFilters = useCallback((values: any) => {
    const formattedValues = {
      ...values,
      // Ensure isAssigned is a boolean if it exists and not empty string
      isAssigned: values.isAssigned === '' ? undefined : 
                 values.isAssigned === 'true' ? true : 
                 values.isAssigned === 'false' ? false : values.isAssigned,
      // Parse number if provided
      number: values.number ? parseInt(values.number) : undefined,
    };

    if (EnvelopesListSuccessState.is(state)) {
      state.updateFilters(formattedValues);
    }
  }, [state]);

  // Handle filter reset
  const handleFilterReset = useCallback(() => {
    form.resetFields();
    if (EnvelopesListSuccessState.is(state)) {
      state.clearFilters();
    }
  }, [form, state]);

  // Get current sort field with default
  const sortBy = filterStore.filters.sortBy || 'envelopeNumber';
  
  // Get current sort direction with default
  const sortDirection = filterStore.filters.sortDirection || SortDirection.ASC;

  // Handle sorting change
  const handleSortChange = useCallback((field: string) => {
    // Keep the same direction for a new field
    filterStore.setFilters({
      ...filterStore.filters,
      sortBy: field,
      sortDirection
    });
  }, [filterStore, sortDirection]);
  
  // Toggle sort direction
  const toggleSortDirection = useCallback(() => {
    const newDirection = sortDirection === SortDirection.ASC 
      ? SortDirection.DESC 
      : SortDirection.ASC;
    
    filterStore.setFilters({
      ...filterStore.filters,
      sortDirection: newDirection
    });
  }, [filterStore, sortDirection]);

  return {
    // Form instance
    form,
    
    // Filter states
    activeFiltersCount,
    
    // Filter handlers
    handleApplyFilters,
    handleFilterReset,
    
    // Sorting
    sorting: {
      sortBy,
      sortDirection,
      handleSortChange,
      toggleSortDirection
    }
  };
}