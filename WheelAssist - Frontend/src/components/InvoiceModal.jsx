import React, { useState } from 'react';
import { FileText, Wrench, Package, CheckCircle2, ShieldCheck, AlertCircle, CreditCard, Printer, X } from 'lucide-react';
import { paymentApi } from '../services/api';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function InvoiceModal({ invoice: initialInvoice, onClose, onPaymentSuccess, isCustomer }) {
  const [currentInvoice, setCurrentInvoice] = useState(initialInvoice);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!currentInvoice) return null;

  const parts = currentInvoice.parts || [];
  const partsCost = currentInvoice.partsCost ? parseFloat(currentInvoice.partsCost) : 0;
  const labourCost = currentInvoice.labourCost ? parseFloat(currentInvoice.labourCost) : 0;
  const gst = currentInvoice.gst ? parseFloat(currentInvoice.gst) : 0;
  const totalCost = currentInvoice.totalCost ? parseFloat(currentInvoice.totalCost) : 0;
  const isPaid = Boolean(currentInvoice.paid);

  const handlePayNow = async () => {
    setPaying(true);
    setError('');
    setSuccess('');

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Razorpay payment gateway SDK failed to load. Check your internet connection.');
      }

      // Step 1: Request order creation from backend
      const orderData = await paymentApi.createOrder(currentInvoice.invoiceId);

      // Step 2: Open Razorpay modal
      const options = {
        key: orderData.razorpayKeyId,
        amount: orderData.amountInPaise,
        currency: orderData.currency || 'INR',
        name: 'WheelAssist Service Portal',
        description: `Service Invoice #${currentInvoice.invoiceId} (${currentInvoice.vehiclePlate || 'Vehicle'})`,
        order_id: orderData.razorpayOrderId,
        handler: async function (response) {
          try {
            // Step 3: Send verification handshake back to backend
            const verifyResponse = await paymentApi.verify({
              invoiceId: currentInvoice.invoiceId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            setSuccess('Payment verified successfully! Thank you.');
            setCurrentInvoice((prev) => ({ ...prev, paid: true }));
            if (onPaymentSuccess) {
              onPaymentSuccess(verifyResponse);
            }
          } catch (verifyErr) {
            setError('Payment verification failed: ' + verifyErr.message);
          } finally {
            setPaying(false);
          }
        },
        prefill: {
          name: currentInvoice.ownerName || '',
        },
        theme: {
          color: '#FF5722',
        },
        modal: {
          ondismiss: function () {
            setPaying(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.message || 'Failed to initialize payment gateway.');
      setPaying(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        style={{
          maxWidth: '750px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: '#111827',
            color: '#FFFFFF',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '4px solid #FF5722',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#FF5722', padding: '6px', borderRadius: '8px', display: 'flex' }}>
              <FileText size={22} color="#FFFFFF" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                TAX INVOICE #{currentInvoice.invoiceId}
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: 0 }}>
                WheelAssist Authorized Service Network
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '1.5rem', cursor: 'pointer' }}
          >
            &times;
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {error && (
            <div className="alert-box alert-error" style={{ marginBottom: '1rem' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert-box alert-success" style={{ marginBottom: '1rem' }}>
              <CheckCircle2 size={18} />
              <span>{success}</span>
            </div>
          )}

          {/* Invoice Summary Box */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', background: '#F9FAFB', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #E5E7EB' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 700 }}>Billed To</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#111827' }}>{currentInvoice.ownerName || 'Customer'}</div>
              <div style={{ fontSize: '0.8rem', color: '#4B5563' }}>Plate: {currentInvoice.vehiclePlate || 'N/A'}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 700 }}>Service Specialist</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FF5722' }}>{currentInvoice.mechanicName || 'Specialist'}</div>
              <div style={{ fontSize: '0.8rem', color: '#4B5563' }}>Work Order #{currentInvoice.workorderId}</div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 700 }}>Payment Status</div>
              <div style={{ marginTop: '0.25rem' }}>
                <span className={`status-badge ${isPaid ? 'status-DELIVERED' : 'status-PENDING'}`} style={{ fontSize: '0.85rem', padding: '4px 10px' }}>
                  {isPaid ? 'PAID' : 'UNPAID'}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.4rem' }}>
                {currentInvoice.invoiceDate ? new Date(currentInvoice.invoiceDate).toLocaleDateString() : 'Recent'}
              </div>
            </div>
          </div>

          {/* Work Done Overview */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Wrench size={16} color="#FF5722" />
              <span>Service Summary & Work Conducted</span>
            </h4>
            <div style={{ background: '#FFFFFF', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.9rem', color: '#374151' }}>
              {currentInvoice.workDone || 'General maintenance and system diagnostics.'}
            </div>
          </div>

          {/* Parts Breakdown */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Package size={16} color="#FF5722" />
              <span>Spare Parts & Replaced Components</span>
            </h4>

            {parts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1rem', color: '#9CA3AF', background: '#FAFAFA', borderRadius: '8px', fontSize: '0.85rem' }}>
                No external spare parts replaced. Service consisted of labor & inspection only.
              </div>
            ) : (
              <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
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

          {/* Detailed Financial Calculation Table */}
          <div style={{ background: '#111827', color: '#FFFFFF', padding: '1.25rem', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#D1D5DB' }}>
              <span>Spare Parts Subtotal:</span>
              <span>₹{partsCost.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#D1D5DB' }}>
              <span>Labour & Service Charges:</span>
              <span>₹{labourCost.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.875rem', color: '#D1D5DB' }}>
              <span>GST (18% Applicable Tax):</span>
              <span>₹{gst.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid #374151', fontSize: '1.2rem', fontWeight: 800 }}>
              <span>Grand Total Payable:</span>
              <span style={{ color: '#FF5722' }}>₹{totalCost.toFixed(2)}</span>
            </div>

            {/* Direct Pay Action inside total box */}
            {isCustomer && !isPaid && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed #374151' }}>
                <button
                  className="btn-primary"
                  onClick={handlePayNow}
                  disabled={paying}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1.5rem',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.6rem',
                    background: '#FF5722',
                    boxShadow: '0 8px 20px rgba(255, 87, 34, 0.4)',
                    cursor: paying ? 'not-allowed' : 'pointer',
                  }}
                >
                  <CreditCard size={20} />
                  <span>{paying ? 'Processing Payment...' : `Pay ₹${totalCost.toFixed(2)} with Razorpay`}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Footer Actions Bar */}
        <div
          style={{
            padding: '1rem 1.5rem',
            background: '#F9FAFB',
            borderTop: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <button className="btn-secondary" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Printer size={16} />
            <span>Print Invoice</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>

            {isCustomer && !isPaid && (
              <button
                className="btn-primary"
                onClick={handlePayNow}
                disabled={paying}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.25rem',
                  fontWeight: 700,
                }}
              >
                <CreditCard size={18} />
                <span>{paying ? 'Processing...' : `Pay ₹${totalCost.toFixed(2)} with Razorpay`}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
