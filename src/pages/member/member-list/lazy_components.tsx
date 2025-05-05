import { createLazyComponent } from '@/components';

// Lazy load the filter components
export const LazyMemberFilters = createLazyComponent(
    () => import('./member_filters').then(module => ({ default: module.MemberFilters })),
    'MemberFilters'
);

export const LazyFilterToggle = createLazyComponent(
    () => import('./member_filters').then(module => ({ default: module.FilterToggle })),
    'FilterToggle'
);

export const LazyMemberSorting = createLazyComponent(
    () => import('./member_sort').then(module => ({ default: module.MemberSorting })),
    'MemberSorting'
);