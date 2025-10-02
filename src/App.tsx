import React, { useState, useEffect } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import FleetManagement from './components/Fleet/FleetManagement';
import ScheduleCalendar from './components/Schedule/ScheduleCalendar';
import ContactManagement from './components/Contact/ContactManagement';
import LoginForm from './components/Auth/LoginForm';
import ErrorBoundary from './components/ErrorBoundary';
import { User } from './types';
import { TokenManager } from './services';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);


  // Check for existing token on app load
  useEffect(() => {
    const checkExistingAuth = () => {
      const token = TokenManager.getToken();
      if (token) {
        // If token exists, create a basic user object
        // In a real app, you'd validate the token with the server
        const mockUser: User = {
          id: '1',
          name: 'Admin User',
          email: 'admin@transport.com',
          role: 'admin'
        };
        setUser(mockUser);
      }
      setIsLoading(false);
    };

    checkExistingAuth();
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    TokenManager.removeToken();
    setUser(null);
    setActiveTab('dashboard');
  };

  // Handle unauthorized errors globally
  const handleUnauthorized = () => {
    console.log('Session expired, logging out...');
    handleLogout();
  };

  // Add global error listener for 401 errors
  useEffect(() => {
    const handleGlobalError = (event: any) => {
      if (event.detail && event.detail.status === 401) {
        handleUnauthorized();
      }
    };

    window.addEventListener('unauthorized', handleGlobalError);
    return () => window.removeEventListener('unauthorized', handleGlobalError);
  }, []);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'buses':
        return <FleetManagement user={user} />;
      case 'schedule':
        return <ScheduleCalendar user={user} />;
      case 'contacts':
        return <ContactManagement user={user} />;
      case 'routes':
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Route Management</h2>
              <p className="text-gray-600">Coming soon...</p>
            </div>
          </div>
        );
      case 'users':
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">User Management</h2>
              <p className="text-gray-600">Coming soon...</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Settings</h2>
              <p className="text-gray-600">Coming soon...</p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Sidebar
          user={user}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
        />
        <main className="ml-64 p-8">
          {renderContent()}
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;