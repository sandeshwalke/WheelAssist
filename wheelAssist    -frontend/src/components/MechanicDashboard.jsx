import React, { useState, useEffect } from 'react';
import { UserCheck, RefreshCw, AlertCircle, CheckCircle2, Clock, Wrench, ArrowRight, FileText, CheckSquare } from 'lucide-react';
import { workorderApi } from '../services/api';

export default function MechanicDashboard({ auth, onOpenJobCardManager }) {
  const [subTab, setSubTab] = useState('assigned'); // 'assigned' or 'unassigned'
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [unassignedOrders, setUnassignedOrders] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const mechanicId = auth?.mechanicId || auth?.userId;

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [unassigned, assigned] = await Promise.all([
        workorderApi.getUnassigned().catch(() => []),
        workorderApi.getByMechanic(mechanicId).catch(() => []),
      ]);

      setUnassignedOrders(unassigned || []);
      setAssignedOrders(assigned || []);
    } catch (err) {
      setError(err.message || 'Failed to load work orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [auth]);

  const handleAssignToSelf = async (workorderId) => {
    setError('');
    setSuccess('');
    try {
      await workorderApi.assignToSelf(workorderId);
      setSuccess(`Work order #${workorderId} assigned to you successfully!`);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to assign work order.');
    }
  };

  const handleStatusChange = async (workorderId, newStatus) => {
    setError('');
    setSuccess('');
    try {
      await workorderApi.updateStatus(workorderId, newStatus);
      setSuccess(`Work order #${workorderId} status updated to ${newStatus}`);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to update status');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827' }}>Mechanic Workspace</h1>
          <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Manage repair requests, assign jobs, and update work status</p>
        </div>
        <button className="btn-secondary" onClick={loadData} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          <span>Refresh</span>
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

      {/* Sub-tab Navigation */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '2px solid #E5E7EB', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setSubTab('assigned')}
          style={{
            background: subTab === 'assigned' ? '#FF5722' : 'transparent',
            color: subTab === 'assigned' ? '#FFFFFF' : '#4B5563',
            border: 'none',
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <UserCheck size={18} />
          <span>My Assigned Jobs ({assignedOrders.length})</span>
        </button>

        <button
          onClick={() => setSubTab('unassigned')}
          style={{
            background: subTab === 'unassigned' ? '#FF5722' : 'transparent',
            color: subTab === 'unassigned' ? '#FFFFFF' : '#4B5563',
            border: 'none',
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Clock size={18} />
          <span>Unassigned Pool ({unassignedOrders.length})</span>
        </button>
      </div>

      {/* ASSIGNED JOBS SUB-TAB */}
      {subTab === 'assigned' && (
        <div>
          {assignedOrders.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <Wrench size={32} color="#9CA3AF" style={{ marginBottom: '0.5rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No Assigned Jobs Yet</h3>
              <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.25rem' }}>
                Switch to "Unassigned Pool" to claim available work orders.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {assignedOrders.map((wo) => (
                <div key={wo.workorderId} className="card" style={{ borderLeft: '5px solid #FF5722' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ background: '#111827', color: '#FFFFFF', padding: '0.6rem 0.9rem', borderRadius: '10px', fontWeight: 800, fontSize: '0.95rem' }}>
                        #{wo.workorderId}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                          {wo.vehicleModel || 'Vehicle'} ({wo.vehiclePlate || 'N/A'})
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: 0 }}>
                          Owner: <strong style={{ color: '#111827' }}>{wo.ownerName || 'Customer'}</strong>
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {/* Status Selector for Mechanic */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B7280' }}>Status:</span>
                        <select
                          className="form-select"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', fontWeight: 700 }}
                          value={wo.status}
                          onChange={(e) => handleStatusChange(wo.workorderId, e.target.value)}
                        >
                          <option value="ASSIGNED">ASSIGNED</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </div>

                      <button
                        className="btn-primary btn-sm"
                        onClick={() => onOpenJobCardManager(wo)}
                      >
                        <FileText size={16} />
                        <span>Job Card & Parts</span>
                      </button>
                    </div>
                  </div>

                  <div style={{ background: '#F9FAFB', padding: '0.85rem 1rem', borderRadius: '8px', fontSize: '0.9rem', color: '#374151' }}>
                    <strong>Problem Reported:</strong> {wo.problemDescription}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* UNASSIGNED JOBS SUB-TAB */}
      {subTab === 'unassigned' && (
        <div>
          {unassignedOrders.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <CheckSquare size={32} color="#10B981" style={{ marginBottom: '0.5rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>All Available Jobs Claimed</h3>
              <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.25rem' }}>
                There are no pending unassigned work orders at this moment.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {unassignedOrders.map((wo) => (
                <div key={wo.workorderId} className="card" style={{ borderLeft: '5px solid #F59E0B' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ background: '#111827', color: '#FFFFFF', padding: '0.6rem 0.9rem', borderRadius: '10px', fontWeight: 800, fontSize: '0.95rem' }}>
                        #{wo.workorderId}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                          {wo.vehicleModel || 'Vehicle'} ({wo.vehiclePlate || 'N/A'})
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: 0 }}>
                          Customer: <strong style={{ color: '#111827' }}>{wo.ownerName || 'Customer'}</strong>
                        </p>
                      </div>
                    </div>

                    <button
                      className="btn-primary"
                      onClick={() => handleAssignToSelf(wo.workorderId)}
                    >
                      <UserCheck size={18} />
                      <span>Assign to Me</span>
                    </button>
                  </div>

                  <div style={{ background: '#FEF3C7', padding: '0.85rem 1rem', borderRadius: '8px', fontSize: '0.9rem', color: '#92400E' }}>
                    <strong>Problem Description:</strong> {wo.problemDescription}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
