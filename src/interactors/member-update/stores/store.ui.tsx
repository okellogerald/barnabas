import { create } from "zustand";
import { FormSectionKey, StepDefinition } from "../types";
import {
  BankOutlined,
  HeartOutlined,
  HomeOutlined,
  PhoneOutlined,
  StarOutlined,
  TeamOutlined,
  UserOutlined
} from "@ant-design/icons";

/**
 * UI state for the member create form
 */
export interface MemberCreateUIState {
  // Current step in the form
  currentStep: number;

  loading: boolean
}

/**
 * UI actions for the member create form
 */
export interface MemberCreateUIActions {
  // Set the current step
  setCurrentStep: (step: number) => void;

  // Navigate to the next step
  nextStep: () => void;

  // Navigate to the previous step
  previousStep: () => void;

  // Set the loading state
  setLoading: (loading: boolean) => void;

  // Reset the UI state
  reset: () => void;

  // Get the current step key
  getCurrentStepKey: () => FormSectionKey;
}

/**
 * Step definitions for the member create form
 */
export const STEPS: StepDefinition[] = [
  {
    title: 'Personal',
    description: 'Basic details',
    icon: <UserOutlined />,
    key: 'personal',
  },
  {
    title: 'Contact',
    description: 'Contact details',
    icon: <PhoneOutlined />,
    key: 'contact',
  },
  {
    title: 'Marital',
    description: 'Marital status',
    icon: <HeartOutlined />,
    key: 'marital',
  },
  {
    title: 'Church',
    description: 'Church information',
    icon: <HomeOutlined />,
    key: 'church',
  },
  {
    title: 'Professional',
    description: 'Work & education',
    icon: <BankOutlined />,
    key: 'professional',
  },
  {
    title: 'Dependants',
    description: 'Family members',
    icon: <TeamOutlined />,
    key: 'dependants',
  },
  {
    title: 'Interests',
    description: 'Volunteer roles',
    icon: <StarOutlined />,
    key: 'interests',
  },
];

/**
 * Initial UI state
 */
const initialState: MemberCreateUIState = {
  currentStep: 0,
  loading: false,
};

/**
 * Create the UI store
 */
export const useMemberCreateUIStore = create<MemberCreateUIState & MemberCreateUIActions>(
  (set, get) => ({
    ...initialState,

    setCurrentStep: (step: number) => {
      set({ currentStep: step });
    },

    nextStep: () => {
      const { currentStep } = get();
      if (currentStep < STEPS.length - 1) {
        set({ currentStep: currentStep + 1 });
      }
    },

    previousStep: () => {
      const { currentStep } = get();
      if (currentStep > 0) {
        set({ currentStep: currentStep - 1 });
      }
    },

    setLoading: (loading: boolean) => {
      set({ loading });
    },

    reset: () => {
      set(initialState);
    },

    getCurrentStepKey: () => {
      const { currentStep } = get();
      return STEPS[currentStep].key;
    },
  })
);