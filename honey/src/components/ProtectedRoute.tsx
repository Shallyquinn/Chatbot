import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: 'admin' | 'agent';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      console.log('🔐 ProtectedRoute Authentication Check:');
      console.log('  Required Role:', requiredRole);
      console.log('  Has Token:', !!token);
      console.log('  Has User Data:', !!userStr);

      if (!token || !userStr) {
        console.log('❌ Missing token or user data');
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const user = JSON.parse(userStr);
        console.log('  User Type:', user.type);
        console.log('  User Email:', user.email);
        console.log('  User Name:', user.name);
        
        const isAuth = user.type === requiredRole;
        
        if (isAuth) {
          console.log('✅ Authentication successful - User has correct role');
        } else {
          console.log('❌ Authentication failed - Role mismatch');
          console.log(`  Expected: ${requiredRole}, Got: ${user.type}`);
        }
        
        setIsAuthenticated(isAuth);
      } catch (error) {
        console.error('❌ Failed to parse user data:', error);
        console.log('  Clearing invalid user data from localStorage');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      }

      setIsLoading(false);
    };

    // Small delay to ensure localStorage is fully written after login
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [requiredRole]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#fffdf7]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#006045] mx-auto"></div>
          <p className="mt-4 text-[#7b7b7b]">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log(`🚫 Redirecting to login page: /${requiredRole}/login`);
    return <Navigate to={`/${requiredRole}/login`} replace />;
  }

  console.log('✅ Rendering protected content for', requiredRole);
  return <>{children}</>;
};

export default ProtectedRoute;
