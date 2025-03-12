import React, { lazy, Suspense } from 'react';
import { Navigate, Routes, Route, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/app.layout';
import { ROUTES } from './constants';
import { AuthManager } from '@/managers/auth/auth.manager';
import ProtectedRoute from './protected_route';

// Lazy-loaded components
const LoginPage = lazy(() => import('@/pages/auth/login.page'));
const DashboardPage = lazy(() => import('@/pages/dashboard/dashboard.page'));
const MembersPage = lazy(() => import('@/pages/member/member_list.page'));
// const MemberDetailsPage = lazy(() => import('@/pages/members/member-details.page'));
// const MemberCreatePage = lazy(() => import('@/pages/members/member-create.page'));
// const MemberEditPage = lazy(() => import('@/pages/members/member-edit.page'));
// const FellowshipsPage = lazy(() => import('@/pages/fellowships/fellowships.page'));
// const FellowshipDetailsPage = lazy(() => import('@/pages/fellowships/fellowship-details.page'));
// const FellowshipCreatePage = lazy(() => import('@/pages/fellowships/fellowship-create.page'));
// const FellowshipEditPage = lazy(() => import('@/pages/fellowships/fellowship-edit.page'));
// const OpportunitiesPage = lazy(() => import('@/pages/opportunities/opportunities.page'));
// const OpportunityDetailsPage = lazy(() => import('@/pages/opportunities/opportunity-details.page'));
// const OpportunityCreatePage = lazy(() => import('@/pages/opportunities/opportunity-create.page'));
// const OpportunityEditPage = lazy(() => import('@/pages/opportunities/opportunity-edit.page'));
// const RolesPage = lazy(() => import('@/pages/roles/roles.page'));
const NotFoundPage = lazy(() => import('@/pages/errors/not_found.page'));

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
  return AuthManager.instance.isAuthenticated;
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

          {/* 404 catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

/**
 * Hook for convenient navigation using constants
 */
export const useAppNavigation = () => {
  const navigate = useNavigate();

  return {
    toDashboard: () => navigate(ROUTES.DASHBOARD),
    toLogin: () => navigate(ROUTES.LOGIN),

    Members: {
      toList: () => navigate(ROUTES.MEMBERS.LIST),
      toDetails: (id: string) => navigate(ROUTES.MEMBERS.DETAILS.replace(':id', id)),
      toCreate: () => navigate(ROUTES.MEMBERS.CREATE),
      toEdit: (id: string) => navigate(ROUTES.MEMBERS.EDIT.replace(':id', id)),
    },

    Fellowships: {
      toList: () => navigate(ROUTES.FELLOWSHIPS.LIST),
      toDetails: (id: string) => navigate(ROUTES.FELLOWSHIPS.DETAILS.replace(':id', id)),
      toCreate: () => navigate(ROUTES.FELLOWSHIPS.CREATE),
      toEdit: (id: string) => navigate(ROUTES.FELLOWSHIPS.EDIT.replace(':id', id)),
    },

    Opportunities: {
      toList: () => navigate(ROUTES.OPPORTUNITIES.LIST),
      toDetails: (id: string) => navigate(ROUTES.OPPORTUNITIES.DETAILS.replace(':id', id)),
      toCreate: () => navigate(ROUTES.OPPORTUNITIES.CREATE),
      toEdit: (id: string) => navigate(ROUTES.OPPORTUNITIES.EDIT.replace(':id', id)),
    },

    Roles: {
      toList: () => navigate(ROUTES.ROLES.LIST),
    },
  };
};

export default AppRoutes;

{/* Members routes
          <Route path={ROUTES.MEMBERS.LIST} element={<MembersPage />} />
          <Route path={ROUTES.MEMBERS.CREATE} element={<MemberCreatePage />} />
          <Route path={ROUTES.MEMBERS.DETAILS} element={<MemberDetailsPage />} />
          <Route path={ROUTES.MEMBERS.EDIT} element={<MemberEditPage />} />

  //  {/* Fellowships routes */}
//  <Route path={ROUTES.FELLOWSHIPS.LIST} element={<FellowshipsPage />} />
//  <Route path={ROUTES.FELLOWSHIPS.CREATE} element={<FellowshipCreatePage />} />
//  <Route path={ROUTES.FELLOWSHIPS.DETAILS} element={<FellowshipDetailsPage />} />
//  <Route path={ROUTES.FELLOWSHIPS.EDIT} element={<FellowshipEditPage />} />

//  {/* Opportunities routes */}
//  <Route path={ROUTES.OPPORTUNITIES.LIST} element={<OpportunitiesPage />} />
//  <Route path={ROUTES.OPPORTUNITIES.CREATE} element={<OpportunityCreatePage />} />
//  <Route path={ROUTES.OPPORTUNITIES.DETAILS} element={<OpportunityDetailsPage />} />
//  <Route path={ROUTES.OPPORTUNITIES.EDIT} element={<OpportunityEditPage />} />

//  {/* Roles routes */}
//  <Route path={ROUTES.ROLES.LIST} element={<RolesPage />} /> 