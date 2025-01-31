import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { supabase } from './lib/supabase';

// Import components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Lazy load pages for better performance
const Home = React.lazy(() => import('./pages/Home'));
const Auth = React.lazy(() => import('./pages/Auth'));
const Books = React.lazy(() => import('./pages/Books'));
const MyBooks = React.lazy(() => import('./pages/MyBooks'));
const Matches = React.lazy(() => import('./pages/Matches'));
const Profile = React.lazy(() => import('./pages/Profile'));

// Loading component for suspense fallback
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
}

// Protected Route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function App() {
  const { fetchUser, user, loading } = useAuthStore();

  useEffect(() => {
    // Initial auth check
    fetchUser();

    // Set up real-time auth subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        await fetchUser();
      } else if (event === 'SIGNED_OUT') {
        useAuthStore.setState({ user: null, loading: false });
      }
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUser]);

  // Show initial loading state
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route 
                path="/auth" 
                element={user ? <Navigate to="/books" replace /> : <Auth />} 
              />

              {/* Protected routes */}
              <Route 
                path="/books" 
                element={
                  <ProtectedRoute>
                    <Books />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-books" 
                element={
                  <ProtectedRoute>
                    <MyBooks />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/matches" 
                element={
                  <ProtectedRoute>
                    <Matches />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />

              {/* Catch all route for 404 */}
              <Route 
                path="*" 
                element={
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
                    <p className="text-gray-600">
                      The page you're looking for doesn't exist or has been moved.
                    </p>
                  </div>
                } 
              />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
