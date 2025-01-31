// src/types/database.ts

/**
 * Type definitions for the BookSwap application database.
 * This file provides type safety and documentation for all database entities.
 */

/**
 * Enumerated types for consistent values across the application
 */
export type BookCondition = 'New' | 'Like New' | 'Very Good' | 'Good' | 'Fair';
export type BookStatus = 'available' | 'exchanged' | 'pending';
export type ExchangeStatus = 'pending' | 'accepted' | 'rejected' | 'completed';
export type UserRole = 'user' | 'admin' | 'moderator';

/**
 * Profile interface representing user information.
 * Links to auth.users and stores additional user metadata.
 */
export interface Profile {
  id: string;                    // UUID from auth.users
  username: string;              // Unique username for the user
  avatar_url?: string;           // Optional URL to user's avatar image
  created_at: string;            // Timestamp of profile creation
  updated_at: string;            // Timestamp of last profile update
  total_exchanges?: number;      // Number of successful exchanges
  rating?: number;               // User's average rating (1-5)
  bio?: string;                  // Optional user biography
  preferences?: string[];        // Preferred book genres
  role?: UserRole;               // User's role in the system
  email_notifications?: boolean; // Whether user wants email notifications
  last_active?: string;         // Timestamp of last user activity
}

/**
 * Book interface representing a book listing in the system.
 * Includes comprehensive metadata and exchange status.
 */
export interface Book {
  id: string;                    // UUID for the book
  owner_id: string;              // UUID of the book's owner (FK to profiles)
  title: string;                 // Book title
  author: string;                // Book author
  genre: string;                 // Book genre
  condition: BookCondition;      // Book's physical condition
  description?: string;          // Optional detailed description
  status: BookStatus;            // Current exchange status
  created_at: string;            // Timestamp of book listing creation
  updated_at: string;            // Timestamp of last update
  cover_url?: string;            // Optional URL to book cover image
  isbn?: string;                 // Optional ISBN identifier
  language?: string;             // Optional book language
  publication_year?: number;     // Optional year of publication
  publisher?: string;            // Optional publisher name
  page_count?: number;           // Optional number of pages
  tags?: string[];              // Optional array of searchable tags
  views?: number;               // Number of times the book was viewed
  favorite_count?: number;      // Number of users who favorited this book
}

/**
 * Exchange request interface tracking book exchanges between users.
 * Manages the complete lifecycle of a book exchange.
 */
export interface ExchangeRequest {
  id: string;                    // UUID for the exchange request
  requester_id: string;          // UUID of user initiating the request
  owner_id: string;              // UUID of book owner
  requested_book_id: string;     // UUID of book being requested
  offered_book_id: string;       // UUID of book being offered
  status: ExchangeStatus;        // Exchange status
  created_at: string;            // Timestamp of request creation
  updated_at: string;            // Timestamp of last status update
  message?: string;              // Optional message from requester
  response_message?: string;     // Optional response from owner
  completed_at?: string;         // Timestamp when exchange was completed
  rating_requester?: number;     // Optional rating given by requester (1-5)
  rating_owner?: number;         // Optional rating given by owner (1-5)
  exchange_location?: string;    // Optional meeting location for exchange
  exchange_date?: string;        // Optional planned date for exchange
  canceled_by?: string;          // UUID of user who canceled (if applicable)
  cancel_reason?: string;        // Reason for cancellation
}

/**
 * Database interface for Supabase typing
 * Provides type safety for database operations
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      books: {
        Row: Book;
        Insert: Omit<Book, 'id' | 'created_at' | 'updated_at' | 'views' | 'favorite_count'>;
        Update: Partial<Omit<Book, 'id' | 'owner_id' | 'created_at' | 'updated_at'>>;
      };
      exchange_requests: {
        Row: ExchangeRequest;
        Insert: Omit<ExchangeRequest, 'id' | 'created_at' | 'updated_at' | 'completed_at'>;
        Update: Partial<Omit<ExchangeRequest, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}

/**
 * Type guard functions for runtime type checking
 */
export function isValidCondition(condition: string): condition is BookCondition {
  return ['New', 'Like New', 'Very Good', 'Good', 'Fair'].includes(condition);
}

export function isValidBookStatus(status: string): status is BookStatus {
  return ['available', 'exchanged', 'pending'].includes(status);
}

export function isValidExchangeStatus(status: string): status is ExchangeStatus {
  return ['pending', 'accepted', 'rejected', 'completed'].includes(status);
}

export function isValidUserRole(role: string): role is UserRole {
  return ['user', 'admin', 'moderator'].includes(role);
}

/**
 * Default values and constants
 */
export const DEFAULT_BOOK_VALUES: Partial<Book> = {
  condition: 'Good',
  status: 'available',
  language: 'English',
  views: 0,
  favorite_count: 0
};

export const BOOK_GENRES = [
  'Fiction',
  'Non-Fiction',
  'Science Fiction',
  'Mystery',
  'Romance',
  'Biography',
  'History',
  'Science',
  'Technology',
  'Poetry',
  'Drama',
  'Horror',
  'Fantasy'
] as const;

/**
 * Utility types for filtering and searching
 */
export interface BookFilters {
  genre?: string;
  condition?: BookCondition;
  language?: string;
  status?: BookStatus;
  publicationYear?: number;
  minRating?: number;
  maxRating?: number;
  searchTerm?: string;
}

export interface ExchangeFilters {
  status?: ExchangeStatus;
  dateRange?: {
    start: string;
    end: string;
  };
  userId?: string;
}