import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, BookMarked, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
      <div className="max-w-4xl mx-auto text-center px-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
          Exchange Books, Share Stories
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Join our community of book lovers and discover new stories through meaningful exchanges.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
            <BookOpen className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">List Your Books</h3>
            <p className="text-gray-600">Share your collection with fellow readers</p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
            <BookMarked className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Find Matches</h3>
            <p className="text-gray-600">Discover books you want to read</p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
            <Users className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Exchange</h3>
            <p className="text-gray-600">Connect with readers and swap books</p>
          </div>
        </div>

        <Link
          to="/auth"
          className="inline-flex items-center px-8 py-3 text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:opacity-90 transition-opacity"
        >
          Get Started
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}