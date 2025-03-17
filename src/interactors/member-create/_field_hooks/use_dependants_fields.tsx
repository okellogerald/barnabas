import { DependantInfo, DependantSchema } from '../schemas/schemas.dependants';
import { useEffect, useCallback } from 'react';
import { Form } from 'antd';
import { FieldData } from "rc-field-form/lib/interface";
import { useDependantsStore } from "../stores/store.dependants";
import { useStore } from "zustand";

/**
 * Hook to manage dependant fields and interact with the dependants store
 */
export const useDependantFields = () => {
  const [form] = Form.useForm<DependantInfo>();
  const dependantsStore = useStore(useDependantsStore);

  // Handle field changes
  const changeHandler = useCallback((changedFields: FieldData[]) => {
    // No conditional behavior for dependant fields
    console.log("Dependant fields changed:", changedFields);
  }, [form]);

  // Initialize the form
  useEffect(() => {
    // No need to do anything special here as we're starting with an empty form
  }, []);

  // Handle adding a new dependant
  const handleAddDependant = useCallback(async (values: DependantInfo) => {
    try {
      const data = DependantSchema.parse(values);
      dependantsStore.addDependant(data);
      return true;
    } catch (error) {
      console.error('Validation failed:', error);
      return false;
    }
  }, [form, dependantsStore]);

  // Handle updating an existing dependant
  const handleUpdateDependant = useCallback(async (id: string, values: DependantInfo) => {
    try {
      const data = DependantSchema.parse(values);
      dependantsStore.updateDependant(id, data);
      return true;
    } catch (error) {
      console.error('Validation failed:', error);
      return false;
    }
  }, [form, dependantsStore]);

  // Load a dependant into the form for editing
  const loadDependantForEdit = useCallback((dependant: DependantInfo) => {
    form.setFieldsValue(dependant);
  }, [form]);

  return {
    form,
    dependants: {
      items: dependantsStore.dependants,
      add: handleAddDependant,
      update: handleUpdateDependant,
      remove: dependantsStore.removeDependant,
      set: dependantsStore.setDependants,
      loadForEdit: loadDependantForEdit
    },
    onFieldsChange: changeHandler,
  };
};