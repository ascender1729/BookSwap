import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import type { Book } from '../types/database';
import { X } from 'lucide-react';

interface ExchangeModalProps {
  book: Book;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ExchangeModal({ book, onClose, onSuccess }: ExchangeModalProps) {
  const { user } = useAuthStore();
  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMyBooks();
  }, []);

  const fetchMyBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('owner_id', user?.id)
        .eq('status', 'available');
      
      if (error) throw error;
      setMyBooks(data || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('exchange_requests')
        .insert([{
          requester_id: user?.id,
          owner_id: book.owner_id,
          requested_book_id: book.id,
          offered_book_id: selectedBookId,
          status: 'pending'
        }]);
      
      if (error) throw error;
      onSuccess();
    } catch (error) {
      console.error('Error creating exchange request:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Request Exchange</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Book You Want</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">{book.title}</p>
              <p className="text-gray-600">by {book.author}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select a book to offer
              </label>
              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Choose a book</option>
                {myBooks.map(book => (
                  <option key={book.id} value={book.id}>
                    {book.title} by {book.author}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedBookId}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Sending Request...' : 'Send Exchange Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}