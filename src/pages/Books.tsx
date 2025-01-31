import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Book } from '../types/database';
import { Search, Filter, BookOpen } from 'lucide-react';
import BookCard from '../components/BookCard';
import ExchangeModal from '../components/ExchangeModal';

export default function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('status', 'available');
      
      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = !selectedGenre || book.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const genres = Array.from(new Set(books.map(book => book.genre)));

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Available Books
          </h1>
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-blue-500" />
            <span className="text-gray-600">
              {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'} available
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by title or author"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-8"
            >
              <option value="">All Genres</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map(book => (
            <BookCard
              key={book.id}
              book={book}
              showActions
              onExchangeRequest={() => setSelectedBook(book)}
            />
          ))}

          {filteredBooks.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 text-lg">
                No books found matching your criteria.
              </p>
            </div>
          )}
        </div>
      )}

      {selectedBook && (
        <ExchangeModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onSuccess={() => {
            setSelectedBook(null);
            fetchBooks();
          }}
        />
      )}
    </div>
  );
}