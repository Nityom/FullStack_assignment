# Task Manager Application

A modern task management application built with React, Node.js, and PostgreSQL with vector search capabilities.

## Features

- Create, read, and delete tasks
- Responsive UI with Tailwind CSS
- Local storage caching for offline capability
- Vector search for finding similar tasks (coming soon)
- Docker containerization for easy deployment

## Technologies Used

- Frontend:
  - React with TypeScript
  - Vite for build tooling
  - Tailwind CSS for styling
  - Local Storage for caching

- Backend:
  - Node.js with Express
  - TypeScript
  - PostgreSQL with pgvector
  - Docker for containerization

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

## Development

To run the application in development mode:

1. Frontend:
   ```bash
   npm install
   npm run dev
   ```

2. Backend:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. Database:
   ```bash
   docker-compose up db
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the ISC License.
