import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Footer from './components/Layout/Footer';
import Chatbot from './components/Chatbot/Chatbot';
import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetails from './pages/PropertyDetails';
import Login from './pages/Login';
import PostProperty from './pages/PostProperty';
import Compare from './pages/Compare';
import Profile from './pages/Profile';
import './App.css';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isPostPropertyPage = location.pathname === '/post-property';
  const hideNavFooter = isAuthPage || isPostPropertyPage;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="App">
      {!hideNavFooter && (
        <>
          <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </>
      )}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login />} />
          <Route path="/post-property" element={<PostProperty />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
      {!hideNavFooter && <Footer />}
      {!isAuthPage && <Chatbot />}
    </div>
  );
}

export default App;
