import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'; 

// ====================================================================
// 🛡️ 1. NORMAL USER ROUTE GUARD (For /user/profile, /checkout, etc.)
// ====================================================================
const ProtectedRoute = () => {
  // Use AuthContext to check if a normal user is logged in
  const { currentUser, loading } = useContext(AuthContext);
  const location = useLocation();

  // Wait for the context to finish loading before making a decision
  // Isse page refresh karne par user logout nahi hoga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F7F2]">
        <span className="text-xs uppercase tracking-widest font-bold text-[#b5862a] animate-pulse">
          Verifying Access...
        </span>
      </div>
    );
  }

  // If completely loaded and no user is found, redirect to regular login
  if (!currentUser) {
    console.warn(`🛡️ [USER GUARD ALERT]: Unauthenticated attempt to access: ${location.pathname}`);
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Authorized normal user, render children (Outlet)
  return <Outlet />;
};

// ====================================================================
// 👑 2. ADMIN ROUTE GUARD (Secures nested admin namespaces)
// ====================================================================
export const AdminRoute = () => {
  const location = useLocation();
  
  // Production Standard Identity Recovery: Checks strictly for Admin clearance
  const isAdminAuthenticated = localStorage.getItem('adm_tk');

  if (!isAdminAuthenticated) {
    console.warn(`🚨 [ADMIN GUARD ALERT]: Unauthorized attempt to access admin path: ${location.pathname}`);
    // If admin auth fails, redirect them to the Admin Secret Gate, NOT the normal user login
    return <Navigate to="/designer-studio-gate" state={{ from: location }} replace />;
  }

  // Authorized Admin, render children (Outlet) matrix pipeline
  return <Outlet />;
};

// Default export is the normal user guard
export default ProtectedRoute;