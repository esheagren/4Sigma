import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Lock } from 'lucide-react';
import AuthModal from './AuthModal';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <div className="max-w-md mx-auto text-center py-16">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-8">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            
            <h2 className="text-2xl font-semibold mb-2">Sign In Required</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              You need to be signed in to access this page.
            </p>
            
            <button
              onClick={() => setShowAuthModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              <LogIn size={18} />
              Sign In
            </button>
          </div>
        </div>

        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute; 