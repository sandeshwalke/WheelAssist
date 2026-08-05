import React, { useState, useEffect } from 'react';
import { Users, Car, ClipboardList, Receipt, Shield, UserPlus, Edit3, Trash2, CheckCircle2, AlertCircle, RefreshCw, DollarSign, Wrench, Search, Plus } from 'lucide-react';
import { userApi, vehicleApi, workorderApi, invoiceApi, authApi } from '../services/api';
import InvoiceModal from './InvoiceModal';

export default function AdminDashboard({ auth }) {
  const [activeSubTab, setActiveSubTab] = useState('overview');

  // Data state
  const [users, setUsers] = useState([]);
  const [workorders, setWorkorders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals & Forms State
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState('CUSTOMER');
  const [formPassword, setFormPassword] = useState('');
  const [formExp, setFormExp] = useState('');
  const [formSpec, setFormSpec] = useState('');

  // Selected Invoice Modal
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const loadAllAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const [uList, woList, invList] = await Promise.all([
        userApi.getAll().catch(() => []),
        workorderApi.getAll().catch(() => []),
        invoiceApi.getAll().catch(() => []),
      ]);
      setUsers(uList || []);
      setWorkorders(woList || []);
      setInvoices(invList || []);
    } catch (err) {
      setError(err.message || 'Failed to load system management data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  // Stats Calculations
  const totalCustomers = users.filter((u) => u.role === 'CUSTOMER').length;
  const totalMechanics = users.filter((u) => u.role === 'MECHANIC').length;
  const totalAdmins = users.filter((u) => u.role === 'ADMIN').length;
  const activeWorkorders = workorders.filter((w) => w.status !== 'DELIVERED' && w.status !== 'CANCELLED').length;
  const totalRevenue = invoices.reduce((acc, inv) => acc + (inv.paid ? parseFloat(inv.totalCost || 0) : 0), 0);

  // USER CRUD HANDLERS
  const handleOpenCreateUser = () => {
    setEditingUser(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormRole('CUSTOMER');
    setFormPassword('');
    setFormExp('');
    setFormSpec('');
    setShowUserModal(true);
  };

  const handleOpenEditUser = (u) => {
    setEditingUser(u);
    setFormName(u.name || '');
    setFormEmail(u.email || '');
    setFormPhone(u.phone || '');
    setFormRole(u.role || 'CUSTOMER');
    setFormPassword('');
    setFormExp(u.experience || '');
    setFormSpec(u.specialization || '');
    setShowUserModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editingUser) {
        // Update user
        await userApi.update(editingUser.userId, {
          name: formName,
          email: formEmail,
          phone: formPhone,
          role: formRole,
          experience: formExp,
          specialization: formSpec,
        });
        setSuccess(`User ${formName} updated successfully!`);
      } else {
        // Create user
        await authApi.register({
          name: formName,
          email: formEmail,
          phone: formPhone,
          password: formPassword,
          role: formRole,
          experience: formExp,
          specialization: formSpec,
        });
        setSuccess(`New user ${formName} registered successfully!`);
      }
      setShowUserModal(false);
      loadAllAdminData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to delete user "${name}"? This action cannot be undone.`)) return;
    setError('');
    setSuccess('');
    try {
      await userApi.delete(userId);
      setSuccess(`User ${name} deleted.`);
      loadAllAdminData();
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    }
  };

  // WORKORDER STATUS / ASSIGNMENT HANDLERS
  const handleStatusChange = async (workorderId, newStatus) => {
    try {
      await workorderApi.updateStatus(workorderId, newStatus);
      setSuccess(`Workorder #${workorderId} status updated to ${newStatus}`);
      loadAllAdminData();
    } catch (err) {
      setError(err.message || 'Failed to update work order status');
    }
  };

  const handleDeleteWorkorder = async (workorderId) => {
    if (!window.confirm(`Delete Work Order #${workorderId}?`)) return;
    try {
      await workorderApi.delete(workorderId);
      setSuccess(`Workorder #${workorderId} deleted.`);
      loadAllAdminData();
    } catch (err) {
      setError(err.message || 'Failed to delete work order');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Shield size={28} color="#FF5722" />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', margin: 0 }}>
              Admin Control Center
            </h1>
          </div>
          <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: 0 }}>
            Full system management, user role CRUD, work orders & financial oversight
          </p>
        </div>

        <button className="btn-secondary" onClick={loadAllAdminData} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          <span>Refresh System Data</span>
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

      {/* Sub-Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '2px solid #E5E7EB', paddingBottom: '0.5rem' }}>
        {[
          { id: 'overview', label: 'System Overview', icon: Shield },
          { id: 'users', label: `Users & Roles (${users.length})`, icon: Users },
          { id: 'workorders', label: `Work Orders (${workorders.length})`, icon: ClipboardList },
          { id: 'invoices', label: `Invoices (${invoices.length})`, icon: Receipt },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.25rem',
                borderRadius: '10px',
                border: 'none',
                background: isActive ? '#FF5722' : 'transparent',
                color: isActive ? '#FFFFFF' : '#4B5563',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: SYSTEM OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="card" style={{ borderLeft: '4px solid #3B82F6' }}>
              <div style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>Total Users</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', marginTop: '0.25rem' }}>{users.length}</div>
              <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>
                {totalCustomers} Customers | {totalMechanics} Mechanics | {totalAdmins} Admins
              </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #10B981' }}>
              <div style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>Active Work Orders</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', marginTop: '0.25rem' }}>{activeWorkorders}</div>
              <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>Total Executed: {workorders.length}</div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #F59E0B' }}>
              <div style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>Total Invoices</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', marginTop: '0.25rem' }}>{invoices.length}</div>
              <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>
                Paid: {invoices.filter((i) => i.paid).length} | Unpaid: {invoices.filter((i) => !i.paid).length}
              </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #FF5722' }}>
              <div style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>Total Collections</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FF5722', marginTop: '0.25rem' }}>
                ₹{totalRevenue.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>Verified Payments</div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: USER MANAGEMENT (FULL CRUD) */}
      {activeSubTab === 'users' && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #E5E7EB' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>System Users Directory</h3>
              <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: 0 }}>Manage accounts, edit roles, assign mechanics or delete users</p>
            </div>

            <button className="btn-primary" onClick={handleOpenCreateUser}>
              <Plus size={16} />
              <span>Add New User Account</span>
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F3F4F6', color: '#374151', borderBottom: '1px solid #E5E7EB' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>User ID</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Email / Phone</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Specialization / Exp</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.userId} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: '#111827' }}>#{u.userId}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#111827' }}>{u.name}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#4B5563' }}>
                      <div>{u.email}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{u.phone}</div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className={`brand-badge`} style={{
                        background: u.role === 'ADMIN' ? '#EF4444' : u.role === 'MECHANIC' ? '#FF5722' : '#3B82F6',
                        color: '#FFFFFF'
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#4B5563', fontSize: '0.85rem' }}>
                      {u.role === 'MECHANIC' ? `${u.specialization || 'General'} (${u.experience || 'N/A'})` : '-'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button
                          className="btn-secondary btn-sm"
                          onClick={() => handleOpenEditUser(u)}
                        >
                          <Edit3 size={14} />
                          <span>Edit</span>
                        </button>

                        <button
                          className="btn-secondary btn-sm"
                          onClick={() => handleDeleteUser(u.userId, u.name)}
                          style={{ color: '#EF4444', borderColor: '#FCA5A5' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: WORK ORDERS CONTROL */}
      {activeSubTab === 'workorders' && (
        <div className="card">
          <div style={{ marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #E5E7EB' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>System Work Orders Control</h3>
            <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: 0 }}>Oversee repair jobs, update stages, and manage order assignments</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {workorders.map((wo) => (
              <div key={wo.workorderId} style={{ background: '#F9FAFB', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#111827' }}>
                      Work Order #{wo.workorderId} - {wo.vehicleModel || 'Vehicle'} ({wo.vehiclePlate})
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0 }}>
                      Owner: <strong>{wo.ownerName}</strong> | Mechanic: <strong style={{ color: '#FF5722' }}>{wo.mechanicName || 'Unassigned'}</strong>
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <select
                      className="form-select"
                      value={wo.status}
                      onChange={(e) => handleStatusChange(wo.workorderId, e.target.value)}
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                    >
                      {['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'DELIVERED', 'CANCELLED'].map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>

                    <button
                      className="btn-secondary btn-sm"
                      onClick={() => handleDeleteWorkorder(wo.workorderId)}
                      style={{ color: '#EF4444', borderColor: '#FCA5A5' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: '0.875rem', color: '#374151', background: '#FFFFFF', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                  <strong>Problem Description:</strong> {wo.problemDescription}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: INVOICES & FINANCIALS */}
      {activeSubTab === 'invoices' && (
        <div className="card">
          <div style={{ marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #E5E7EB' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Financial Invoices & Payment Ledger</h3>
            <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: 0 }}>Real-time payment tracking across all generated Tax Invoices</p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F3F4F6', color: '#374151', borderBottom: '1px solid #E5E7EB' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Invoice #</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Billed Customer</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Vehicle</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Mechanic</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Total Amount</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Payment Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.invoiceId} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>#{inv.invoiceId}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{inv.ownerName}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{inv.vehiclePlate}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{inv.mechanicName}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 800, color: '#FF5722' }}>
                      ₹{parseFloat(inv.totalCost).toFixed(2)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <span className={`status-badge ${inv.paid ? 'status-DELIVERED' : 'status-PENDING'}`}>
                        {inv.paid ? 'PAID' : 'UNPAID'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <button
                        className="btn-secondary btn-sm"
                        onClick={() => setSelectedInvoice(inv)}
                      >
                        <Receipt size={14} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT USER MODAL */}
      {showUserModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                {editingUser ? `Edit User #${editingUser.userId}` : 'Create New System User Account'}
              </h3>
              <button onClick={() => setShowUserModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>

            <form onSubmit={handleSaveUser}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" value={formName} onChange={(e) => setFormName(e.target.value)} required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-input" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number (10 digits)</label>
                    <input type="text" className="form-input" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} required />
                  </div>
                </div>

                {!editingUser && (
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-input" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} required minLength={6} />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">User Role</label>
                  <select className="form-select" value={formRole} onChange={(e) => setFormRole(e.target.value)}>
                    <option value="CUSTOMER">CUSTOMER</option>
                    <option value="MECHANIC">MECHANIC</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                {formRole === 'MECHANIC' && (
                  <div style={{ background: '#F9FAFB', padding: '1rem', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
                    <div className="form-group">
                      <label className="form-label">Experience</label>
                      <input type="text" className="form-input" value={formExp} onChange={(e) => setFormExp(e.target.value)} placeholder="e.g. 5 Years" />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Specialization</label>
                      <input type="text" className="form-input" value={formSpec} onChange={(e) => setFormSpec(e.target.value)} placeholder="e.g. Brakes & Engine" />
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowUserModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">
                  <span>{editingUser ? 'Save User Changes' : 'Create User Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Invoice Modal */}
      {selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          isCustomer={false}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}
