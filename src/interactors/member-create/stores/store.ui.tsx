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
 * Context information for the member create form
 */
export interface MemberCreateContext {
  fellowshipId?: string;
  fellowshipName?: string;
  sourcePage?: 'fellowship';
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
 * UI state for the member create form
 */
export interface MemberCreateUIState {
  // Current step key in the form
  currentStepKey: FormSectionKey;
  currentStepIndex: number;

  loading: boolean;
  context: MemberCreateContext;
}

/**
 * UI actions for the member create form
 */
export interface MemberCreateUIActions {
  setCurrentStepKey: (stepKey: FormSectionKey) => void;
  setCurrentStepIndex: (stepIndex: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
  getCurrentStepKey: () => FormSectionKey;
  setContext: (context: MemberCreateContext) => void;
  getStepSequence: () => FormSectionKey[];
  getSteps: () => StepDefinition[];
}

/**
 * Initial UI state
 */
const initialState: MemberCreateUIState = {
  currentStepKey: 'personal', // Start from 'personal'
  currentStepIndex: 0,
  loading: false,
  context: {},
};

export const useMemberCreateUIStore = create<MemberCreateUIState & MemberCreateUIActions>(
  (set, get) => ({
    ...initialState,

    setCurrentStepKey: (stepKey: FormSectionKey) => {
      const { currentStepKey } = get();
      const sequence = get().getStepSequence();

      const currentIndex = sequence.indexOf(currentStepKey);

      set({ currentStepKey: stepKey, currentStepIndex: currentIndex });
    },

    setCurrentStepIndex: (index: number) => {
      const sequence = get().getStepSequence();
      const stepKey = sequence[index];

      set({ currentStepKey: stepKey, currentStepIndex: index });
    },

    nextStep: () => {
      const { currentStepKey } = get();
      const sequence = get().getStepSequence();

      const currentIndex = sequence.indexOf(currentStepKey);

      if (currentIndex < sequence.length - 1) {
        set({ currentStepKey: sequence[currentIndex + 1], currentStepIndex: currentIndex + 1 });
      }
    },

    previousStep: () => {
      const { currentStepKey } = get();
      const sequence = get().getStepSequence();

      const currentIndex = sequence.indexOf(currentStepKey);

      if (currentIndex > 0) {
        set({ currentStepKey: sequence[currentIndex - 1], currentStepIndex: currentIndex - 1 });
      }
    },

    setLoading: (loading: boolean) => {
      set({ loading });
    },

    reset: () => {
      set(initialState);
    },

    getCurrentStepKey: () => {
      return get().currentStepKey;
    },

    setContext: (context: MemberCreateContext) => {
      set({ context });
    },

    getStepSequence: () => {
      const { context } = get();

      if (context.sourcePage === 'fellowship') {
        return [
          'personal',
          'church',
          'contact',
          'marital',
          'professional',
          'dependants',
          'interests'
        ];
      }

      return STEPS.map(step => step.key);
    },

    getSteps: () => {
      const sequence = get().getStepSequence();
      return sequence.map(key => STEPS.find(step => step.key === key)!).filter(Boolean);
    }
  })
);
