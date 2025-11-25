# Backend Tests

This directory contains test scripts for verifying backend functionality.

## Test Files

### Database Tests

- **`test-db.js`** - Tests MongoDB connection and product queries
  - Tests: Connection, product counts, top expensive CPUs/GPUs, cheapest monitors, price ranges, brand queries, random products
  - Run: `node tests/test-db.js`

- **`test-models.js`** - Tests Mongoose models (Product, User)
  - Tests: Model validation, schema structure
  - Run: `node tests/test-models.js`

### User & Authentication Tests

- **`test-password.js`** - Verify which password works for a user
  - Tests: Password matching for specific user account
  - Run: `node tests/test-password.js`

- **`test-registration.js`** - Test user registration functionality
  - Tests: Creating new users with all required fields, validation
  - Run: `node tests/test-registration.js`

- **`test-username-check.js`** - Test username availability checking
  - Tests: Username uniqueness, case sensitivity, availability detection
  - Run: `node tests/test-username-check.js`

### Utility Scripts

- **`view-users.js`** - View all users/customers in the database
  - Features: Lists all users with details, shows admin users with passwords, summary by role
  - Run: `node tests/view-users.js`

## Running Tests

All tests should be run from the `backend/` directory:

```bash
cd backend
node tests/test-db.js
node tests/test-registration.js
# etc.
```

## Notes

- All tests require MongoDB connection (configured via `.env` file)
- Tests will automatically connect to the database using `MONGODB_URI` from `.env`
- Some tests create temporary data and clean up afterwards
- Make sure your backend server is not running when running tests (or use a separate test database)

