import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Footer from './components/Layout/Footer';
import Chatbot from './components/Chatbot/Chatbot';
import GuestBanner from './components/Common/GuestBanner';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetails from './pages/PropertyDetails';
import Login from './pages/Login';
import PostProperty from './pages/PostProperty';
import Compare from './pages/Compare';
import Profile from './pages/Profile';
import MakeOffer from './pages/MakeOffer';
import AdminDashboard from './pages/AdminDashboard';

import './App.css';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const isAuthPage     = location.pathname === '/login' || location.pathname === '/register';
  const isLandingPage  = location.pathname === '/';
  const isPostPage      = location.pathname === '/post-property';
  const isMakeOfferPage = location.pathname.startsWith('/make-offer');
  const hideNavFooter   = isAuthPage || isLandingPage || isPostPage || isMakeOfferPage;
  const hasHeader       = !hideNavFooter;

  // Guest detection
  const isLoggedIn = !!localStorage.getItem('mp_token');
  const isGuest    = sessionStorage.getItem('mp_guest') === 'true';
  const showGuestBanner = !isLoggedIn && isGuest && hasHeader;

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  return (
    <div className={`App${hasHeader ? ' has-header' : ''}${showGuestBanner ? ' has-guest-banner' : ''}`}>

      {/* Guest top banner */}
      {showGuestBanner && <GuestBanner />}

      {hasHeader && (
        <>
          <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </>
      )}

      <main>
        <Routes>
          {/* Public */}
          <Route path="/"         element={<Landing />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Login />} />

          {/* Guest-allowed (read-only browsing) */}
          <Route path="/home"           element={<Home />} />
          <Route path="/properties"     element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />

          {/* Protected – must be logged in */}
          <Route path="/post-property"          element={<ProtectedRoute><PostProperty /></ProtectedRoute>} />
          <Route path="/compare"                element={<ProtectedRoute><Compare /></ProtectedRoute>} />
          <Route path="/profile"                element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/make-offer/:propertyId" element={<ProtectedRoute><MakeOffer /></ProtectedRoute>} />
          
          {/* Admin */}
          <Route path="/admin/dashboard"        element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </main>

      {hasHeader && <Footer />}
      {!isAuthPage && !isLandingPage && <Chatbot />}
    </div>
  );
}

export default App;
