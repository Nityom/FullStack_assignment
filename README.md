# Task Manager Application

A full-stack task management application built with React, Node.js, PostgreSQL, and Docker, featuring vector-based semantic search.

## Features

- Create, read, and delete tasks
- Responsive UI with Tailwind CSS
- Vector-based semantic search with pgvector
- Local storage caching for performance
- Service worker for offline support
- Docker containerization for easy deployment

## Technologies

### Frontend
- React with TypeScript
- Vite for build tooling
- Tailwind CSS for responsive UI
- Service Worker for offline capability

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL with pgvector extension
- Docker & Docker Compose

## Getting Started

1. Clone the repository
2. Make sure you have Docker and Docker Compose installed
3. Run the application:
   ```bash
   docker-compose up --build
   ```

This will start:
- Frontend at http://localhost:5173
- Backend API at http://localhost:3000
- PostgreSQL database at localhost:5432

## Project Structure

```
docker-compose.yml        # Docker Compose configuration
backend/                  # Backend API service
  Dockerfile              # Backend container configuration
  src/                    # Backend source code
    index.ts              # Main API entry point
    db/                   # Database scripts
      init.sql            # Database initialization script
Frontend/                 # Frontend application
  Dockerfile.frontend     # Frontend container configuration
  public/                 # Static assets
    serviceWorker.js      # Service worker for offline support
  src/                    # Frontend source code
    components/           # React components
    types/                # TypeScript interfaces
```

## Caching Approach

This app uses browser localStorage to cache the task list for performance and offline support. On app load, it checks localStorage for cached tasks and uses them if available. When tasks are added or deleted, the cache is updated. This reduces redundant API calls and improves perceived speed.

- On load: If tasks are cached, use them; otherwise, fetch from the server and cache the result.
- On add/delete: Update both the server and the cache.
- Manual refresh: The UI provides a button to force-refresh the cache from the server.

## Vector Search Approach

The backend uses PostgreSQL with the pgvector extension to store vector embeddings of task descriptions. When a user searches, the backend generates an embedding for the query and finds the top 3 most similar tasks using vector distance. Embeddings are generated using the all-MiniLM-L6-v2 model from Sentence Transformers.

- Each task's description is embedded and stored as a vector.
- Search queries are embedded and compared to task vectors using the `<->` operator in SQL.
- The backend returns the most semantically similar tasks, not just exact matches.

## Offline Support

A service worker is included to enable offline access to cached tasks. If the network is unavailable, the app will still display the most recently cached tasks.

## Similarity Highlighting

When searching, the UI displays a similarity score for each result, visually highlighting the most relevant tasks.
