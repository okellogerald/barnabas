import React, { lazy, Suspense } from 'react';
import { Navigate, Routes, Route, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/app.layout';
import { ROUTES } from './constants';
import { AuthManager } from '@/managers/auth/auth.manager';
import ProtectedRoute from './protected_route';
import { MemberEditRouteLoader } from '@/pages/member-edit/loader';
import { MemberDetailsRouteLoader } from '@/pages/member-details/loader';

// Lazy-loaded components
const LoginPage = lazy(() => import('@/pages/auth/login.page'));
const DashboardPage = lazy(() => import('@/pages/dashboard/dashboard.page'));
const MembersPage = lazy(() => import('@/pages/member-list/member_list.page'));
const MemberCreatePage = lazy(() => import('@/pages/member-create/member_create.page'));
const MemberEditPage = lazy(() => import('@/pages/member-edit/member_edit.page'));
const MemberDetailsPage = lazy(() => import('@/pages/member-details/member_details.page'));
const FellowshipListPage = lazy(() => import('@/pages/fellowship/list/page'));
const FellowshipDetailsPage = lazy(() => import('@/pages/fellowship/details/page'));
const FellowshipCreatePage = lazy(() => import('@/pages/fellowship/create/page'));
const FellowshipEditPage = lazy(() => import('@/pages/fellowship/edit/page'));
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
          <Route path={ROUTES.MEMBERS.CREATE} element={<MemberCreatePage />} />
          <Route path={ROUTES.MEMBERS.EDIT} loader={MemberEditRouteLoader} element={<MemberEditPage />} />
          <Route path={ROUTES.MEMBERS.DETAILS} loader={MemberDetailsRouteLoader} element={<MemberDetailsPage />} />

          {/* Fellowships routes */}
          <Route path={ROUTES.FELLOWSHIPS.LIST} element={<FellowshipListPage />} />
          <Route path={ROUTES.FELLOWSHIPS.DETAILS} element={<FellowshipDetailsPage />} />
          <Route path={ROUTES.FELLOWSHIPS.CREATE} element={<FellowshipCreatePage />} />
          <Route path={ROUTES.FELLOWSHIPS.EDIT} element={<FellowshipEditPage />} />

          <Route path={ROUTES.OPPORTUNITIES.LIST} element={"Opportunities page not currently implemented"} />

          <Route path={ROUTES.ROLES.LIST} element={"Roles page not currently implemented"} />

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
    goBack: () => navigate(-1),

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
