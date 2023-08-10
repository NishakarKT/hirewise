import React, { useContext } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
// contexts
import AppContext from './contexts/AppContext';
// layouts
import UserLayout from './layouts/user';
import AdminLayout from './layouts/admin';
// // pages
// user
import ApplicationsPage from './pages/admin/AppllicationsPage';
import AdminJobsPage from './pages/admin/AdminJobsPage';
import AdminInterviewsPage from './pages/admin/AdminInterviewsPage';
import AIPage from './pages/admin/AIPage';
// admin
import JobsPage from './pages/user/JobsPage';
import InterviewsPage from './pages/user/InterviewsPage';
// template
import BlogPage from './pages/BlogPage';
import UserPage from './pages/UserPage';
import Auth from './pages/Auth';
import ProductsPage from './pages/ProductsPage';
import DashboardAppPage from './pages/DashboardAppPage';

// ----------------------------------------------------------------------

export default function Router() {
  const { user } = useContext(AppContext);
  const routes = useRoutes([
    {
      path: '/user/',
      element: user?.role === 'user' ? <UserLayout /> : <Navigate to="/auth" />,
      children: [
        { element: <Navigate to="jobs" />, index: true },
        { path: 'jobs', element: <JobsPage /> },
        { path: 'interviews', element: <InterviewsPage /> },
      ],
    },
    {
      path: '/admin/',
      element: user?.role === 'admin' ? <AdminLayout /> : <Navigate to="/auth" />,
      children: [
        { element: <Navigate to="interviews" />, index: true },
        { path: 'interviews', element: <AdminInterviewsPage /> },
        { path: 'applications', element: <ApplicationsPage /> },
        { path: 'jobs', element: <AdminJobsPage /> },
        { path: 'tools', element: <AIPage /> },
        // template
        { path: 'dashboard', element: <DashboardAppPage /> },
        { path: 'user', element: <UserPage /> },
        { path: 'products', element: <ProductsPage /> },
        { path: 'blog', element: <BlogPage /> },
      ],
    },
    {
      path: '/auth/',
      element: !user?.email ? (
        <Auth />
      ) : user.role === 'admin' ? (
        <Navigate to="/admin/" />
      ) : (
        <Navigate to="/user/" />
      ),
    },
    {
      path: '*',
      element: <Navigate to="/auth/" />,
    },
  ]);

  return routes;
}
