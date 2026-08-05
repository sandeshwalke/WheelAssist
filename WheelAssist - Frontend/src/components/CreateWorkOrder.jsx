import React, { useState, useEffect } from 'react';
import { PlusCircle, Car, AlertCircle, CheckCircle2, Send, Wrench } from 'lucide-react';
import { vehicleApi, workorderApi } from '../services/api';

export default function CreateWorkOrder({ auth, onWorkorderCreated }) {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadVehicles() {
      setLoadingVehicles(true);
      try {
        const data = await vehicleApi.getByUser(auth.userId);
        setVehicles(data || []);
      } catch (err) {
        setError('Failed to fetch your vehicles. Please register a vehicle first.');
      } finally {
        setLoadingVehicles(false);
      }
    }
    loadVehicles();
  }, [auth]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedVehicleId) {
      setError('Please select a vehicle.');
      return;
    }

    setLoading(true);
    try {
      await workorderApi.create({
        vehicleId: parseInt(selectedVehicleId, 10),
        problemDescription,
      });

      setSuccess('Work order submitted successfully! Mechanics will review it shortly.');
      setProblemDescription('');

      setTimeout(() => {
        if (onWorkorderCreated) {
          onWorkorderCreated();
        }
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to create work order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div className="card" style={{ borderTop: '5px solid #FF5722' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ background: '#FFF3E0', padding: '10px', borderRadius: '12px' }}>
            <Wrench size={26} color="#FF5722" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', margin: 0 }}>Book Vehicle Service</h1>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: 0 }}>Submit your repair request to service mechanics</p>
          </div>
        </div>

        {error && (
          <div className="alert-box alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert-box alert-success">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        {loadingVehicles ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>Loading your registered vehicles...</div>
        ) : vehicles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', background: '#FAFAFA', borderRadius: '12px' }}>
            <Car size={36} color="#9CA3AF" style={{ marginBottom: '0.5rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No Vehicles Registered</h3>
            <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '1rem' }}>
              You need to register at least one vehicle before creating a work order.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Select Vehicle</label>
              <select
                className="form-select"
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                required
              >
                <option value="">-- Choose a Vehicle --</option>
                {vehicles.map((v) => (
                  <option key={v.vehicleId} value={v.vehicleId}>
                    {v.brand} {v.model} ({v.vehiclePlate}) - {v.vehicleType}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Describe the Problem or Required Maintenance</label>
              <textarea
                className="form-textarea"
                rows={5}
                placeholder="e.g. Engine making unusual clicking sound during acceleration, oil change needed, brake pads worn out..."
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
              disabled={loading}
            >
              <Send size={18} />
              <span>{loading ? 'Submitting Work Order...' : 'Submit Work Order'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
