import { create } from 'zustand';
import { FormSectionKey, StepDefinition } from '../types';

import {
  UserOutlined,
  HeartOutlined,
  PhoneOutlined,
  BankOutlined,
  BookOutlined,
  TeamOutlined,
  StarOutlined
} from '@ant-design/icons';

/**
 * Step definitions for the member creation process
 */
export const STEPS: StepDefinition[] = [
  {
    title: 'Personal',
    description: 'Personal Information',
    icon: <UserOutlined />,
    key: 'personal',
  },
  {
    title: 'Marital',
    description: 'Marital Status',
    icon: <HeartOutlined />,
    key: 'marital',
  },
  {
    title: 'Contact',
    description: 'Contact Information',
    icon: <PhoneOutlined />,
    key: 'contact',
  },
  {
    title: 'Church',
    description: 'Church Information',
    icon: <BankOutlined />,
    key: 'church',
  },
  {
    title: 'Professional',
    description: 'Professional Information',
    icon: <BookOutlined />,
    key: 'professional',
  },
  {
    title: 'Dependants',
    description: 'Dependants Information',
    icon: <TeamOutlined />,
    key: 'dependants',
  },
  {
    title: 'Interests',
    description: 'Volunteer Interests',
    icon: <StarOutlined />,
    key: 'interests',
  }
];

/**
 * Interface for the UI store state
 */
interface MemberEditUIState {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  reset: () => void;
  getCurrentStepKey: () => FormSectionKey;
}

/**
 * Store for managing the member edit UI state
 * Handles step navigation and provides access to step information
 */
export const useMemberEditUIStore = create<MemberEditUIState>((set, get) => ({
  // Current step index
  currentStep: 0,

  // Set the current step
  setCurrentStep: (step: number) => set({ currentStep: step }),

  // Move to the next step if possible
  nextStep: () => set((state) => ({
    currentStep: Math.min(state.currentStep + 1, STEPS.length - 1)
  })),

  // Move to the previous step if possible
  previousStep: () => set((state) => ({
    currentStep: Math.max(state.currentStep - 1, 0)
  })),

  // Reset the step index to the first step
  reset: () => set({ currentStep: 0 }),

  // Get the key of the current step
  getCurrentStepKey: () => {
    const currentStep = get().currentStep;
    return STEPS[currentStep].key;
  }
}));