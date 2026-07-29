import React, { useState, useEffect } from 'react';
import { Package, Plus, Trash2, Save, FileText, Wrench, AlertCircle, CheckCircle2, RefreshCw, Receipt } from 'lucide-react';
import { workorderApi, jobCardApi, partApi, invoiceApi } from '../services/api';
import InvoiceModal from './InvoiceModal';

export default function MechanicJobCardManager({ auth, selectedWorkorder: initialWorkorder }) {
  const mechanicId = auth?.mechanicId || auth?.userId;

  const [assignedOrders, setAssignedOrders] = useState([]);
  const [selectedWoId, setSelectedWoId] = useState(initialWorkorder?.workorderId || '');
  const [currentJobCard, setCurrentJobCard] = useState(null);
  const [invoice, setInvoice] = useState(null);

  // Job Card Edit Form
  const [workDone, setWorkDone] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');

  // Add Part Form
  const [partName, setPartName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [savingJob, setSavingJob] = useState(false);
  const [addingPart, setAddingPart] = useState(false);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load assigned work orders
  useEffect(() => {
    async function loadAssigned() {
      try {
        const orders = await workorderApi.getByMechanic(mechanicId);
        setAssignedOrders(orders || []);
        if (!selectedWoId && orders && orders.length > 0) {
          setSelectedWoId(orders[0].workorderId);
        }
      } catch (err) {
        console.error("Failed to load assigned workorders:", err);
      }
    }
    loadAssigned();
  }, [mechanicId]);

  // Load or create Job Card when selected workorder changes
  const loadJobCard = async (workorderId) => {
    if (!workorderId) return;
    setLoading(true);
    setError('');
    setCurrentJobCard(null);
    setInvoice(null);
    try {
      let jc = await jobCardApi.getByWorkorder(workorderId).catch(() => null);

      // If no job card exists yet, create one
      if (!jc) {
        jc = await jobCardApi.create(workorderId);
      }

      setCurrentJobCard(jc);
      setWorkDone(jc.workDone || '');
      setEstimatedCost(jc.estimatedCost || '');

      // Check if invoice exists for this job card
      if (jc && jc.jobId) {
        const inv = await invoiceApi.getByJobCard(jc.jobId).catch(() => null);
        setInvoice(inv);
      }
    } catch (err) {
      setError(err.message || 'Failed to load/create Job Card');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!currentJobCard) return;
    setGeneratingInvoice(true);
    setError('');
    setSuccess('');
    try {
      const laborCost = estimatedCost ? parseFloat(estimatedCost) : 0;
      const inv = await invoiceApi.generate(currentJobCard.jobId, laborCost);
      setInvoice(inv);
      setSuccess('Official Tax Invoice generated!');
      setShowInvoiceModal(true);
    } catch (err) {
      setError(err.message || 'Failed to generate invoice. Make sure workorder is COMPLETED.');
    } finally {
      setGeneratingInvoice(false);
    }
  };

  useEffect(() => {
    if (selectedWoId) {
      loadJobCard(selectedWoId);
    }
  }, [selectedWoId]);

  // Save / Update Job Card Details
  const handleSaveJobCard = async (e) => {
    e.preventDefault();
    if (!currentJobCard) return;

    setSavingJob(true);
    setError('');
    setSuccess('');
    try {
      const updated = await jobCardApi.update(currentJobCard.jobId, {
        workDone,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : 0,
      });
      setCurrentJobCard(updated);
      setSuccess('Job Card work details & labor cost saved!');
    } catch (err) {
      setError(err.message || 'Failed to update Job Card');
    } finally {
      setSavingJob(false);
    }
  };

  // Add Part one-by-one
  const handleAddPart = async (e) => {
    e.preventDefault();
    if (!currentJobCard) return;

    setAddingPart(true);
    setError('');
    setSuccess('');
    try {
      await partApi.add(currentJobCard.jobId, {
        partName,
        quantity: parseInt(quantity, 10),
        unitPrice: parseFloat(unitPrice),
      });

      setPartName('');
      setQuantity(1);
      setUnitPrice('');
      setSuccess('Part added to Job Card!');

      // Refresh job card data
      loadJobCard(selectedWoId);
    } catch (err) {
      setError(err.message || 'Failed to add part');
    } finally {
      setAddingPart(false);
    }
  };

  // Delete Part
  const handleDeletePart = async (partId) => {
    if (!window.confirm('Remove this part from Job Card?')) return;
    setError('');
    setSuccess('');
    try {
      await partApi.delete(partId);
      setSuccess('Part removed from Job Card');
      loadJobCard(selectedWoId);
    } catch (err) {
      setError(err.message || 'Failed to delete part');
    }
  };

  // Calculate Parts total sum
  const partsList = currentJobCard?.parts || [];
  const partsGrandTotal = partsList.reduce((acc, item) => {
    const lineTotal = item.lineTotal != null ? parseFloat(item.lineTotal) : (item.quantity * parseFloat(item.unitPrice || 0));
    return acc + lineTotal;
  }, 0);

  const estimatedLaborCost = currentJobCard?.estimatedCost ? parseFloat(currentJobCard.estimatedCost) : 0;
  const overallTotal = partsGrandTotal + estimatedLaborCost;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827' }}>Job Cards & Parts Manager</h1>
        <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Record repair work completed and attach replacement spare parts</p>
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

      {/* Select Work Order Header */}
      <div className="card" style={{ borderTop: '4px solid #FF5722' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Select Active Work Order to Manage</label>
          <select
            className="form-select"
            value={selectedWoId}
            onChange={(e) => setSelectedWoId(e.target.value)}
          >
            <option value="">-- Choose Work Order --</option>
            {assignedOrders.map((wo) => (
              <option key={wo.workorderId} value={wo.workorderId}>
                Work Order #{wo.workorderId} - {wo.vehicleModel} ({wo.vehiclePlate}) - {wo.status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>Loading Job Card...</div>
      ) : !currentJobCard ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <FileText size={32} color="#9CA3AF" style={{ marginBottom: '0.5rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No Work Order Selected</h3>
          <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>Please select an assigned work order above to edit its Job Card.</p>
        </div>
      ) : (
        <div className="grid-2">
          {/* LEFT: JOB CARD WORK DETAILS */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #E5E7EB' }}>
              <Wrench size={22} color="#FF5722" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                Job Card #{currentJobCard.jobId} Overview
              </h3>
            </div>

            <form onSubmit={handleSaveJobCard}>
              <div className="form-group">
                <label className="form-label">Vehicle License Plate</label>
                <input
                  type="text"
                  className="form-input"
                  value={currentJobCard.vehiclePlate || 'N/A'}
                  disabled
                  style={{ background: '#F3F4F6' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Work Done & Maintenance Summary</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="Describe all repair tasks performed, diagnostics completed, tune-ups, etc."
                  value={workDone}
                  onChange={(e) => setWorkDone(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Estimated Labor & Service Cost (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  placeholder="e.g. 150.00"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={savingJob}>
                <Save size={18} />
                <span>{savingJob ? 'Saving Details...' : 'Save Job Details & Labor Cost'}</span>
              </button>
            </form>
          </div>

          {/* RIGHT: SPARE PARTS TABLE & ADD FORM */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #E5E7EB' }}>
              <Package size={22} color="#FF5722" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                Parts Used ({partsList.length})
              </h3>
            </div>

            {/* Add Part Form */}
            <form onSubmit={handleAddPart} style={{ background: '#F9FAFB', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem', border: '1px solid #E5E7EB' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: '#111827' }}>
                Add Replacement Part (One-by-One)
              </h4>

              <div className="form-group">
                <label className="form-label">Part Name / Component</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Oil Filter, Brake Pads, Spark Plug"
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Unit Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="e.g. 45.00"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-secondary" style={{ width: '100%', borderColor: '#FF5722', color: '#FF5722' }} disabled={addingPart}>
                <Plus size={16} />
                <span>{addingPart ? 'Adding Part...' : 'Add Part to Job Card'}</span>
              </button>
            </form>

            {/* Installed Parts List */}
            {partsList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: '#9CA3AF', background: '#FAFAFA', borderRadius: '8px', fontSize: '0.875rem' }}>
                No spare parts added to this job card yet. Add parts using the form above.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {partsList.map((p) => {
                  const lineTotal = p.lineTotal != null ? parseFloat(p.lineTotal) : (p.quantity * parseFloat(p.unitPrice));
                  return (
                    <div key={p.partId} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      background: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '0.9rem'
                    }}>
                      <div>
                        <strong style={{ color: '#111827' }}>{p.partName}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                          Qty: {p.quantity} &times; ₹{parseFloat(p.unitPrice).toFixed(2)}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontWeight: 800, color: '#111827' }}>
                          ₹{lineTotal.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleDeletePart(p.partId)}
                          style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Total Summary Box */}
            <div style={{ background: '#111827', color: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#D1D5DB' }}>
                <span>Parts Subtotal:</span>
                <span>₹{partsGrandTotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem', color: '#D1D5DB' }}>
                <span>Labor & Service Estimate:</span>
                <span>₹{estimatedLaborCost.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid #374151', fontSize: '1.15rem', fontWeight: 800 }}>
                <span>Grand Total Estimate:</span>
                <span style={{ color: '#FF5722' }}>₹{overallTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Official Tax Invoice Action Box */}
            <div style={{ background: '#FFF3E0', padding: '1.25rem', borderRadius: '12px', border: '1px solid #FFE0B2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Receipt size={20} color="#FF5722" />
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                  Official Tax Invoice
                </h4>
              </div>

              {invoice ? (
                <div>
                  <p style={{ fontSize: '0.85rem', color: '#4B5563', margin: '0 0 0.75rem 0' }}>
                    Invoice #{invoice.invoiceId} generated. Total Payable: <strong>₹{parseFloat(invoice.totalCost).toFixed(2)}</strong> (incl 18% GST). Status: <strong style={{ color: invoice.paid ? '#10B981' : '#F59E0B' }}>{invoice.paid ? 'PAID' : 'UNPAID'}</strong>
                  </p>
                  <button
                    className="btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => setShowInvoiceModal(true)}
                  >
                    <Receipt size={16} />
                    <span>View Official Tax Invoice</span>
                  </button>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: '0.85rem', color: '#4B5563', margin: '0 0 0.75rem 0' }}>
                    Once workorder is COMPLETED, generate the final Tax Invoice with 18% GST calculations for customer payment.
                  </p>
                  <button
                    className="btn-primary"
                    style={{ width: '100%' }}
                    onClick={handleGenerateInvoice}
                    disabled={generatingInvoice}
                  >
                    <Receipt size={16} />
                    <span>{generatingInvoice ? 'Generating Invoice...' : 'Generate Official Tax Invoice'}</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Invoice Modal for Mechanic View */}
      {showInvoiceModal && invoice && (
        <InvoiceModal
          invoice={invoice}
          isCustomer={false}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}
    </div>
  );
}
