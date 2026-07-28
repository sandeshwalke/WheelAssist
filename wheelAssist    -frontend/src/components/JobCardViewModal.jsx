import React from 'react';
import { FileText, Wrench, Package, CheckCircle2, DollarSign, X } from 'lucide-react';

export default function JobCardViewModal({ jobCard, onClose }) {
  if (!jobCard) return null;

  const parts = jobCard.parts || [];
  const partsTotal = parts.reduce((acc, p) => {
    const total = p.lineTotal != null ? parseFloat(p.lineTotal) : (p.quantity * parseFloat(p.unitPrice || 0));
    return acc + total;
  }, 0);

  const laborCost = jobCard.estimatedCost ? parseFloat(jobCard.estimatedCost) : 0;
  const grandTotal = partsTotal + laborCost;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '700px' }}>
        <div className="modal-header" style={{ background: '#111827', color: '#FFFFFF', borderBottom: '4px solid #FF5722' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText size={22} color="#FF5722" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
              Job Card & Service Invoice #{jobCard.jobId}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '1.5rem', cursor: 'pointer' }}
          >
            &times;
          </button>
        </div>

        <div className="modal-body">
          {/* Header Summary Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#F9FAFB', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #E5E7EB' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 700 }}>Vehicle Plate</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>{jobCard.vehiclePlate || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 700 }}>Assigned Mechanic</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FF5722' }}>{jobCard.mechanicName || 'Assigned Specialist'}</div>
            </div>
          </div>

          {/* Work Done Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Wrench size={18} color="#FF5722" />
              <span>Work Done & Maintenance Performed</span>
            </h4>
            <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.925rem', color: '#374151', minHeight: '60px' }}>
              {jobCard.workDone || 'Work in progress / Diagnostics undergoing.'}
            </div>
          </div>

          {/* Itemized Parts Table */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Package size={18} color="#FF5722" />
              <span>Itemized Replacement Spare Parts</span>
            </h4>

            {parts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.25rem', color: '#9CA3AF', background: '#FAFAFA', borderRadius: '8px', fontSize: '0.875rem' }}>
                No parts replaced yet for this repair job.
              </div>
            ) : (
              <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#F3F4F6', color: '#374151', borderBottom: '1px solid #E5E7EB' }}>
                      <th style={{ padding: '0.65rem 1rem' }}>Part Description</th>
                      <th style={{ padding: '0.65rem 1rem', textAlign: 'center' }}>Qty</th>
                      <th style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>Unit Price</th>
                      <th style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parts.map((p) => {
                      const total = p.lineTotal != null ? parseFloat(p.lineTotal) : (p.quantity * parseFloat(p.unitPrice || 0));
                      return (
                        <tr key={p.partId} style={{ borderBottom: '1px solid #F3F4F6' }}>
                          <td style={{ padding: '0.65rem 1rem', fontWeight: 600, color: '#111827' }}>{p.partName}</td>
                          <td style={{ padding: '0.65rem 1rem', textAlign: 'center', color: '#4B5563' }}>{p.quantity}</td>
                          <td style={{ padding: '0.65rem 1rem', textAlign: 'right', color: '#4B5563' }}>₹{parseFloat(p.unitPrice).toFixed(2)}</td>
                          <td style={{ padding: '0.65rem 1rem', textAlign: 'right', fontWeight: 700, color: '#111827' }}>₹{total.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Grand Total Summary */}
          <div style={{ background: '#111827', color: '#FFFFFF', padding: '1.25rem', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#D1D5DB' }}>
              <span>Spare Parts Subtotal:</span>
              <span>₹{partsTotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem', color: '#D1D5DB' }}>
              <span>Labor & Service Charges:</span>
              <span>₹{laborCost.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid #374151', fontSize: '1.2rem', fontWeight: 800 }}>
              <span>Grand Total Amount:</span>
              <span style={{ color: '#FF5722' }}>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
