# Univote - University Online Voting System

Univote is a full-stack university voting system built with React, Tailwind CSS, Node.js, Express, and MongoDB. It is designed to provide a secure and simple way for students to vote and for administrators to manage elections.

## Project Structure

```text
Major-Project/
|- client/                  # React + Vite + Tailwind frontend
|- server/                  # Node.js + Express + MongoDB backend
|- package.json             # Root scripts
`- README.md
```

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB local install or MongoDB Atlas

## Setup

1. Install dependencies:

```bash
npm run install:all
```

2. Create the backend environment file:

```bash
cd server
cp .env.example .env
```

3. Update `server/.env` with your values:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/university_voting
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=7d
ADMIN_SETUP_KEY=your_setup_key_here
```

4. Start the development servers from the project root:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173` and backend runs on `http://localhost:5000`.

## Main Features

- Voter login with voter ID and password
- Admin setup and admin login
- Election and candidate management
- One-vote-per-voter protection
- Live and final result views
- JWT-based authentication
- Responsive interface for desktop and mobile

## Tech Stack

- Frontend: React 18, Vite, Tailwind CSS, React Router
- Backend: Node.js, Express
- Database: MongoDB, Mongoose
- Auth: JWT, bcryptjs
- Charts and API: Recharts, Axios

## License

This repository includes the project's `LICENSE` file from GitHub.
