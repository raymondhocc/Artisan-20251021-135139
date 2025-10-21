import { AppLayout } from '@/components/layout/AppLayout';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useEffect, useMemo } from 'react';
export function App() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const protectedRoutes = useMemo(() => [
    '/media-library',
    '/poster-editor',
    '/projects',
  ], []);
  useEffect(() => {
    const isProtectedRoute = protectedRoutes.some(route => location.pathname.startsWith(route));
    if (!user && isProtectedRoute) {
      navigate('/login', { replace: true });
    } else if (user && location.pathname === '/login') {
      navigate('/', { replace: true }); // Redirect logged-in users from login page
    }
  }, [user, location.pathname, navigate, protectedRoutes]);
  return (
    <ThemeProvider defaultTheme="light" storageKey="artisan-canvas-theme">
      <AppLayout>
        <Outlet />
        <Toaster richColors closeButton />
      </AppLayout>
    </ThemeProvider>
  );
}