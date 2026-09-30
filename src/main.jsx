import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import { Suspense, lazy } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';

const Hero = lazy(() => import('./components/ui/custom/Dashboard'));
const CreateTrip = lazy(() => import('./createTrip'));
const SignUpForm = lazy(() => import('./SignUpForm'));
const LoginPage = lazy(() => import('./LoginPage'));
const Profile = lazy(() => import('./Profile'));
const ViewTrip = lazy(() => import('./view-trip/tripId'));
const SharedTrip = lazy(() => import('./view-trip/shared'));
const ComparePrices = lazy(() => import('./createTrip/ComparePrices'));
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'));
const ImportTrip = lazy(() => import('./importTrip'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber"></div>
  </div>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,  
    children: [
      {
        path: '/',
        element: <Hero />  
      },
      {
        path: '/createTrip',
        element: <CreateTrip />,
      },
      {
        path: '/import',
        element: <ImportTrip />,
      },
      {
        path: '/signIn',
        element: <SignUpForm />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/profile',
        element: <Profile />,
      },
      {
        path: '/view-trip/:tripId',
        element: <ViewTrip />,
      },
      {
        path: '/v/:shareId',
        element: <SharedTrip />,
      },
      {
        path: '/compare-prices',
        element: <ComparePrices />,
      },
      {
        path: '/admin',
        element: <AdminDashboard />,
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <RouterProvider router={router} />
      </Suspense>
    </ErrorBoundary>
  </StrictMode>
);
