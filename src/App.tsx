// src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { supabase } from './lib/supabase';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Books from './pages/Books';
import MyBooks from './pages/MyBooks';
import Matches from './pages/Matches';
import Profile from './pages/Profile';

function App() {
  const { fetchUser, user, loading } = useAuthStore();

  // Set up authentication listener
  useEffect(() => {
    // Initial fetch of user data
    fetchUser();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        fetchUser();
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUser]);

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/auth" 
              element={user ? <Navigate to="/books" replace /> : <Auth />} 
            />
            <Route 
              path="/books" 
              element={user ? <Books /> : <Navigate to="/auth" replace />} 
            />
            <Route 
              path="/my-books" 
              element={user ? <MyBooks /> : <Navigate to="/auth" replace />} 
            />
            <Route 
              path="/matches" 
              element={user ? <Matches /> : <Navigate to="/auth" replace />} 
            />
            <Route 
              path="/profile" 
              element={user ? <Profile /> : <Navigate to="/auth" replace />} 
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;