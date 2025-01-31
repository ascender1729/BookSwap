import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { User, BookOpen, Mail, Calendar } from 'lucide-react';

export default function Profile() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalBooks: 0,
    exchangesCompleted: 0,
    pendingRequests: 0
  });
  const [formData, setFormData] = useState({
    username: user?.username || '',
    avatar_url: user?.avatar_url || ''
  });

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const [booksResult, exchangesResult, requestsResult] = await Promise.all([
        supabase
          .from('books')
          .select('count')
          .eq('owner_id', user?.id),
        supabase
          .from('exchange_requests')
          .select('count')
          .eq('status', 'accepted')
          .or(`requester_id.eq.${user?.id},owner_id.eq.${user?.id}`),
        supabase
          .from('exchange_requests')
          .select('count')
          .eq('status', 'pending')
          .or(`requester_id.eq.${user?.id},owner_id.eq.${user?.id}`)
      ]);

      setStats({
        totalBooks: booksResult.count || 0,
        exchangesCompleted: exchangesResult.count || 0,
        pendingRequests: requestsResult.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          avatar_url: formData.avatar_url
        })
        .eq('id', user?.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-blue-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{user?.username}</h1>
            <p className="flex items-center mt-2">
              <Mail className="w-4 h-4 mr-2" />
              Member since{' '}
              {new Date(user?.created_at || '').toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <BookOpen className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold">{stats.totalBooks}</span>
          </div>
          <p className="mt-2 text-gray-600">Books Listed</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <Calendar className="w-8 h-8 text-purple-500" />
            <span className="text-2xl font-bold">{stats.exchangesCompleted}</span>
          </div>
          <p className="mt-2 text-gray-600">Exchanges Completed</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <Mail className="w-8 h-8 text-indigo-500" />
            <span className="text-2xl font-bold">{stats.pendingRequests}</span>
          </div>
          <p className="mt-2 text-gray-600">Pending Requests</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Avatar URL
            </label>
            <input
              type="url"
              value={formData.avatar_url}
              onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}