-- Initialize necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext"; -- For case-insensitive text searches

-- Create an enum for user roles
CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');

-- Create or update the profiles table with enhanced features
CREATE TABLE profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id),
    username citext UNIQUE NOT NULL,
    avatar_url text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    total_exchanges integer DEFAULT 0,
    rating decimal(3,2) CHECK (rating >= 0 AND rating <= 5),
    bio text,
    preferences text[],
    role user_role DEFAULT 'user',
    email_notifications boolean DEFAULT true,
    last_active timestamptz DEFAULT now()
);

-- Create an enum for book conditions to ensure data consistency
CREATE TYPE book_condition AS ENUM ('New', 'Like New', 'Very Good', 'Good', 'Fair');

-- Create an enum for book status
CREATE TYPE book_status AS ENUM ('available', 'exchanged', 'pending');

-- Enhanced books table with additional metadata
CREATE TABLE books (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id uuid REFERENCES profiles(id) NOT NULL,
    title text NOT NULL,
    author text NOT NULL,
    genre text NOT NULL,
    condition book_condition NOT NULL,
    description text,
    status book_status DEFAULT 'available' NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    cover_url text,
    isbn text,
    language text DEFAULT 'English',
    publication_year integer CHECK (publication_year > 1000 AND publication_year <= extract(year from now())),
    publisher text,
    page_count integer CHECK (page_count > 0),
    tags text[],
    views integer DEFAULT 0,
    favorite_count integer DEFAULT 0
);

-- Create an enum for exchange request status
CREATE TYPE exchange_status AS ENUM ('pending', 'accepted', 'rejected', 'completed');

-- Enhanced exchange_requests table with additional features
CREATE TABLE exchange_requests (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id uuid REFERENCES profiles(id) NOT NULL,
    owner_id uuid REFERENCES profiles(id) NOT NULL,
    requested_book_id uuid REFERENCES books(id) NOT NULL,
    offered_book_id uuid REFERENCES books(id) NOT NULL,
    status exchange_status DEFAULT 'pending' NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    message text,
    response_message text,
    completed_at timestamptz,
    rating_requester decimal(3,2) CHECK (rating_requester >= 0 AND rating_requester <= 5),
    rating_owner decimal(3,2) CHECK (rating_owner >= 0 AND rating_owner <= 5),
    exchange_location text,
    exchange_date timestamptz,
    canceled_by uuid REFERENCES profiles(id),
    cancel_reason text
);

-- Create a favorites table to track user's favorite books
CREATE TABLE book_favorites (
    user_id uuid REFERENCES profiles(id) NOT NULL,
    book_id uuid REFERENCES books(id) NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    PRIMARY KEY (user_id, book_id)
);

-- Create indexes for improved query performance
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_rating ON profiles(rating);
CREATE INDEX idx_profiles_total_exchanges ON profiles(total_exchanges);

CREATE INDEX idx_books_owner_id ON books(owner_id);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_books_genre ON books(genre);
CREATE INDEX idx_books_language ON books(language);
CREATE INDEX idx_books_publication_year ON books(publication_year);
CREATE INDEX idx_books_views ON books(views);
CREATE INDEX idx_books_favorite_count ON books(favorite_count);
CREATE INDEX idx_books_title_trgm ON books USING gin (title gin_trgm_ops);
CREATE INDEX idx_books_author_trgm ON books USING gin (author gin_trgm_ops);

CREATE INDEX idx_exchange_requests_requester ON exchange_requests(requester_id);
CREATE INDEX idx_exchange_requests_owner ON exchange_requests(owner_id);
CREATE INDEX idx_exchange_requests_status ON exchange_requests(status);
CREATE INDEX idx_exchange_requests_completed_at ON exchange_requests(completed_at);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_favorites ENABLE ROW LEVEL SECURITY;

-- Enhanced RLS policies with role-based access control

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id OR 
           EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Books policies
CREATE POLICY "Books are viewable by everyone"
    ON books FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own books"
    ON books FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own books"
    ON books FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own available books"
    ON books FOR DELETE
    USING (auth.uid() = owner_id AND status = 'available');

-- Exchange requests policies
CREATE POLICY "Users can view their exchange requests"
    ON exchange_requests FOR SELECT
    USING (auth.uid() IN (requester_id, owner_id) OR 
           EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can create exchange requests"
    ON exchange_requests FOR INSERT
    WITH CHECK (
        auth.uid() = requester_id AND
        requester_id != owner_id AND
        NOT EXISTS (
            SELECT 1 FROM exchange_requests
            WHERE requester_id = auth.uid()
            AND status = 'pending'
            AND (requested_book_id = NEW.requested_book_id OR offered_book_id = NEW.offered_book_id)
        ) AND
        (
            SELECT count(*) = 2
            FROM books
            WHERE id IN (NEW.requested_book_id, NEW.offered_book_id)
            AND status = 'available'
        )
    );

-- Favorites policies
CREATE POLICY "Users can view all favorites"
    ON book_favorites FOR SELECT
    USING (true);

CREATE POLICY "Users can manage their own favorites"
    ON book_favorites FOR ALL
    USING (auth.uid() = user_id);

-- Create functions for common operations

-- Function to update book favorite count
CREATE OR REPLACE FUNCTION update_book_favorite_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE books SET favorite_count = favorite_count + 1 WHERE id = NEW.book_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE books SET favorite_count = favorite_count - 1 WHERE id = OLD.book_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Function to update user rating
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' THEN
        -- Update requester's rating
        UPDATE profiles SET
            rating = (
                SELECT avg(COALESCE(rating_requester, 0))
                FROM exchange_requests
                WHERE requester_id = NEW.requester_id
                AND status = 'completed'
            )
        WHERE id = NEW.requester_id;
        
        -- Update owner's rating
        UPDATE profiles SET
            rating = (
                SELECT avg(COALESCE(rating_owner, 0))
                FROM exchange_requests
                WHERE owner_id = NEW.owner_id
                AND status = 'completed'
            )
        WHERE id = NEW.owner_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_favorite_count
    AFTER INSERT OR DELETE ON book_favorites
    FOR EACH ROW
    EXECUTE FUNCTION update_book_favorite_count();

CREATE TRIGGER update_user_ratings
    AFTER UPDATE OF status ON exchange_requests
    FOR EACH ROW
    WHEN (OLD.status != 'completed' AND NEW.status = 'completed')
    EXECUTE FUNCTION update_user_rating();

-- Update timestamp triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at
    BEFORE UPDATE ON books
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exchange_requests_updated_at
    BEFORE UPDATE ON exchange_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();