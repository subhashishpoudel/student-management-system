# Student Management System

A web app to manage students and their marks.

## Features
- Dashboard with totals, pass and fail counts, and a marks chart
- Add, edit and delete students
- Search and sort
- Contact form saved to the database

## Built with
TypeScript, Express, PostgreSQL and AdminLTE

## Requirements
- Node.js 20.6 or newer
- PostgreSQL
- Internet connection (the template loads from a CDN)

## Setup

1. Install packages from the project folder:
   ```
   npm install
   cd backend
   npm install
   ```

2. Create `backend/.env`:
   ```
   PGHOST=localhost
   PGPORT=5432
   PGUSER=postgres
   PGPASSWORD=your_password
   PGDATABASE=practice1
   ```

3. Create the database and tables, from the `backend` folder.
   Skip the first command if the database exists.
   ```
   createdb -h localhost -U postgres practice1
   psql -h localhost -U postgres -d practice1 -f sql/schema.sql
   ```
   If these commands aren't recognised, run them from
   PostgreSQL's `bin` folder using full paths.

## Run

Terminal 1, in `backend`:
```
npm run dev
```

Terminal 2, in the project folder:
```
npm run dev
```

Open http://localhost:8080

## Project structure
- `src/` - page behaviour
- `backend/src/` - API routes and controllers
- `backend/sql/` - database tables
- `docs/CELLS.md` - how the code blocks connect

## Limitations
There is no login yet, so use it only on your own computer.

## Author
Subhashish Poudel