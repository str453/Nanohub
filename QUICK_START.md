# 🚀 Nanohub Quick Start Guide

## What is This Project?

**Nanohub** is an e-commerce web application for buying PC components. It consists of:

- **Frontend** (React): The website users see and interact with
- **Backend** (Node.js/Express): The server that handles data and logic
- **Database** (MongoDB): Where all data is stored

---

## 📋 Prerequisites

You need these installed:

1. **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
2. **MongoDB** - Choose ONE option:
   - **Option A**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free cloud database - easier!)
   - **Option B**: [Local MongoDB](https://www.mongodb.com/try/download/community) (Runs on your computer)

---

## ⚡ Quick Setup (5 Minutes)

### Step 1: Setup Backend

```bash
# Navigate to backend folder
cd backend/

# Install dependencies (downloads required packages)
npm install

# Copy the example environment file
cp .env.example .env

# Edit .env file and add your MongoDB connection string
# For local: MONGODB_URI=mongodb://localhost:27017/nanohub
# For Atlas: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nanohub
nano .env  # or use any text editor
```

### Step 2: Import Sample Data

```bash
# Still in backend/ folder
# These commands add products to your database
node import-cpus.js
node import-gpus.js
node import-monitors.js
node import-motherboards.js
node import-ram.js
```

### Step 3: Setup Frontend

```bash
# Go back to project root
cd ..

# Install frontend dependencies
npm install
```

---

## 🎮 Running the Application

You need **three terminal windows** open:

### Terminal 1 - Backend Server:
```bash
cd backend/
npm run dev
```
✅ You should see: `Server running on port 5000` and `MongoDB Connected`

### Terminal 2 - Frontend Server:
```bash
cd ..
npm start
```
✅ Browser should automatically open to `http://localhost:3000`

### Terminal 3 - Backend for Chat Bot:
```bash
node server.js
```
✅ You will see: API on 'http://localhost:3001'
✅ Mongo connected successfully
---

## 🎯 What's Running?

| Component | URL | Purpose |
|-----------|-----|---------|
| Frontend | http://localhost:3000 | The website UI |
| Backend API | http://localhost:5000 | Data and authentication |
| Groq API | http://localhost:3001 | API to access chatbot AI |
| MongoDB | (internal) | Database storage |

---

## 📂 Understanding the Code Structure

```
Nanohub/
│
├── backend/                      # Backend server (Node.js/Express)
│   ├── server.js                # Main server file - START HERE
│   ├── config/database.js       # MongoDB connection setup
│   ├── models/                  # Database schemas (what data looks like)
│   │   ├── Product.js          # Product data structure
│   │   ├── User.js             # User data structure
│   │   └── Order.js            # Order data structure
│   ├── routes/                  # API endpoints (URLs the frontend calls)
│   │   ├── product.js          # /api/product/* endpoints
│   │   ├── auth.js             # /api/auth/* endpoints
│   │   └── user.js             # /api/user/* endpoints
│   └── csvFiles/                # Product data to import
│
├── src/                         # Frontend React code
│   ├── App.js                  # Main React component - START HERE
│   ├── Components/              # Reusable UI pieces
│   │   ├── Navbar/             # Top navigation bar
│   │   ├── Footer/             # Bottom footer
│   │   ├── Hero/               # Homepage hero section
│   │   ├── ProductDisplay/     # Shows single product details
│   │   └── CartItems/          # Shopping cart display
│   ├── Pages/                   # Different pages of the website
│   │   ├── Shop.jsx            # Homepage/shop page
│   │   ├── Product.jsx         # Individual product page
│   │   ├── Cart.jsx            # Shopping cart page
│   │   └── LoginSignUp.jsx     # Login/register page
│   ├── Context/                 # State management (shared data)
│   │   ├── ShopContext.jsx     # Shopping cart and products state
│   │   └── AuthContext.jsx     # User authentication state
│   └── services/
│       └── api.js              # Functions to call backend API
│
├── admin/                       # Admin panel (separate app)
└── server.js                    # Main server for chat bot
```

---

## 🧩 How It All Works Together

```
┌─────────────────────────────────────────────────────────────┐
│  1. User opens browser → http://localhost:3000              │
│     (React Frontend)                                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ User clicks "View Products"
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  2. React sends HTTP request to:                            │
│     http://localhost:5000/api/product                       │
│     (Backend API)                                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Backend queries database
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  3. MongoDB returns product data                            │
│     (Database)                                               │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Backend sends JSON response
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  4. React receives data and displays products               │
│     (Frontend shows products to user)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Common Tasks

### View Backend API:
Open browser to: http://localhost:5000
You'll see all available API endpoints

### View Database (if using local MongoDB):
```bash
mongosh
use nanohub
db.products.find()  # See all products
db.users.find()     # See all users
```

### Stop the Servers:
Press `Ctrl + C` in both terminal windows

### Clear Database and Reimport:
```bash
cd backend/
node cleanup.js  # Removes all data
node import-cpus.js  # Import fresh data
```

---

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"
- **Local**: Make sure MongoDB service is running: `sudo systemctl start mongod`
- **Atlas**: Check your connection string has correct password and cluster name

### "Port 5000 already in use"
- Kill the process: `lsof -ti:5000 | xargs kill -9`
- Or change PORT in backend/.env

### "Module not found" errors
- Run `npm install` in both root and backend folders

### No products showing on website
- Make sure you ran the import scripts (Step 2 above)
- Check backend terminal for errors

---

## 📚 Learning Resources

### JavaScript Basics:
- [JavaScript.info](https://javascript.info/)
- [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)

### React:
- [Official React Tutorial](https://react.dev/learn)
- [React in 30 Minutes (Video)](https://www.youtube.com/watch?v=Ke90Tje7VS0)

### Node.js & Express:
- [Express Getting Started](https://expressjs.com/en/starter/installing.html)
- [Node.js Crash Course](https://www.youtube.com/watch?v=fBNz5xF-Kx4)

### MongoDB:
- [MongoDB University (Free)](https://learn.mongodb.com/)
- [MongoDB Crash Course](https://www.youtube.com/watch?v=-56x56UppqQ)

---

## 🎓 Understanding Key Files

### Backend Files:

**`backend/server.js`** - The heart of the backend
- Sets up Express server
- Connects to MongoDB
- Defines API routes
- Starts the server on port 5000

**`backend/config/database.js`** - Database connection
- Uses Mongoose to connect to MongoDB
- Reads connection string from .env file

**`backend/models/Product.js`** - Product Schema
- Defines what a "Product" looks like in the database
- Fields: name, price, category, image, etc.

**`backend/routes/product.js`** - Product API routes
- GET `/api/product` - Get all products
- GET `/api/product/:id` - Get one product
- POST `/api/product` - Create new product (admin only)

### Frontend Files:

**`src/App.js`** - Main React component
- Sets up routing (which page shows for which URL)
- Wraps app with Context providers

**`src/Pages/Shop.jsx`** - Homepage
- Shows featured products
- Hero banner
- Popular items

**`src/Components/Navbar/Navbar.jsx`** - Navigation bar
- Logo and links
- Shopping cart icon
- Login/logout

**`src/Context/ShopContext.jsx`** - Shopping cart state
- Manages what's in the cart
- Add/remove items
- Calculate total price

**`src/services/api.js`** - API helper functions
- Functions to call backend endpoints
- Example: `fetchAllProducts()`, `loginUser(credentials)`

---

## 🔑 Key Concepts

### What is an API?
- **A**pplication **P**rogramming **I**nterface
- A way for frontend and backend to communicate
- Frontend makes HTTP requests to API endpoints
- Backend responds with JSON data

### What is REST API?
- **RE**presentational **S**tate **T**ransfer
- Standard way to design APIs
- Uses HTTP methods: GET (read), POST (create), PUT (update), DELETE (delete)

### What is JSON?
```json
{
  "id": 1,
  "name": "Intel Core i9",
  "price": 499.99,
  "category": "CPU"
}
```
- JavaScript Object Notation
- Text format for sending data
- Easy for both humans and computers to read

### What is JWT?
- JSON Web Token
- Used for authentication
- When you log in, server gives you a token
- You send this token with future requests to prove who you are

---

## 💡 Pro Tips

1. **Keep terminals organized**: One for backend, one for frontend
2. **Check browser console** (F12) for frontend errors
3. **Check terminal output** for backend errors
4. **Use VS Code extensions**:
   - ES7+ React/Redux/React-Native snippets
   - ESLint
   - MongoDB for VS Code
5. **Git ignore**: Make sure `.env` is in `.gitignore` (never commit secrets!)

---

## 🎉 You're Ready!

If you've followed all steps above, you should now have:
- ✅ Backend running on port 5000
- ✅ Frontend running on port 3000
- ✅ MongoDB connected with sample data
- ✅ Website accessible in browser

**Next Steps**:
1. Explore the website at http://localhost:3000
2. Look at the code in VS Code
3. Make small changes and see what happens
4. Read the full [SETUP_GUIDE.md](SETUP_GUIDE.md) for deeper explanations

**Happy Coding!** 🚀

