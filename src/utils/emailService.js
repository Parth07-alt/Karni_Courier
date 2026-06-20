/**
 * Email Service — calls the Express backend (server/server.js)
 * which uses Nodemailer to send emails via Gmail SMTP.
 */

const API_BASE = 'http://localhost:3001';

/**
 * Sends an order confirmation greeting email to the customer.
 */
export const sendOrderConfirmationEmail = async (orderData, userEmail) => {
  try {
    const response = await fetch(`${API_BASE}/api/send-order-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to_email: userEmail || orderData.userEmail || orderData.sender?.email,
        to_name: orderData.sender?.name || 'Valued Customer',
        awb_number: orderData.awbNumber,
      }),
    });

    const data = await response.json();
    if (data.success) {
      console.log('Order confirmation email sent successfully');
    } else {
      console.warn('Email API error:', data.error);
    }
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
  }
};

/**
 * Sends a pickup confirmation email with Cargo details.
 */
export const sendPickupConfirmationEmail = async (orderData, cargoCompany, cargoAwb, userEmail) => {
  try {
    const response = await fetch(`${API_BASE}/api/send-pickup-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to_email: userEmail || orderData.userEmail || orderData.sender?.email,
        to_name: orderData.sender?.name || 'Valued Customer',
        awb_number: cargoAwb || orderData.awbNumber,
        cargo_company: cargoCompany,
      }),
    });

    const data = await response.json();
    if (data.success) {
      console.log('Pickup confirmation email sent successfully');
    } else {
      console.warn('Email API error:', data.error);
    }
  } catch (error) {
    console.error('Failed to send pickup confirmation email:', error);
  }
};

/**
 * Sends a cancellation confirmation email.
 */
export const sendCancellationEmail = async (orderData, cancelReason, userEmail) => {
  try {
    const response = await fetch(`${API_BASE}/api/send-cancel-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to_email: userEmail || orderData.userEmail || orderData.sender?.email,
        to_name: orderData.sender?.name || 'Valued Customer',
        awb_number: orderData.awbNumber,
        cancel_reason: cancelReason,
      }),
    });

    const data = await response.json();
    if (data.success) {
      console.log('Cancellation email sent successfully');
    } else {
      console.warn('Email API error:', data.error);
    }
  } catch (error) {
    console.error('Failed to send cancellation email:', error);
  }
};
