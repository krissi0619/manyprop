const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

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

// Routes
app.use('/api/properties', require('./routes/properties'));
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/news', require('./routes/news'));
app.use('/api/offers', require('./routes/offers'));

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