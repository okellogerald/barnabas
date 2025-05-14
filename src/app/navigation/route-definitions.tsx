import React, { Suspense } from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import AppLayout from '@/components/layouts/app.layout';
import { ROUTES } from './routes.constants';
import { AuthenticationManager } from '@/data/authentication/authentication.manager';
import { MemberDetailsRouteLoader, MemberEditRouteLoader } from '@/hooks/member/loaders';

// Import all lazy-loaded components
import {
  LoginPage,
  DashboardPage,
  MembersPage,
  MemberCreatePage,
  MemberEditPage,
  MemberDetailsPage,
  FellowshipListPage,
  FellowshipDetailsPage,
  FellowshipCreatePage,
  FellowshipEditPage,
  UserListPage,
  UserCreatePage,
  UserDetailsPage,
  UserEditPage,
  VolunteerListPage,
  VolunteerDetailsPage,
  EnvelopeListPage,
  EnvelopeDetailsPage,
  EnvelopeAssignPage,
  RoleListPage,
  RoleDetailsPage,
  NotFoundPage
} from './route-components';
import ProtectedRoute from './route-guard';

// Loading component for suspense fallback
const PageLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh'
  }}>
    <div>Loading...</div>
  </div>
);

/**
 * Authentication check for protected routes
 * Used in the ProtectedRoute component
 */
export const checkAuth = () => {
  return AuthenticationManager.instance.isAuthenticated;
};

/**
 * Application Routes component
 * Defines all routes in the application using React Router v6
 */
const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />

        {/* Protected routes with layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />

          {/* Members routes */}
          <Route path={ROUTES.MEMBERS.LIST} element={<MembersPage />} />
          <Route path={ROUTES.MEMBERS.CREATE} element={<MemberCreatePage />} />
          <Route path={ROUTES.MEMBERS.EDIT} loader={MemberEditRouteLoader} element={<MemberEditPage />} />
          <Route path={ROUTES.MEMBERS.DETAILS} loader={MemberDetailsRouteLoader} element={<MemberDetailsPage />} />

          {/* Fellowships routes */}
          <Route path={ROUTES.FELLOWSHIPS.LIST} element={<FellowshipListPage />} />
          <Route path={ROUTES.FELLOWSHIPS.DETAILS} element={<FellowshipDetailsPage />} />
          <Route path={ROUTES.FELLOWSHIPS.CREATE} element={<FellowshipCreatePage />} />
          <Route path={ROUTES.FELLOWSHIPS.EDIT} element={<FellowshipEditPage />} />

          <Route path={ROUTES.ROLES.LIST} element={<RoleListPage />} />
          <Route path={ROUTES.ROLES.DETAILS} element={<RoleDetailsPage />} />

          <Route path={ROUTES.USERS.LIST} element={<UserListPage />} />
          <Route path={ROUTES.USERS.CREATE} element={<UserCreatePage />} />
          <Route path={ROUTES.USERS.EDIT} element={<UserEditPage />} />
          <Route path={ROUTES.USERS.DETAILS} element={<UserDetailsPage />} />

          <Route path={ROUTES.ENVELOPES.LIST} element={<EnvelopeListPage />} />
          <Route path={ROUTES.ENVELOPES.DETAILS} element={<EnvelopeDetailsPage />} />
          <Route path={ROUTES.ENVELOPES.ASSIGN} element={<EnvelopeAssignPage />} />

          <Route path={ROUTES.OPPORTUNITIES.LIST} element={<VolunteerListPage />} />
          <Route path={ROUTES.OPPORTUNITIES.DETAILS} element={<VolunteerDetailsPage />} />

          {/* 404 catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
