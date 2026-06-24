import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

// ====================================================================
// 🔒 ADMIN ROUTE GUARD (Secures nested admin namespaces)
// ====================================================================
const ProtectedRoute = () => {
  const location = useLocation();
  
  // Production Standard Identity Recovery: Checks strictly for Admin clearance
  const isAdminAuthenticated = localStorage.getItem('adm_tk');

  if (!isAdminAuthenticated) {
    // We send unauthenticated users to /login, but save the current location they tried to access.
    // This allows them to be redirected back after successful login matrix validation.
    console.warn(`🛡️ [GUARD ALERT]: Unauthenticated attempt to access secured path: ${location.pathname}. Redirecting matrix flow to login.`);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  //authorized, render children (Outlet) matrix pipeline
  return <Outlet />;
};

export default ProtectedRoute;