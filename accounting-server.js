import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/accounting-db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Accountant'], required: true },
  createdAt: { type: Date, default: Date.now }
});

// Accounting Record Schema (based on your requirements)
const accountingSchema = new mongoose.Schema({
  fs: String,
  accountType: String,
  subAccount: String,
  date: { type: Date, required: true },
  accountName: { type: String, required: true },
  projectsUnderConstruction: String,
  previousProjects: String,
  editorName: { type: String, required: true },
  item: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  brand: String,
  type: String,
  part: String,
  day: Number,
  month: Number,
  year: Number,
  notes: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);
const AccountingRecord = mongoose.model("AccountingRecord", accountingSchema);

// Middleware for JWT verification
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = await User.findById(decoded.userId);
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Role-based access middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};

// AUTH ROUTES
// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Business Accounting Software API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        me: 'GET /api/auth/me'
      },
      records: {
        getAll: 'GET /api/records',
        create: 'POST /api/records',
        update: 'PATCH /api/records/:id',
        delete: 'DELETE /api/records/:id'
      },
      users: 'GET /api/users'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Accounting Server is running',
    timestamp: new Date().toISOString() 
  });
});

// Register new user (Admin only)
app.post("/api/auth/register", authenticateToken, requireRole(['Admin']), async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      username,
      password: hashedPassword,
      role
    });

    await user.save();
    res.status(201).json({ message: 'User created successfully', userId: user._id });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Get current user
app.get("/api/auth/me", authenticateToken, (req, res) => {
  res.json({
    id: req.user._id,
    username: req.user.username,
    role: req.user.role
  });
});

// ACCOUNTING RECORDS ROUTES
// Get all records
app.get("/api/records", authenticateToken, async (req, res) => {
  try {
    const records = await AccountingRecord.find()
      .populate('createdBy', 'username')
      .populate('lastModifiedBy', 'username')
      .sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching records', error: error.message });
  }
});

// Create new record
app.post("/api/records", authenticateToken, async (req, res) => {
  try {
    const recordData = {
      ...req.body,
      createdBy: req.user._id,
      lastModifiedBy: req.user._id,
      editorName: req.user.username
    };

    const record = new AccountingRecord(recordData);
    await record.save();
    
    // Populate the response
    await record.populate('createdBy', 'username');
    await record.populate('lastModifiedBy', 'username');
    
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: 'Error creating record', error: error.message });
  }
});

// Update record
app.patch("/api/records/:id", authenticateToken, async (req, res) => {
  try {
    const record = await AccountingRecord.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        lastModifiedBy: req.user._id,
        editorName: req.user.username,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('createdBy', 'username').populate('lastModifiedBy', 'username');

    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.json(record);
  } catch (error) {
    res.status(500).json({ message: 'Error updating record', error: error.message });
  }
});

// Delete record (Admin only)
app.delete("/api/records/:id", authenticateToken, requireRole(['Admin']), async (req, res) => {
  try {
    const record = await AccountingRecord.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting record', error: error.message });
  }
});

// USER MANAGEMENT ROUTES (Admin only)
// Get all users
app.get("/api/users", authenticateToken, requireRole(['Admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Create default admin user if no users exist
async function createDefaultAdmin() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new User({
        username: 'admin',
        password: hashedPassword,
        role: 'Admin'
      });
      await admin.save();
      console.log('✅ Default admin user created (username: admin, password: admin123)');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
}

// Initialize default admin
createDefaultAdmin();

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Accounting Server running on port ${PORT}`);
});