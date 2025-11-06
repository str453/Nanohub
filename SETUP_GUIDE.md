# Nanohub Setup Guide for Beginners 🚀

This guide will help you run the Nanohub e-commerce project on your local machine, even if you're new to React, JavaScript, and MongoDB.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Understanding the Project Structure](#understanding-the-project-structure)
3. [MongoDB Setup](#mongodb-setup)
4. [Backend Setup](#backend-setup)
5. [Frontend Setup](#frontend-setup)
6. [Running the Full Application](#running-the-full-application)
7. [Common Issues & Troubleshooting](#common-issues--troubleshooting)
8. [Key Concepts Explained](#key-concepts-explained)

---

## Prerequisites

Before starting, you need to install these tools:

### 1. **Node.js and npm** (JavaScript Runtime)
- **What it is**: Node.js lets you run JavaScript code on your computer (not just in a browser). npm is a package manager that comes with Node.js.
- **Check if installed**: Open terminal and run:
  ```bash
  node --version
  npm --version
  ```
- **If not installed**: Download from [nodejs.org](https://nodejs.org/) (choose LTS version)

### 2. **MongoDB** (Database)
You have two options:

#### Option A: MongoDB Atlas (Cloud - Recommended for Beginners)
- **What it is**: Free cloud-hosted MongoDB database
- **Setup**:
  1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
  2. Sign up for a free account
  3. Create a new cluster (free tier)
  4. Click "Connect" → "Connect your application"
  5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/...`)

#### Option B: MongoDB Local Installation
- **What it is**: Install MongoDB on your own computer
- **Setup**:
  1. Download from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
  2. Install following the installer instructions
  3. Start MongoDB service:
     - **Linux**: `sudo systemctl start mongod`
     - **Mac**: `brew services start mongodb-community`
     - **Windows**: MongoDB runs as a service automatically after installation

---

## Understanding the Project Structure

```
Nanohub/
├── backend/              # Server-side code (API, database logic)
│   ├── server.js        # Main backend server file
│   ├── routes/          # API endpoints (product, auth, user)
│   ├── models/          # Database schemas (Product, User, Order)
│   ├── config/          # Database connection setup
│   └── csvFiles/        # Product data to import
│
├── src/                 # Frontend React code (what users see)
│   ├── Components/      # Reusable UI pieces (Navbar, Footer, etc.)
│   ├── Pages/           # Different pages (Shop, Cart, Login)
│   └── App.js          # Main React component
│
├── admin/              # Admin panel (separate React app)
│
└── package.json        # Frontend dependencies and scripts
```

---

## MongoDB Setup

### Step 1: Get Your Connection String

**If using MongoDB Atlas (Cloud)**:
- Your connection string looks like: `mongodb+srv://username:password@cluster.mongodb.net/nanohub?retryWrites=true&w=majority`
- Replace `<password>` with your actual password
- Replace `test` with `nanohub` (your database name)

**If using Local MongoDB**:
- Your connection string is: `mongodb://localhost:27017/nanohub`

### Step 2: Create Environment File

The backend needs this connection string. Create a file called `.env` in the `backend/` folder:

```bash
cd backend/
touch .env
```

Edit the `.env` file and add:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/nanohub
# OR if using Atlas:
# MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/nanohub?retryWrites=true&w=majority

# Server Port
PORT=5000

# JWT Secret (for authentication - can be any random string)
JWT_SECRET=your-secret-key-here-change-this-in-production
```

**Important**: Replace the connection string with your actual MongoDB connection string!

---

## Backend Setup

The backend is a Node.js server that handles data and API requests.

### Step 1: Navigate to Backend Folder
```bash
cd backend/
```

### Step 2: Install Dependencies
This downloads all the required packages (like Express, Mongoose, etc.)
```bash
npm install
```

**What this does**: Reads `package.json` and installs all listed dependencies into `node_modules/` folder.

### Step 3: Import Product Data (Optional but Recommended)
Your project has CSV files with product data. Let's import them:

```bash
node import-cpus.js
node import-gpus.js
node import-monitors.js
node import-motherboards.js
node import-ram.js
```

**What this does**: Reads CSV files and adds products to your MongoDB database.

### Step 4: Start Backend Server
```bash
npm run dev
```

**What this does**: Starts the Express server on port 5000 (with auto-restart on changes)

You should see:
```
Server running on port 5000
MongoDB Connected: your-mongodb-host
```

✅ **Backend is now running!** Keep this terminal window open.

---

## Frontend Setup

The frontend is the React application users interact with.

### Step 1: Open New Terminal Window
Keep the backend running in the first terminal. Open a new terminal window.

### Step 2: Navigate to Project Root
```bash
cd /home/jake/Desktop/Cal\ State\ University\ Fullerton/CPSC\ 491\ -\ Senior\ Capstone\ Project/Nanohub/
```

### Step 3: Install Dependencies
```bash
npm install
```

**What this does**: Installs React and all frontend packages.

### Step 4: Start Frontend Development Server
```bash
npm start
```

**What this does**: Starts the React development server on port 3000 and opens your browser automatically.

You should see:
```
Compiled successfully!

You can now view nano-hub in the browser.

  Local:            http://localhost:3000
```

✅ **Frontend is now running!**

---

## Running the Full Application

You should now have:
1. **MongoDB** running (either Atlas in cloud or local service)
2. **Backend** running on `http://localhost:5000` (Terminal 1)
3. **Frontend** running on `http://localhost:3000` (Terminal 2)

### Test It:
1. Open browser to `http://localhost:3000` - You should see the Nanohub homepage
2. Navigate to product pages
3. Try logging in / signing up
4. Add items to cart

### Architecture Flow:
```
User Browser (Frontend)
    ↓ 
http://localhost:3000
    ↓
React App makes API requests
    ↓
http://localhost:5000/api/*
    ↓
Backend (Express Server)
    ↓
MongoDB Database
```

---

## Common Issues & Troubleshooting

### Issue 1: "Cannot find module" error
**Solution**: Make sure you ran `npm install` in both root folder and backend folder

### Issue 2: "EADDRINUSE: address already in use"
**Problem**: Port 3000 or 5000 is already being used
**Solution**: 
- Find and kill the process: `lsof -ti:5000 | xargs kill -9` (for port 5000)
- Or change the port in backend `.env` file

### Issue 3: "MongoServerError: connection refused"
**Problem**: MongoDB is not running or connection string is wrong
**Solution**:
- Check if MongoDB service is running: `sudo systemctl status mongod`
- Verify your connection string in `backend/.env`
- Make sure you replaced `<password>` with actual password (Atlas)

### Issue 4: Backend runs but no data appears
**Problem**: Products not imported yet
**Solution**: Run the import scripts (see Backend Setup Step 3)

### Issue 5: "Module not found: Can't resolve 'axios'"
**Problem**: Missing dependencies
**Solution**: Run `npm install` again in the appropriate folder

---

## Key Concepts Explained

### What is React?
- **React** is a JavaScript library for building user interfaces
- It breaks the UI into reusable "components" (like Lego blocks)
- Example: Navbar component, Footer component, Product card component
- When data changes, React automatically updates the page

### What is Express?
- **Express** is a web server framework for Node.js
- It handles HTTP requests (GET, POST, PUT, DELETE)
- Routes define what happens when someone visits a URL
- Example: When user visits `/api/product`, Express returns product data

### What is MongoDB?
- **MongoDB** is a NoSQL database (stores data as JSON-like documents)
- Unlike SQL databases (tables with rows), MongoDB uses "collections" with "documents"
- Example document:
  ```json
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Intel Core i9",
    "price": 499.99,
    "category": "CPU"
  }
  ```

### What is Mongoose?
- **Mongoose** is a library that makes working with MongoDB easier in Node.js
- It defines "schemas" (blueprints) for your data
- Example: Product schema defines what fields a product must have

### What does npm do?
- **npm** (Node Package Manager) manages JavaScript packages/libraries
- `package.json` lists what packages your project needs
- `npm install` downloads those packages
- `node_modules/` folder stores the downloaded code

### API Endpoints
Your backend has these main endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/product` | GET | Get all products |
| `/api/product/:number` | GET | Get specific product by ID |
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login user |
| `/api/user/profile` | GET | Get user profile |

---

## What About Docker?

**Docker** is for deployment, not local development. Here's what it does:

### The Dockerfile:
- Creates a container (isolated environment) with your app
- Ensures your app runs the same way on any computer
- Used when deploying to production servers (AWS, etc.)

### You DON'T need Docker for:
- Local development
- Running the project on your machine
- Learning and testing

### You WOULD use Docker for:
- Deploying to production
- Sharing exact environment with team
- Running multiple services together (Docker Compose)

For now, **ignore Docker** and use the npm commands above!

---

## Quick Start Commands (Summary)

### First Time Setup:
```bash
# 1. Install backend dependencies
cd backend/
npm install

# 2. Create .env file with MongoDB connection
echo "MONGODB_URI=mongodb://localhost:27017/nanohub" > .env
echo "PORT=5000" >> .env
echo "JWT_SECRET=your-secret-key" >> .env

# 3. Import product data
node import-cpus.js
node import-gpus.js
node import-monitors.js
node import-motherboards.js
node import-ram.js

# 4. Install frontend dependencies
cd ..
npm install
```

### Every Time You Want to Run:
```bash
# Terminal 1: Start backend
cd backend/
npm run dev

# Terminal 2: Start frontend
cd /path/to/Nanohub/
npm start
```

---

## Need More Help?

- **React Tutorial**: https://react.dev/learn
- **Express Tutorial**: https://expressjs.com/en/starter/hello-world.html
- **MongoDB Tutorial**: https://www.mongodb.com/docs/manual/tutorial/getting-started/
- **JavaScript Basics**: https://developer.mozilla.org/en-US/docs/Learn/JavaScript

---

**Happy Coding! 🎉**

If you run into issues not covered here, check the terminal error messages - they often tell you exactly what's wrong!

