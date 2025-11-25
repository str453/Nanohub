import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CSS/OrderSuccess.css';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId;

  return (
    <div className="order-success-page">
      <div className="order-success-container">
        <div className="success-icon">✓</div>
        <h1>Order Placed Successfully!</h1>
        <p>Thank you for your purchase.</p>
        {orderId && (
          <p className="order-id">Order ID: {orderId}</p>
        )}
        <div className="success-actions">
          <button onClick={() => navigate('/')} className="btn-primary">
            Continue Shopping
          </button>
          <button onClick={() => navigate('/cart')} className="btn-secondary">
            View Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;

