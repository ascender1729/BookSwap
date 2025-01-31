import React from 'react';
import type { Book } from '../types/database';
import { useAuthStore } from '../store/authStore';
import { BookOpen, Star, Clock } from 'lucide-react';

interface BookCardProps {
  book: Book;
  onExchangeRequest?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export default function BookCard({ 
  book, 
  onExchangeRequest, 
  onEdit, 
  onDelete, 
  showActions = false 
}: BookCardProps) {
  const { user } = useAuthStore();
  const isOwner = user?.id === book.owner_id;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-1 line-clamp-1">
            {book.title}
          </h3>
          <p className="text-gray-600">by {book.author}</p>
        </div>
        <div className="flex items-center space-x-2">
          {book.condition === 'New' && (
            <span className="flex items-center text-yellow-500">
              <Star className="h-4 w-4 mr-1" />
              New
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
          {book.genre}
        </span>
        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
          {book.condition}
        </span>
        <span className={`px-3 py-1 rounded-full text-sm ${
          book.status === 'available' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-orange-100 text-orange-800'
        }`}>
          {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
        </span>
      </div>

      {book.description && (
        <p className="text-gray-700 mb-4 line-clamp-2">{book.description}</p>
      )}

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center text-gray-500 text-sm">
          <Clock className="h-4 w-4 mr-1" />
          {new Date(book.created_at).toLocaleDateString()}
        </div>

        {showActions && (
          <div className="flex space-x-2">
            {!isOwner && book.status === 'available' && onExchangeRequest && (
              <button
                onClick={onExchangeRequest}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Request Exchange
              </button>
            )}
            {isOwner && (
              <>
                {onEdit && (
                  <button
                    onClick={onEdit}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={onDelete}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}