#!/bin/bash

# Initialize database for local development
psql -U postgres -c "CREATE DATABASE taskdb;"
psql -U postgres -d taskdb -c "CREATE EXTENSION IF NOT EXISTS vector;"
psql -U postgres -d taskdb -f src/db/init.sql
