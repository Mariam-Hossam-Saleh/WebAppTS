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

// Account Schema (Admin-controlled list)
const accountSchema = new mongoose.Schema({
  accountName: { type: String, required: true, unique: true },
  accountCode: { type: String, required: true },
  accountType: { type: String, required: true },
  accountTypeCode: { type: String, required: true },
  subAccount: String,
  subAccountCode: String,
  financialStatement: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Employee Schema (Admin-controlled list)
const employeeSchema = new mongoose.Schema({
  employee: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Project under Construction Schema (Admin-controlled list)
const projectSchema = new mongoose.Schema({
  projectName: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Simplified Accounting Record Schema
const accountingSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  expenseFrom: { type: String, required: true }, // Account Name
  expenseFromDetails: {
    accountName: String,
    accountCode: String,
    accountType: String,
    accountTypeCode: String,
    subAccount: String,
    subAccountCode: String,
    financialStatement: String
  },
  paidTo: { type: String, required: true }, // Account Name
  paidToDetails: {
    accountName: String,
    accountCode: String,
    accountType: String,
    accountTypeCode: String,
    subAccount: String,
    subAccountCode: String,
    financialStatement: String
  },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  employeeName: { type: String, required: true },
  employeeDetails: {
    employee: String,
    title: String,
    code: String
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);
const Account = mongoose.model("Account", accountSchema);
const Employee = mongoose.model("Employee", employeeSchema);
const Project = mongoose.model("Project", projectSchema);
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
// Get all accounts (for dropdowns)
app.get("/api/accounts", authenticateToken, async (req, res) => {
  try {
    const accounts = await Account.find().sort({ accountName: 1 });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching accounts', error: error.message });
  }
});

// Get all employees (for dropdowns)
app.get("/api/employees", authenticateToken, async (req, res) => {
  try {
    const employees = await Employee.find().sort({ employee: 1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employees', error: error.message });
  }
});

// Get all projects (for dropdowns)
app.get("/api/projects", authenticateToken, async (req, res) => {
  try {
    const projects = await Project.find().sort({ projectName: 1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
});

// ACCOUNT MANAGEMENT (Admin only)
// Create account
app.post("/api/accounts", authenticateToken, requireRole(['Admin']), async (req, res) => {
  try {
    const account = new Account({
      ...req.body,
      createdBy: req.user._id
    });
    await account.save();
    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ message: 'Error creating account', error: error.message });
  }
});

// Update account
app.patch("/api/accounts/:id", authenticateToken, requireRole(['Admin']), async (req, res) => {
  try {
    const account = await Account.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    res.json(account);
  } catch (error) {
    res.status(500).json({ message: 'Error updating account', error: error.message });
  }
});

// Delete account
app.delete("/api/accounts/:id", authenticateToken, requireRole(['Admin']), async (req, res) => {
  try {
    const account = await Account.findByIdAndDelete(req.params.id);
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting account', error: error.message });
  }
});

// EMPLOYEE MANAGEMENT (Admin only)
// Create employee
app.post("/api/employees", authenticateToken, requireRole(['Admin']), async (req, res) => {
  try {
    const employee = new Employee({
      ...req.body,
      createdBy: req.user._id
    });
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Error creating employee', error: error.message });
  }
});

// Update employee
app.patch("/api/employees/:id", authenticateToken, requireRole(['Admin']), async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Error updating employee', error: error.message });
  }
});

// Delete employee
app.delete("/api/employees/:id", authenticateToken, requireRole(['Admin']), async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting employee', error: error.message });
  }
});

// PROJECT MANAGEMENT (Admin only)
// Create project
app.post("/api/projects", authenticateToken, requireRole(['Admin']), async (req, res) => {
  try {
    const project = new Project({
      ...req.body,
      createdBy: req.user._id
    });
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error creating project', error: error.message });
  }
});

// Update project
app.patch("/api/projects/:id", authenticateToken, requireRole(['Admin']), async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error updating project', error: error.message });
  }
});

// Delete project
app.delete("/api/projects/:id", authenticateToken, requireRole(['Admin']), async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project', error: error.message });
  }
});

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
    // Fetch account details for expenseFrom
    const expenseFromAccount = await Account.findOne({ accountName: req.body.expenseFrom });
    const paidToAccount = await Account.findOne({ accountName: req.body.paidTo });
    const employee = await Employee.findOne({ employee: req.body.employeeName });

    if (!expenseFromAccount || !paidToAccount) {
      return res.status(400).json({ message: 'Invalid account selection' });
    }

    if (!employee) {
      return res.status(400).json({ message: 'Invalid employee selection' });
    }

    const recordData = {
      date: req.body.date,
      expenseFrom: req.body.expenseFrom,
      expenseFromDetails: {
        accountName: expenseFromAccount.accountName,
        accountCode: expenseFromAccount.accountCode,
        accountType: expenseFromAccount.accountType,
        accountTypeCode: expenseFromAccount.accountTypeCode,
        subAccount: expenseFromAccount.subAccount,
        subAccountCode: expenseFromAccount.subAccountCode,
        financialStatement: expenseFromAccount.financialStatement
      },
      paidTo: req.body.paidTo,
      paidToDetails: {
        accountName: paidToAccount.accountName,
        accountCode: paidToAccount.accountCode,
        accountType: paidToAccount.accountType,
        accountTypeCode: paidToAccount.accountTypeCode,
        subAccount: paidToAccount.subAccount,
        subAccountCode: paidToAccount.subAccountCode,
        financialStatement: paidToAccount.financialStatement
      },
      description: req.body.description,
      price: req.body.price,
      employeeName: req.body.employeeName,
      employeeDetails: {
        employee: employee.employee,
        title: employee.title,
        code: employee.code
      },
      createdBy: req.user._id,
      lastModifiedBy: req.user._id
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
    // Fetch updated account and employee details if changed
    const updateData = {
      ...req.body,
      lastModifiedBy: req.user._id,
      updatedAt: new Date()
    };

    // If accounts changed, update details
    if (req.body.expenseFrom) {
      const expenseFromAccount = await Account.findOne({ accountName: req.body.expenseFrom });
      if (expenseFromAccount) {
        updateData.expenseFromDetails = {
          accountName: expenseFromAccount.accountName,
          accountCode: expenseFromAccount.accountCode,
          accountType: expenseFromAccount.accountType,
          accountTypeCode: expenseFromAccount.accountTypeCode,
          subAccount: expenseFromAccount.subAccount,
          subAccountCode: expenseFromAccount.subAccountCode,
          financialStatement: expenseFromAccount.financialStatement
        };
      }
    }

    if (req.body.paidTo) {
      const paidToAccount = await Account.findOne({ accountName: req.body.paidTo });
      if (paidToAccount) {
        updateData.paidToDetails = {
          accountName: paidToAccount.accountName,
          accountCode: paidToAccount.accountCode,
          accountType: paidToAccount.accountType,
          accountTypeCode: paidToAccount.accountTypeCode,
          subAccount: paidToAccount.subAccount,
          subAccountCode: paidToAccount.subAccountCode,
          financialStatement: paidToAccount.financialStatement
        };
      }
    }

    if (req.body.employeeName) {
      const employee = await Employee.findOne({ employee: req.body.employeeName });
      if (employee) {
        updateData.employeeDetails = {
          employee: employee.employee,
          title: employee.title,
          code: employee.code
        };
      }
    }

    const record = await AccountingRecord.findByIdAndUpdate(
      req.params.id,
      updateData,
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

// Update user (Admin only)
app.patch("/api/users/:id", authenticateToken, requireRole(['Admin']), async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Hash password if it's being updated
    if (updateData.password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(updateData.password, saltRounds);
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

// Delete user (Admin only)
app.delete("/api/users/:id", authenticateToken, requireRole(['Admin']), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
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