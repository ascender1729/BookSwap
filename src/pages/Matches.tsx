import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import type { ExchangeRequest, Book } from '../types/database';
import { Check, X, Clock } from 'lucide-react';

interface ExtendedExchangeRequest extends ExchangeRequest {
  requested_book: Book;
  offered_book: Book;
}

export default function Matches() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<ExtendedExchangeRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('exchange_requests')
        .select(`
          *,
          requested_book:books!requested_book_id(*),
          offered_book:books!offered_book_id(*)
        `)
        .or(`requester_id.eq.${user?.id},owner_id.eq.${user?.id}`);
      
      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('exchange_requests')
        .update({ status })
        .eq('id', requestId);
      
      if (error) throw error;
      fetchRequests();
    } catch (error) {
      console.error('Error updating request:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Exchange Requests</h1>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map(request => (
            <div key={request.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(request.status)}
                  <span className="font-medium capitalize">
                    Status: {request.status}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(request.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Requested Book</h3>
                  <p className="text-xl mb-1">{request.requested_book.title}</p>
                  <p className="text-gray-600">by {request.requested_book.author}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {request.requested_book.genre}
                    </span>
                    <span className="text-sm text-gray-500">
                      Condition: {request.requested_book.condition}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Offered Book</h3>
                  <p className="text-xl mb-1">{request.offered_book.title}</p>
                  <p className="text-gray-600">by {request.offered_book.author}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {request.offered_book.genre}
                    </span>
                    <span className="text-sm text-gray-500">
                      Condition: {request.offered_book.condition}
                    </span>
                  </div>
                </div>
              </div>

              {request.status === 'pending' && request.owner_id === user?.id && (
                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    onClick={() => handleRequestAction(request.id, 'rejected')}
                    className="px-4 py-2 text-red-600 hover:text-red-700"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleRequestAction(request.id, 'accepted')}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Accept
                  </button>
                </div>
              )}
            </div>
          ))}

          {requests.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No exchange requests found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}