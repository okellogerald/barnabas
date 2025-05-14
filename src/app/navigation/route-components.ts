import { lazy } from 'react';

// Auth Pages
export const LoginPage = lazy(() => import('@/pages/auth/login.page'));
export const DashboardPage = lazy(() => import('@/pages/dashboard/dashboard.page'));

// Member Pages
export const MembersPage = lazy(() => import('@/pages/member/member-list.page'));
export const MemberCreatePage = lazy(() => import('@/pages/member/member-create.page'));
export const MemberEditPage = lazy(() => import('@/pages/member/member-edit.page'));
export const MemberDetailsPage = lazy(() => import('@/pages/member/member-details.page'));

// Fellowship Pages
export const FellowshipListPage = lazy(() => import('@/pages/fellowship/fellowship-list.page'));
export const FellowshipDetailsPage = lazy(() => import('@/pages/fellowship/fellowship-details.page'));
export const FellowshipCreatePage = lazy(() => import('@/pages/fellowship/fellowship-create.page'));
export const FellowshipEditPage = lazy(() => import('@/pages/fellowship/fellowship-edit.page'));

// User Pages
export const UserListPage = lazy(() => import('@/pages/user/user-list.page'));
export const UserCreatePage = lazy(() => import('@/pages/user/user-create.page'));
export const UserDetailsPage = lazy(() => import('@/pages/user/user-details.page'));
export const UserEditPage = lazy(() => import('@/pages/user/user-edit.page'));

// Volunteer Pages
export const VolunteerListPage = lazy(() => import('@/pages/volunteer/volunteer-list.page'));
export const VolunteerDetailsPage = lazy(() => import('@/pages/volunteer/volunteer-details.page'));

// Envelope Pages
export const EnvelopeListPage = lazy(() => import('@/pages/envelope/envelope-list.page'));
export const EnvelopeDetailsPage = lazy(() => import('@/pages/envelope/envelope-details.page'));
export const EnvelopeAssignPage = lazy(() => import('@/pages/envelope/envelope-assign.page'));

// Role Pages
export const RoleListPage = lazy(() => import('@/pages/role/role-list.page'));
export const RoleDetailsPage = lazy(() => import('@/pages/role/role-details.page'));

// Error Pages
export const NotFoundPage = lazy(() => import('@/pages/errors/not-found.page'));
