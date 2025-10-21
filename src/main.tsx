import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { DashboardPage } from '@/pages/DashboardPage';
import { MediaLibraryPage } from '@/pages/MediaLibraryPage';
import { PosterEditorPage } from '@/pages/PosterEditorPage';
import { ProjectManagementPage } from '@/pages/ProjectManagementPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { LearnMorePage } from '@/pages/LearnMorePage';
import { LoginPage } from '@/pages/LoginPage'; // Import new page
import { App } from './App';
import { createRoot } from 'react-dom/client';
const router = createBrowserRouter([
  {
    element: <App />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: "/",
        element: <DashboardPage />,
      },
      {
        path: "/media-library",
        element: <MediaLibraryPage />,
      },
      {
        path: "/poster-editor",
        element: <PosterEditorPage />,
      },
      {
        path: "/poster-editor/:projectId",
        element: <PosterEditorPage />,
      },
      {
        path: "/projects",
        element: <ProjectManagementPage />,
      },
      {
        path: "/settings",
        element: <SettingsPage />,
      },
      {
        path: "/learn-more",
        element: <LearnMorePage />,
      },
      {
        path: "/login", // New route for Login
        element: <LoginPage />,
      },
    ]
  },
]);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
)