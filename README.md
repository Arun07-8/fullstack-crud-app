Fullstack User Management Application
🔹 Project Overview

This is a fullstack user management application built with React (frontend), Tailwind CSS for styling, Node.js + Express (backend), MongoDB database, and JWT token authentication.

Users can be added, edited, blocked/unblocked, deleted, with live search and pagination.

🔹 Features

Frontend (React + Tailwind)

Responsive UI

User table with 5 users per page

Latest users appear first

Live search by name, email, or phone

Modal for adding/editing users

SweetAlert2 for block/unblock and delete confirmation

Backend (Express + Node.js)

RESTful API endpoints for CRUD operations

JWT authentication for secure routes

MongoDB database integration

Pagination support

Authentication

Admin login using JWT tokens

Protected API routes

Other Features

Toast notifications for actions

Clean single-page layout with side navigation

🔹 Tech Stack
Layer	Technology
Frontend	React, Tailwind CSS
Backend	Node.js, Express.js
Database	MongoDB
Auth	JWT (JSON Web Tokens)
UI Alerts	SweetAlert2, React-Toastify
Dev Tools	Axios, Vite
🔹 Installation
1. Clone the repository
git clone https://github.com/your-username/your-repo.git
cd fullstack-crud-app
2. Backend Setup
cd backend
npm install
# create .env with MONGO_URI and JWT_SECRET
npm run dev
3. Frontend Setup
cd frontend
npm install
npm run dev

Frontend runs on: http://localhost:5173

Backend runs on: http://localhost:5000

🔹 API Endpoints (Backend)
Method	Endpoint	Description
POST	/admin/login	Admin login
POST	/admin/logout	Admin logout
GET	/admin/users	Get users with pagination
POST	/admin/create-user	Add new user
PUT	/admin/edit-user/:id	Edit user info
PATCH	/admin/block-user/:id	Block a user
PATCH	/admin/unblock-user/:id	Unblock a user
DELETE	/admin/delete-user/:id	Delete a user
🔹 Usage

Login as admin

View users table

Add, edit, block/unblock, or delete users

Use search bar for live filtering

Pagination shows 5 users per page
