const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config();

const app = express();

// Trust proxy for Render deployment to get correct protocol
app.set('trust proxy', 1);

// Set up storage for uploaded files
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });


// Middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowed = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://manyprop-frontend.onrender.com',
      'https://manyprop.onrender.com',
    ];
    // Allow requests with no origin (e.g. curl, mobile apps)
    if (!origin) return callback(null, true);
    // Allow any onrender.com or vercel.app subdomain (covers preview deploys)
    if (origin.includes('.onrender.com') || origin.includes('.vercel.app') || origin.includes('localhost')) {
      return callback(null, true);
    }
    if (allowed.includes(origin)) return callback(null, true);
    return callback(null, true); // Permissive for now; tighten in production
  },
  credentials: true,
}));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// File Upload Route
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  // Construct URL. Using full URL to support cross-domain frontend
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// Routes
app.use('/api/properties', require('./routes/properties'));
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/news', require('./routes/news'));
app.use('/api/offers', require('./routes/offers'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/enquiries', require('./routes/enquiries'));
app.use('/api/analysis', require('./routes/analysis'));
app.use('/api/agent', require('./routes/agent'));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/manyprop', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
  res.send('ManyProp API is running!');
});

app.get('/api', (req, res) => {
  res.json({ message: 'ManyProp API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});