# 🗳️ University Online Voting System

A full-stack university voting system rebuilt with **React + Tailwind CSS** (frontend), **Node.js + Express** (backend), and **MongoDB** (database).

---

## 📁 Project Structure

```
university-voting-system/
├── client/                  # React + Vite + Tailwind CSS frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── VoterLogin.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── AdminSetup.jsx
│   │   │   ├── VoterHome.jsx
│   │   │   ├── VotePage.jsx
│   │   │   ├── ResultsPage.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── AdminVoters.jsx
│   │   │       ├── AdminElections.jsx
│   │   │       ├── AdminCandidates.jsx
│   │   │       └── AdminResults.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── AdminLayout.jsx
│   │   │   └── Modal.jsx
│   │   ├── context/AuthContext.jsx
│   │   ├── utils/api.js
│   │   └── App.jsx
│   └── package.json
│
├── server/                  # Node.js + Express + MongoDB backend
│   ├── src/
│   │   ├── index.js
│   │   ├── models/
│   │   │   ├── Voter.js
│   │   │   ├── Admin.js
│   │   │   ├── Candidate.js
│   │   │   ├── Election.js
│   │   │   └── Vote.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── admin.js
│   │   │   ├── voter.js
│   │   │   └── election.js
│   │   └── middleware/
│   │       └── auth.js
│   ├── .env.example
│   └── package.json
│
├── package.json             # Root scripts (runs both together)
└── README.md
```

---

## ⚙️ Prerequisites

- **Node.js** v18+
- **MongoDB** (local install or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **npm** v9+

---

## 🚀 Setup & Installation

### 1. Clone / extract the project

```bash
cd university-voting-system
```

### 2. Install all dependencies

```bash
# Install root, server, and client deps in one go
npm run install:all
```

Or manually:
```bash
npm install
cd server && npm install
cd ../client && npm install
```

### 3. Configure environment variables

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/university_voting
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=7d
ADMIN_SETUP_KEY=your_setup_key_here
```

> For MongoDB Atlas, replace `MONGODB_URI` with your connection string.

### 4. Start the development servers

From the root folder:
```bash
npm run dev
```

This starts:
- **Backend** → http://localhost:5000
- **Frontend** → http://localhost:5173

---

## 👤 First-Time Admin Setup

1. Open http://localhost:5173/admin/setup
2. Enter the **Setup Key** from your `.env` (`ADMIN_SETUP_KEY`)
3. Fill in name, username, email, and password
4. You'll be redirected to the admin login page

**Default credentials (if you use the example key):**
- Setup Key: `admin_setup_2024`
- Then create your own username/password

---

## 🗺️ Application Routes

### Voter (Student)
| Route | Description |
|---|---|
| `/` | Voter login page |
| `/home` | View all elections |
| `/vote/:electionId` | Cast ballot |
| `/results/:electionId` | View results (closed elections) |

### Admin
| Route | Description |
|---|---|
| `/admin/login` | Admin login |
| `/admin/setup` | First-time admin account creation |
| `/admin` | Dashboard with stats |
| `/admin/voters` | Add / edit / delete voters |
| `/admin/elections` | Create / manage elections |
| `/admin/elections/:id/candidates` | Add candidates to an election |
| `/admin/elections/:id/results` | View live results + charts |

---

## 🔌 API Endpoints

### Auth
```
POST /api/auth/voter/login     Voter login
POST /api/auth/admin/login     Admin login
POST /api/auth/admin/setup     Create first admin
GET  /api/auth/me              Get current user
```

### Admin (requires admin JWT)
```
GET/POST        /api/admin/voters
PUT/DELETE      /api/admin/voters/:id

GET/POST        /api/admin/elections
PUT/DELETE      /api/admin/elections/:id
GET             /api/admin/elections/:id/candidates
GET             /api/admin/elections/:id/results

POST            /api/admin/candidates
PUT/DELETE      /api/admin/candidates/:id

GET             /api/admin/stats
```

### Elections (requires any JWT)
```
GET  /api/election                  List all elections
GET  /api/election/:id              Election + candidates + hasVoted
POST /api/election/:id/vote         Submit ballot
GET  /api/election/:id/results      View results
```

---

## ✨ Features

- **Voter authentication** with unique Voter ID + password
- **Admin dashboard** with live statistics
- **Election management** — create elections with multiple categories
- **Candidate management** — add candidates per category with manifesto
- **Ballot casting** — step-by-step vote with preview before submit
- **Duplicate vote prevention** — one vote per voter per election
- **Live results** with bar charts and pie charts (Recharts)
- **JWT authentication** for both voters and admins
- **Responsive UI** — works on mobile and desktop

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| Charts | Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| HTTP Client | Axios |

---

## 📝 Sample Workflow

1. **Admin** logs in → creates an election (e.g. "Student Council 2024") with categories: "President, Secretary, Treasurer"
2. **Admin** adds candidates to each category
3. **Admin** creates voter accounts with IDs and passwords
4. **Voters** log in with their Voter ID → see active elections → cast ballots
5. After the election ends → **Admin** views detailed results with charts

---

## 🔒 Security Notes

- Passwords are hashed with bcrypt (salt rounds: 12)
- JWT tokens expire in 7 days (configurable)
- Each voter can only vote once per election (enforced at DB level with unique index)
- Admin routes are protected by role-based middleware
- Change `JWT_SECRET` and `ADMIN_SETUP_KEY` before deploying to production
