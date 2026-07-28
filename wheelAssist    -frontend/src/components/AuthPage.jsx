import React, { useState } from 'react';
import { Wrench, LogIn, UserPlus, Shield, Wrench as MechanicIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { authApi } from '../services/api';

export default function AuthPage({ onLoginSuccess }) {
  // 'login' or 'register'
  const [mode, setMode] = useState('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('CUSTOMER');
  const [regExperience, setRegExperience] = useState('');
  const [regSpecialization, setRegSpecialization] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.login({
        email: loginEmail,
        password: loginPassword,
      });
      onLoginSuccess(data);
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const payload = {
        name: regName,
        phone: regPhone,
        email: regEmail,
        password: regPassword,
        role: regRole,
      };

      if (regRole === 'MECHANIC') {
        payload.experience = regExperience;
        payload.specialization = regSpecialization;
      }

      await authApi.register(payload);
      setSuccessMsg('Registration successful! Please login with your email and password.');
      setMode('login');
      setLoginEmail(regEmail);
      setLoginPassword('');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div style={{
        maxWidth: '800px',
        width: '100%',
        background: '#FFFFFF',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* Top Header Banner */}
        <div style={{
          background: '#111827',
          padding: '2rem 1.5rem 1.5rem 1.5rem',
          textAlign: 'center',
          borderBottom: '4px solid #FF5722',
          color: '#FFFFFF'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#FF5722',
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            marginBottom: '0.75rem',
            boxShadow: '0 8px 16px rgba(255, 87, 34, 0.4)'
          }}>
            <Wrench size={28} color="#FFFFFF" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            Wheel<span style={{ color: '#FF5722' }}>Assist</span>
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Automotive Repair & Workorder Platform
          </p>
        </div>

        <div style={{ padding: '1.75rem' }}>

          {error && (
            <div className="alert-box alert-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="alert-box alert-success">
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* MODE 1: LOGIN FORM (Shown ONLY when mode === 'login') */}
          {mode === 'login' && (
            <div>
              <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#111827' }}>Welcome Back</h2>
                <p style={{ fontSize: '0.85rem', color: '#6B7280' }}>Log in to manage your vehicles & work orders</p>
              </div>

              <form onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="name@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }}
                  disabled={loading}
                >
                  <LogIn size={18} />
                  <span>{loading ? 'Authenticating...' : 'Log In'}</span>
                </button>
              </form>

              {/* ONLY Registration Toggle Button is visible here */}
              <div style={{
                marginTop: '1.75rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid #E5E7EB',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '0.9rem', color: '#4B5563', marginBottom: '0.75rem' }}>
                  Don't have an account yet?
                </p>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ width: '100%', borderColor: '#FF5722', color: '#FF5722' }}
                  onClick={() => {
                    setError('');
                    setSuccessMsg('');
                    setMode('register');
                  }}
                >
                  <UserPlus size={18} />
                  <span>Create New Account</span>
                </button>
              </div>
            </div>
          )}

          {/* MODE 2: REGISTRATION FORM (Shown ONLY when mode === 'register', Login hides completely) */}
          {mode === 'register' && (
            <div>
              <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#111827' }}>Create Account</h2>
                <p style={{ fontSize: '0.85rem', color: '#6B7280' }}>Register as Customer or Service Mechanic</p>
              </div>

              <form onSubmit={handleRegisterSubmit}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="John Doe"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number (10 digits)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="9876543210"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    pattern="[0-9]{10}"
                    title="10 digit phone number"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="user@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password (min 6 chars)</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                </div>

                {/* Role Selection */}
                <div className="form-group">
                  <label className="form-label">Register As</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.25rem' }}>
                    <div
                      onClick={() => setRegRole('CUSTOMER')}
                      style={{
                        padding: '0.75rem',
                        border: `2px solid ${regRole === 'CUSTOMER' ? '#FF5722' : '#E5E7EB'}`,
                        background: regRole === 'CUSTOMER' ? '#FFF3E0' : '#FFFFFF',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        color: regRole === 'CUSTOMER' ? '#C2410C' : '#4B5563'
                      }}
                    >
                      Customer
                    </div>
                    <div
                      onClick={() => setRegRole('MECHANIC')}
                      style={{
                        padding: '0.75rem',
                        border: `2px solid ${regRole === 'MECHANIC' ? '#FF5722' : '#E5E7EB'}`,
                        background: regRole === 'MECHANIC' ? '#FFF3E0' : '#FFFFFF',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        color: regRole === 'MECHANIC' ? '#C2410C' : '#4B5563'
                      }}
                    >
                      Mechanic
                    </div>
                  </div>
                </div>

                {/* Additional Mechanic Fields */}
                {regRole === 'MECHANIC' && (
                  <div style={{ background: '#F9FAFB', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', border: '1px solid #E5E7EB' }}>
                    <div className="form-group">
                      <label className="form-label">Experience (Years / Details)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. 5 Years in Engine Repair"
                        value={regExperience}
                        onChange={(e) => setRegExperience(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Specialization</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Brakes, Transmission, Tuning"
                        value={regSpecialization}
                        onChange={(e) => setRegSpecialization(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }}
                  disabled={loading}
                >
                  <UserPlus size={18} />
                  <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
                </button>
              </form>

              {/* ONLY Login Toggle Button is visible here */}
              <div style={{
                marginTop: '1.75rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid #E5E7EB',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '0.9rem', color: '#4B5563', marginBottom: '0.75rem' }}>
                  Already have an account?
                </p>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ width: '100%', borderColor: '#111827', color: '#111827' }}
                  onClick={() => {
                    setError('');
                    setSuccessMsg('');
                    setMode('login');
                  }}
                >
                  <LogIn size={18} />
                  <span>Back to Login</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
