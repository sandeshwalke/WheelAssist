import React, { useState, useEffect } from 'react';
import { Car, Plus, Trash2, Edit, AlertCircle, CheckCircle2, Shield, Calendar, Tag } from 'lucide-react';
import { vehicleApi } from '../services/api';

export default function CustomerVehicles({ auth }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    vehiclePlate: '',
    vehicleType: 'CAR',
  });

  const loadVehicles = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await vehicleApi.getByUser(auth.userId);
      setVehicles(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, [auth]);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      vehiclePlate: '',
      vehicleType: 'CAR',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (v) => {
    setEditingId(v.vehicleId);
    setFormData({
      brand: v.brand || '',
      model: v.model || '',
      year: v.year || new Date().getFullYear(),
      vehiclePlate: v.vehiclePlate || '',
      vehicleType: v.vehicleType || 'CAR',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const payload = {
        userId: auth.userId,
        brand: formData.brand,
        model: formData.model,
        year: parseInt(formData.year, 10),
        vehiclePlate: formData.vehiclePlate,
        vehicleType: formData.vehicleType,
      };

      if (editingId) {
        await vehicleApi.update(editingId, payload);
        setSuccess('Vehicle updated successfully!');
      } else {
        await vehicleApi.add(payload);
        setSuccess('Vehicle added successfully!');
      }

      setShowModal(false);
      loadVehicles();
    } catch (err) {
      setError(err.message || 'Failed to save vehicle.');
    }
  };

  const handleDelete = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    setError('');
    setSuccess('');
    try {
      await vehicleApi.delete(vehicleId);
      setSuccess('Vehicle deleted successfully.');
      loadVehicles();
    } catch (err) {
      setError(err.message || 'Failed to delete vehicle.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827' }}>My Vehicles</h1>
          <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Manage your registered cars, bikes, and trucks</p>
        </div>
        <button className="btn-primary" onClick={handleOpenAddModal}>
          <Plus size={18} />
          <span>Add New Vehicle</span>
        </button>
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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>Loading vehicles...</div>
      ) : vehicles.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', background: '#FFFFFF' }}>
          <div style={{ background: '#FFF3E0', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            <Car size={32} color="#FF5722" />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>No Vehicles Registered</h3>
          <p style={{ color: '#6B7280', fontSize: '0.9rem', marginTop: '0.25rem', marginBottom: '1.25rem' }}>
            Add your vehicle details first to book service work orders.
          </p>
          <button className="btn-primary" onClick={handleOpenAddModal}>
            <Plus size={18} />
            <span>Add Vehicle Now</span>
          </button>
        </div>
      ) : (
        <div className="grid-3">
          {vehicles.map((v) => (
            <div key={v.vehicleId} className="card" style={{ position: 'relative', borderTop: '4px solid #FF5722' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#111827', color: '#FFFFFF', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                    {v.vehicleType}
                  </span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.4rem', color: '#111827' }}>
                    {v.brand} {v.model}
                  </h3>
                </div>
                <div style={{ background: '#FFF3E0', padding: '8px', borderRadius: '10px' }}>
                  <Car size={22} color="#FF5722" />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: '#4B5563', marginBottom: '1.25rem', background: '#F9FAFB', padding: '0.85rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Tag size={16} color="#6B7280" />
                  <span>Plate Number: <strong style={{ color: '#111827' }}>{v.vehiclePlate}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={16} color="#6B7280" />
                  <span>Model Year: <strong style={{ color: '#111827' }}>{v.year}</strong></span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #E5E7EB' }}>
                <button className="btn-secondary btn-sm" onClick={() => handleOpenEditModal(v)}>
                  <Edit size={14} />
                  <span>Edit</span>
                </button>
                <button className="btn-danger btn-sm" onClick={() => handleDelete(v.vehicleId)}>
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Vehicle Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {editingId ? 'Edit Vehicle Details' : 'Add New Vehicle'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6B7280' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Brand / Manufacturer</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Honda, Toyota, Ford"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Vehicle Model</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Civic, Camry, F-150"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Manufacturing Year</label>
                    <input
                      type="number"
                      className="form-input"
                      min="1980"
                      max="2026"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Vehicle Type</label>
                    <select
                      className="form-select"
                      value={formData.vehicleType}
                      onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    >
                      <option value="CAR">Car</option>
                      <option value="BIKE">Bike</option>
                      <option value="TRUCK">Truck</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">License Plate Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. ABC-1234"
                    value={formData.vehiclePlate}
                    onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingId ? 'Save Changes' : 'Register Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
