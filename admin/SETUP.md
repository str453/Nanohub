# Admin Dashboard Setup Guide

## Quick Start

1. **Navigate to the admin directory:**
   ```bash
   cd admin
   ```

2. **Install dependencies (if not already installed):**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Access the admin dashboard:**
   - Open your browser and go to: **http://localhost:5173**
   - The admin dashboard runs on port **5173** (configured in `vite.config.js`)

## Prerequisites

Before running the admin dashboard, make sure:

1. **Backend API is running:**
   - The backend should be running on `http://localhost:5000`
   - Start it from the `backend` directory with:
     ```bash
     cd backend
     npm start
     # or
     node server.js
     ```

2. **Main app is running (for login):**
   - The main app should be running on `http://localhost:3000`
   - This is where you login as an admin user
   - After login, you'll be redirected to the admin dashboard

## How It Works

1. **Login Flow:**
   - Go to `http://localhost:3000` (main app)
   - Login with an admin account
   - You'll be automatically redirected to `http://localhost:5173` (admin dashboard)
   - Your authentication token is passed via URL parameters

2. **Port Configuration:**
   - Admin dashboard port: **5173** (configured in `admin/vite.config.js`)
   - Backend API port: **5000** (configured in `backend/server.js`)
   - Main app port: **3000** (configured in main app)

## Changing the Port

If you need to change the admin dashboard port:

1. **Update `admin/vite.config.js`:**
   ```javascript
   server: {
     port: YOUR_PORT_NUMBER, // Change this
   }
   ```

2. **Update `src/Pages/LoginSignUp.jsx` (line 178):**
   ```javascript
   window.location.href = `http://localhost:YOUR_PORT_NUMBER?token=...`;
   ```

## Troubleshooting

- **Port already in use?** 
  - Kill the process using port 5173: `lsof -ti:5173 | xargs kill -9`
  - Or change the port in `vite.config.js`

- **"No token found" error?**
  - Make sure you're logging in through the main app first
  - The token is passed via URL parameters on redirect

- **API connection errors?**
  - Verify the backend is running on port 5000
  - Check `admin/src/services/api.js` for the API base URL

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

