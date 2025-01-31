import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { BookOpen, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-500" />
            <span className="text-xl font-bold">BookSwap</span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link 
                  to="/books" 
                  className={`text-gray-700 hover:text-blue-500 ${
                    location.pathname === '/books' ? 'text-blue-500' : ''
                  }`}
                >
                  Browse Books
                </Link>
                <Link 
                  to="/my-books" 
                  className={`text-gray-700 hover:text-blue-500 ${
                    location.pathname === '/my-books' ? 'text-blue-500' : ''
                  }`}
                >
                  My Books
                </Link>
                <Link 
                  to="/matches" 
                  className={`text-gray-700 hover:text-blue-500 ${
                    location.pathname === '/matches' ? 'text-blue-500' : ''
                  }`}
                >
                  Matches
                </Link>
                <Link
                  to="/profile"
                  className={`flex items-center space-x-1 text-gray-700 hover:text-blue-500 ${
                    location.pathname === '/profile' ? 'text-blue-500' : ''
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span>{user.username}</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-500"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}