import React, { useEffect, useState } from 'react';
import { Car, ClipboardList, PlusCircle, Wrench, ShieldCheck, ArrowRight, RefreshCw, Activity, PackageCheck } from 'lucide-react';
import { vehicleApi, workorderApi } from '../services/api';

export default function HomeTab({ auth, setActiveTab }) {
  const isCustomer = auth?.role === 'CUSTOMER';
  const isMechanic = auth?.role === 'MECHANIC';

  const [stats, setStats] = useState({
    vehiclesCount: 0,
    activeWorkorders: 0,
    completedWorkorders: 0,
    unassignedCount: 0,
  });

  const [recentWorkorders, setRecentWorkorders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHomeData = async () => {
    setLoading(true);
    try {
      if (isCustomer) {
        const vehicles = await vehicleApi.getByUser(auth.userId).catch(() => []);
        const workorders = await workorderApi.getByUser(auth.userId).catch(() => []);

        const active = workorders.filter(w => ['PENDING', 'ASSIGNED', 'IN_PROGRESS'].includes(w.status)).length;
        const completed = workorders.filter(w => ['COMPLETED', 'DELIVERED'].includes(w.status)).length;

        setStats({
          vehiclesCount: vehicles.length,
          activeWorkorders: active,
          completedWorkorders: completed,
          unassignedCount: 0,
        });
        setRecentWorkorders(workorders.slice(0, 4));
      } else if (isMechanic) {
        const unassigned = await workorderApi.getUnassigned().catch(() => []);
        const assigned = await workorderApi.getByMechanic(auth.mechanicId || auth.userId).catch(() => []);

        const active = assigned.filter(w => ['ASSIGNED', 'IN_PROGRESS'].includes(w.status)).length;
        const completed = assigned.filter(w => ['COMPLETED', 'DELIVERED'].includes(w.status)).length;

        setStats({
          vehiclesCount: 0,
          activeWorkorders: active,
          completedWorkorders: completed,
          unassignedCount: unassigned.length,
        });
        setRecentWorkorders(assigned.slice(0, 4));
      }
    } catch (err) {
      console.error("Error fetching home data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, [auth]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)',
        color: '#FFFFFF',
        borderRadius: '16px',
        padding: '2rem 2.5rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
        borderLeft: '6px solid #FF5722'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span style={{
              background: '#FF5722',
              color: '#FFFFFF',
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase'
            }}>
              {auth?.role} DASHBOARD
            </span>
            <span style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Live System Active</span>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>
            Welcome back, <span style={{ color: '#FF5722' }}>{auth?.name}</span>!
          </h1>
          
          <p style={{ color: '#D1D5DB', marginTop: '0.5rem', maxWidth: '650px', fontSize: '1rem' }}>
            {isCustomer
              ? 'Track real-time status of your vehicle repairs, manage your registered vehicles, or create new service requests in seconds.'
              : 'Manage incoming unassigned repair requests, update live job statuses, and build itemized job cards and parts estimates.'}
          </p>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#111827' }}>
          Quick Navigation & Actions
        </h2>
        <div className="grid-3">
          {isCustomer && (
            <>
              <div className="card" style={{ cursor: 'pointer', borderTop: '3px solid #FF5722' }} onClick={() => setActiveTab('vehicles')}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ background: '#FFF3E0', padding: '10px', borderRadius: '12px' }}>
                    <Car size={26} color="#FF5722" />
                  </div>
                  <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827' }}>{stats.vehiclesCount}</span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>My Vehicles</h3>
                <p style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '0.25rem', marginBottom: '1rem' }}>
                  Add, update or view registered vehicles
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#FF5722', fontWeight: 600, fontSize: '0.9rem' }}>
                  <span>Open Vehicles</span>
                  <ArrowRight size={16} />
                </div>
              </div>

              <div className="card" style={{ cursor: 'pointer', borderTop: '3px solid #3B82F6' }} onClick={() => setActiveTab('workorders')}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ background: '#EFF6FF', padding: '10px', borderRadius: '12px' }}>
                    <ClipboardList size={26} color="#3B82F6" />
                  </div>
                  <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827' }}>{stats.activeWorkorders}</span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Live Work Orders</h3>
                <p style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '0.25rem', marginBottom: '1rem' }}>
                  Check real-time status updated by mechanics
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#3B82F6', fontWeight: 600, fontSize: '0.9rem' }}>
                  <span>View Work Orders</span>
                  <ArrowRight size={16} />
                </div>
              </div>

              <div className="card" style={{ cursor: 'pointer', borderTop: '3px solid #10B981' }} onClick={() => setActiveTab('create-workorder')}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ background: '#ECFDF5', padding: '10px', borderRadius: '12px' }}>
                    <PlusCircle size={26} color="#10B981" />
                  </div>
                  <span style={{ fontSize: '0.8rem', background: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>NEW</span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Book Service</h3>
                <p style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '0.25rem', marginBottom: '1rem' }}>
                  Submit a new vehicle repair work order
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10B981', fontWeight: 600, fontSize: '0.9rem' }}>
                  <span>Book Now</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </>
          )}

          {isMechanic && (
            <>
              <div className="card" style={{ cursor: 'pointer', borderTop: '3px solid #F59E0B' }} onClick={() => setActiveTab('mechanic-workorders')}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ background: '#FEF3C7', padding: '10px', borderRadius: '12px' }}>
                    <Activity size={26} color="#D97706" />
                  </div>
                  <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827' }}>{stats.unassignedCount}</span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Unassigned Jobs</h3>
                <p style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '0.25rem', marginBottom: '1rem' }}>
                  Pick up available work orders from queue
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#D97706', fontWeight: 600, fontSize: '0.9rem' }}>
                  <span>Claim Jobs</span>
                  <ArrowRight size={16} />
                </div>
              </div>

              <div className="card" style={{ cursor: 'pointer', borderTop: '3px solid #FF5722' }} onClick={() => setActiveTab('mechanic-workorders')}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ background: '#FFF3E0', padding: '10px', borderRadius: '12px' }}>
                    <Wrench size={26} color="#FF5722" />
                  </div>
                  <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827' }}>{stats.activeWorkorders}</span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Assigned Repairs</h3>
                <p style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '0.25rem', marginBottom: '1rem' }}>
                  Update statuses & progress of your active jobs
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#FF5722', fontWeight: 600, fontSize: '0.9rem' }}>
                  <span>Work Orders</span>
                  <ArrowRight size={16} />
                </div>
              </div>

              <div className="card" style={{ cursor: 'pointer', borderTop: '3px solid #10B981' }} onClick={() => setActiveTab('jobcards')}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ background: '#ECFDF5', padding: '10px', borderRadius: '12px' }}>
                    <PackageCheck size={26} color="#10B981" />
                  </div>
                  <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827' }}>{stats.completedWorkorders}</span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Job Cards & Parts</h3>
                <p style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '0.25rem', marginBottom: '1rem' }}>
                  Create job cards, add parts & compute estimates
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10B981', fontWeight: 600, fontSize: '0.9rem' }}>
                  <span>Open Job Cards</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent Work Orders Overview */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Recent Work Orders Activity</h3>
            <p style={{ fontSize: '0.85rem', color: '#6B7280' }}>Overview of recent status changes</p>
          </div>
          <button className="btn-secondary btn-sm" onClick={fetchHomeData}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {recentWorkorders.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF', background: '#FAFAFA', borderRadius: '12px' }}>
            No recent work orders found.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentWorkorders.map(order => (
              <div key={order.workorderId} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ background: '#111827', color: '#FFFFFF', padding: '0.5rem 0.75rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem' }}>
                    #{order.workorderId}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
                      {order.vehicleModel || 'Vehicle'} ({order.vehiclePlate || 'N/A'})
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: 0 }}>
                      {order.problemDescription}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className={`status-badge status-${order.status}`}>
                    {order.status}
                  </span>
                  <button
                    className="btn-secondary btn-sm"
                    onClick={() => setActiveTab(isCustomer ? 'workorders' : 'mechanic-workorders')}
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
