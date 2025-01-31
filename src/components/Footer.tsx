import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Github, Twitter, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-500" />
              <span className="text-xl font-bold">BookSwap</span>
            </div>
            <p className="text-gray-600">
              Connect with fellow readers and discover your next favorite book through meaningful exchanges.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/books" className="text-gray-600 hover:text-blue-500">
                  Browse Books
                </Link>
              </li>
              <li>
                <Link to="/my-books" className="text-gray-600 hover:text-blue-500">
                  My Collection
                </Link>
              </li>
              <li>
                <Link to="/matches" className="text-gray-600 hover:text-blue-500">
                  Exchange Requests
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Community</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-500">
                  Guidelines
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-500">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-500">
                  Help Center
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-blue-500">
                <Github className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-500">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-500">
                <Mail className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t mt-12 pt-8">
          <p className="text-center text-gray-600">
            © {new Date().getFullYear()} BookSwap. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}