import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * ProtectedRoute – only logged-in users can access.
 * Redirects to landing (/) if not authenticated.
 */
export const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('mp_token');
  const user  = localStorage.getItem('mp_user');
  const location = useLocation();

  if (!token || !user) {
    // Save attempted route so we can redirect after login
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return children;
};

/**
 * GuestAllowed – routes everyone can see, but with limited interactions.
 * Authenticated users and guests both pass through.
 */
export const GuestAllowed = ({ children }) => {
  return children;
};

export default ProtectedRoute;
