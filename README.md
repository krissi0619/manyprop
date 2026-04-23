# ManyProp - Real Estate Platform

A modern real estate website built with the MERN stack (MongoDB, Express.js, React, Node.js). Find, buy, rent, and sell properties with ease.

## Features

- 🏠 **Property Listings**: Browse extensive property listings with detailed information
- 🔍 **Advanced Search**: Filter properties by type, location, price, and more
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🏷️ **Property Categories**: Apartments, Villas, Independent Houses, Luxury Bungalows
- 📍 **Location-based Search**: Find properties in popular cities
- 👤 **User Authentication**: Secure login and registration system
- 📞 **Contact Agents**: Connect directly with property agents
- ⭐ **Featured Properties**: Highlighted recommended and trending properties

## Tech Stack

### Frontend
- **React.js** - UI Library
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **React Icons** - Icon library
- **Styled Components** - CSS-in-JS styling
- **Framer Motion** - Animations
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads
- **Cloudinary** - Image storage

## Project Structure

```
manyprop/
├── frontend/                 # React frontend application
│   ├── public/              # Static files
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   │   ├── Common/      # Shared components
│   │   │   ├── Home/        # Home page components
│   │   │   └── Layout/      # Layout components (Header, Footer)
│   │   ├── pages/           # Page components
│   │   ├── App.js           # Main App component
│   │   └── index.js         # Entry point
│   └── package.json
├── backend/                 # Node.js backend API
│   ├── models/              # MongoDB models
│   ├── routes/              # API routes
│   ├── server.js            # Express server
│   └── package.json
├── package.json             # Root package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### 1. Clone the repository
```bash
git clone <repository-url>
cd manyprop
```

### 2. Install dependencies
```bash
# Install concurrently for running both frontend and backend
npm install

# Install backend dependencies
npm run server-install

# Install frontend dependencies  
npm run client-install
```

### 3. Environment Setup
Create a `.env` file in the `backend` directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/manyprop

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here_replace_with_strong_secret

# Server Port
PORT=5000

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email (for contact forms)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

### 4. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# For local MongoDB installation
mongod

# Or use MongoDB Atlas cloud database
```

### 5. Run the application

#### Development Mode (both frontend and backend)
```bash
npm run dev
```

#### Run separately
```bash
# Backend only (port 5000)
npm run server

# Frontend only (port 3000)
npm run client
```

## API Endpoints

### Properties
- `GET /api/properties` - Get all properties with filtering
- `GET /api/properties/:id` - Get single property
- `POST /api/properties` - Create new property (requires auth)
- `PUT /api/properties/:id` - Update property (requires auth)
- `DELETE /api/properties/:id` - Delete property (requires auth)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user

## Features Implementation

### Property Search & Filtering
- Search by location, property type, price range, bedrooms
- Filter by property categories (apartment, villa, etc.)
- City-based property listings
- Featured, recommended, and trending properties

### User Interface
- Modern, responsive design matching the provided Figma design
- Property cards with images, pricing, and details
- Search bar with multiple filters
- Navigation with property categories
- Contact agent functionality

### Data Management
- MongoDB collections for properties and users
- Property model with comprehensive fields
- User authentication and authorization
- Image upload and management

## Deployment

### Frontend (Netlify/Vercel)
```bash
cd frontend
npm run build
```

### Backend (Heroku/Railway)
```bash
# Set environment variables
# Deploy backend to your preferred platform
```

### Database (MongoDB Atlas)
- Create MongoDB Atlas account
- Set up cluster and get connection string
- Update MONGODB_URI in environment variables

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@manyprop.com or create an issue in the repository.

---

**ManyProp** - Your trusted partner in real estate. Find your dream property with ease and confidence.