import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import AuthPage from './components/auth/AuthPage';
import MainApp from './components/MainApp';
import ToastContainer from './components/common/ToastContainer';
import Loading from './components/common/Loading';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Loading fullScreen text="Loading application..." />;
  }

  return user ? <MainApp /> : <AuthPage />;
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
        <ToastContainer />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;