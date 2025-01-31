# BookSwap - Book Exchange Platform

A modern web application that enables users to exchange books with other readers. Built with React, TypeScript, and Supabase.

## Features

- **User Authentication**: Secure email/password authentication
- **Book Management**: List, edit, and remove books for exchange
- **Book Discovery**: Browse available books with filtering options
- **Exchange System**: Request and manage book exchanges
- **User Profiles**: Personalized profiles with exchange statistics

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase
- **State Management**: Zustand
- **UI Components**: Custom components with Lucide icons
- **Routing**: React Router
- **Styling**: Tailwind CSS with custom gradients

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file with:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── store/         # State management
├── lib/           # Utilities and configurations
├── types/         # TypeScript type definitions
└── main.tsx       # Application entry point
```

## Database Schema

The application uses the following tables:
- `profiles`: User profiles
- `books`: Book listings
- `exchange_requests`: Book exchange requests

## Deployment

The application is deployed on Netlify. Visit [BookSwap](https://your-app-url.netlify.app) to see it in action.

## Development Approach

### Challenges & Solutions

1. **Real-time Updates**
   - Challenge: Keeping the UI in sync with database changes
   - Solution: Implemented efficient state management with Zustand

2. **Exchange Logic**
   - Challenge: Managing complex book exchange workflows
   - Solution: Created a robust state machine for exchange statuses

3. **Performance**
   - Challenge: Handling large lists of books
   - Solution: Implemented pagination and efficient filtering

### Code Quality

- Consistent code style with ESLint
- Type safety with TypeScript
- Component-based architecture
- Comprehensive error handling
- Responsive design principles

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT License