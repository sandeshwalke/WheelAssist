import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthPage from './components/AuthPage';
import HomeTab from './components/HomeTab';
import CustomerVehicles from './components/CustomerVehicles';
import CustomerWorkOrders from './components/CustomerWorkOrders';
import CreateWorkOrder from './components/CreateWorkOrder';
import MechanicDashboard from './components/MechanicDashboard';
import MechanicJobCardManager from './components/MechanicJobCardManager';
import { getStoredAuth, setStoredAuth } from './services/api';

export default function App() {
  const [auth, setAuth] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedMechanicWo, setSelectedMechanicWo] = useState(null);

  useEffect(() => {
    const saved = getStoredAuth();
    if (saved && saved.token) {
      setAuth(saved);
    }
  }, []);

  const handleLoginSuccess = (authResponse) => {
    setAuth(authResponse);
    setStoredAuth(authResponse);
    setActiveTab('home');
  };

  const handleLogout = () => {
    setAuth(null);
    setStoredAuth(null);
    setActiveTab('home');
  };

  const handleOpenJobCardManagerFromWo = (workorder) => {
    setSelectedMechanicWo(workorder);
    setActiveTab('jobcards');
  };

  if (!auth) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      <Navbar
        auth={auth}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {activeTab === 'home' && (
          <HomeTab auth={auth} setActiveTab={setActiveTab} />
        )}

        {/* CUSTOMER TABS */}
        {activeTab === 'vehicles' && auth.role === 'CUSTOMER' && (
          <CustomerVehicles auth={auth} />
        )}

        {activeTab === 'workorders' && auth.role === 'CUSTOMER' && (
          <CustomerWorkOrders auth={auth} />
        )}

        {activeTab === 'create-workorder' && auth.role === 'CUSTOMER' && (
          <CreateWorkOrder
            auth={auth}
            onWorkorderCreated={() => setActiveTab('workorders')}
          />
        )}

        {/* MECHANIC TABS */}
        {activeTab === 'mechanic-workorders' && auth.role === 'MECHANIC' && (
          <MechanicDashboard
            auth={auth}
            onOpenJobCardManager={handleOpenJobCardManagerFromWo}
          />
        )}

        {activeTab === 'jobcards' && auth.role === 'MECHANIC' && (
          <MechanicJobCardManager
            auth={auth}
            selectedWorkorder={selectedMechanicWo}
          />
        )}
      </main>
    </div>
  );
}
