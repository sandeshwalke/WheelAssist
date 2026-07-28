import React from 'react';
import { Wrench, Home, Car, ClipboardList, PlusCircle, UserCheck, LogOut, Package } from 'lucide-react';

export default function Navbar({ auth, activeTab, setActiveTab, onLogout }) {
  const isCustomer = auth?.role === 'CUSTOMER';
  const isMechanic = auth?.role === 'MECHANIC';

  return (
    <header className="navbar-header">
      <div className="navbar-inner">
        {/* Brand / Logo */}
        <div className="brand-logo" onClick={() => setActiveTab('home')}>
          <div style={{ background: '#FF5722', padding: '6px', borderRadius: '8px', display: 'flex' }}>
            <Wrench size={22} color="#FFFFFF" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.25rem', lineHeight: '1.1', fontWeight: 800 }}>
              Wheel<span style={{ color: '#FF5722' }}>Assist</span>
            </span>
            <span style={{ fontSize: '0.65rem', color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Service Portal
            </span>
          </div>
        </div>

        {/* Horizontal Nav Tabs */}
        <nav className="nav-tabs-horizontal">
          <button
            className={`nav-tab-btn ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <Home size={18} />
            <span>Home</span>
          </button>

          {isCustomer && (
            <>
              <button
                className={`nav-tab-btn ${activeTab === 'vehicles' ? 'active' : ''}`}
                onClick={() => setActiveTab('vehicles')}
              >
                <Car size={18} />
                <span>My Vehicles</span>
              </button>

              <button
                className={`nav-tab-btn ${activeTab === 'workorders' ? 'active' : ''}`}
                onClick={() => setActiveTab('workorders')}
              >
                <ClipboardList size={18} />
                <span>My Work Orders</span>
              </button>

              <button
                className={`nav-tab-btn ${activeTab === 'create-workorder' ? 'active' : ''}`}
                onClick={() => setActiveTab('create-workorder')}
              >
                <PlusCircle size={18} />
                <span>Book Service</span>
              </button>
            </>
          )}

          {isMechanic && (
            <>
              <button
                className={`nav-tab-btn ${activeTab === 'mechanic-workorders' ? 'active' : ''}`}
                onClick={() => setActiveTab('mechanic-workorders')}
              >
                <UserCheck size={18} />
                <span>Mechanic Workspace</span>
              </button>

              <button
                className={`nav-tab-btn ${activeTab === 'jobcards' ? 'active' : ''}`}
                onClick={() => setActiveTab('jobcards')}
              >
                <Package size={18} />
                <span>Job Cards & Parts</span>
              </button>
            </>
          )}
        </nav>

        {/* User Info & Logout */}
        <div className="nav-user-area">
          <div className="user-profile-pill">
            <div className="user-avatar">
              {auth?.name ? auth.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.85rem' }}>{auth?.name}</span>
              <span className="brand-badge" style={{ fontSize: '0.6rem', padding: '1px 5px' }}>
                {auth?.role}
              </span>
            </div>
          </div>

          <button className="btn-secondary btn-sm" onClick={onLogout} style={{ color: '#EF4444', borderColor: '#374151', background: '#1F2937' }}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
