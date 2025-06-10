import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import ForgotPassword from './ForgotPassword';

type AuthView = 'login' | 'register' | 'forgotPassword';

const AuthPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<AuthView>('login');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'login':
        return (
          <Login
            onSwitchToRegister={() => setCurrentView('register')}
            onSwitchToForgotPassword={() => setCurrentView('forgotPassword')}
          />
        );
      case 'register':
        return (
          <Register
            onSwitchToLogin={() => setCurrentView('login')}
          />
        );
      case 'forgotPassword':
        return (
          <ForgotPassword
            onSwitchToLogin={() => setCurrentView('login')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {renderCurrentView()}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;