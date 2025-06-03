# Task Manager Application - Development Guide

This guide provides instructions for developing and extending this full-stack Task Manager application.

## Development Environment Setup

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose
- PostgreSQL client (optional, for direct database access)

### Local Development

1. Start the database:
   ```powershell
   cd d:\FullStack_assignment
   docker-compose up -d db
   ```

2. Start the backend (in development mode):
   ```powershell
   cd d:\FullStack_assignment\backend
   npm install
   npm run dev
   ```

3. Start the frontend (in development mode):
   ```powershell
   cd d:\FullStack_assignment\Frontend
   npm install
   npm run dev
   ```

## Architecture

### Frontend

The frontend is built with React, TypeScript, and Vite. Key features include:

- **Components**: Modular UI components in `src/components/`
- **Caching**: Local storage caching in App.tsx
- **Offline Support**: Service worker in `public/serviceWorker.js`
- **TypeScript**: Type definitions in `src/types/`

### Backend

The backend is built with Node.js, Express, and TypeScript. Key features include:

- **API Routes**: Defined in `src/index.ts`
- **Vector Search**: Using pgvector and the all-MiniLM-L6-v2 model
- **Database**: PostgreSQL with pgvector extension

## Docker Configuration

The application is containerized using Docker Compose with three services:

1. **Frontend**: React application served by Vite
2. **Backend**: Express API server
3. **Database**: PostgreSQL with pgvector extension

## Adding New Features

### Frontend

1. Add new components in `Frontend/src/components/`
2. Update types in `Frontend/src/types/` as needed
3. Add new styles in `Frontend/src/styles/`

### Backend

1. Add new routes in `backend/src/index.ts`
2. Update database schema in `backend/src/db/init.sql` if needed

## Troubleshooting

### WebSocket HMR Issues

If you experience WebSocket HMR (Hot Module Replacement) connection issues:

1. Check that the Vite config has proper HMR settings
2. Ensure no firewall is blocking WebSocket connections
3. Try using the IP address instead of localhost

### Database Issues

If the vector search functionality isn't working:

1. Verify the pgvector extension is installed
2. Check that embeddings are being generated correctly
3. Ensure the database is properly initialized with the schema

## Performance Optimization

- The application uses localStorage for caching to reduce API calls
- Vector search results are cached for repeated searches
- Service worker caches static assets for offline use

## Security Considerations

- Add authentication for production use
- Implement rate limiting for the API
- Add input validation for all form submissions