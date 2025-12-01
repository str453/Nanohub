import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { paymentAPI } from '../services/api';
import './CSS/OrderHistory.css';

const OrderHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'ordered', 'shipped', 'delivered'

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await paymentAPI.getOrders(token);
        
        if (response.success) {
          // Sort orders by creation date (newest first) - use createdAt as primary sort
          // This ensures orders are sorted by when they were actually created in the database
          const sortedOrders = response.orders.sort((a, b) => {
            // Use createdAt as primary sort (when order was inserted into DB)
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            
            if (dateB !== dateA) {
              return dateB - dateA; // Newest first
            }
            // If dates are equal, sort by _id (newest first) for consistent ordering
            const idA = a._id ? a._id.toString() : '';
            const idB = b._id ? b._id.toString() : '';
            return idB.localeCompare(idA);
          });
          setOrders(sortedOrders);
        } else {
          setError(response.error || 'Failed to fetch orders');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('No order history found');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  // Filter orders by status
  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  // Calculate total spent
  const totalSpent = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

  // Get status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case 'delivered':
        return 'status-delivered';
      case 'shipped':
        return 'status-shipped';
      case 'ordered':
        return 'status-ordered';
      default:
        return 'status-ordered';
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="order-history-page">
        <div className="order-history-container">
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-history-page">
      <div className="order-history-container">
        <div className="order-history-header">
          <h1>Order History</h1>
          <div className="order-history-stats">
            <div className="stat-card">
              <span className="stat-label">Total Orders</span>
              <span className="stat-value">{orders.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Total Spent</span>
              <span className="stat-value">${totalSpent.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Filter buttons */}
        <div className="order-filters">
          <button 
            className={filterStatus === 'all' ? 'active' : ''}
            onClick={() => setFilterStatus('all')}
          >
            All Orders ({orders.length})
          </button>
          <button 
            className={filterStatus === 'ordered' ? 'active' : ''}
            onClick={() => setFilterStatus('ordered')}
          >
            Ordered ({orders.filter(o => o.status === 'ordered').length})
          </button>
          <button 
            className={filterStatus === 'shipped' ? 'active' : ''}
            onClick={() => setFilterStatus('shipped')}
          >
            Shipped ({orders.filter(o => o.status === 'shipped').length})
          </button>
          <button 
            className={filterStatus === 'delivered' ? 'active' : ''}
            onClick={() => setFilterStatus('delivered')}
          >
            Delivered ({orders.filter(o => o.status === 'delivered').length})
          </button>
        </div>

        {/* Orders list */}
        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <p>No orders found{filterStatus !== 'all' ? ` with status "${filterStatus}"` : ''}.</p>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order #{order._id.toString().slice(-8).toUpperCase()}</h3>
                    <p className="order-date">Ordered: {formatDate(order.orderedAt || order.createdAt)}</p>
                  </div>
                  <div className={`status-badge ${getStatusClass(order.status)}`}>
                    {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Ordered'}
                  </div>
                </div>

                <div className="order-items">
                  {order.orderItems && order.orderItems.length > 0 ? (
                    order.orderItems.map((item, index) => {
                      // Helper to get product image URL
                      const getImageUrl = () => {
                        if (item.product && typeof item.product === 'object') {
                          // Try images array
                          if (item.product.images && Array.isArray(item.product.images) && item.product.images.length > 0) {
                            const firstImg = item.product.images[0];
                            if (typeof firstImg === 'string') return firstImg;
                            if (firstImg && firstImg.url) return firstImg.url;
                          }
                          // Try single image field
                          if (item.product.image) return item.product.image;
                        }
                        return '/placeholder.png';
                      };

                      const imageUrl = getImageUrl();
                      const productName = item.name || (item.product && typeof item.product === 'object' ? item.product.name : 'Product');

                      return (
                        <div key={index} className="order-item">
                          <img 
                            src={imageUrl}
                            alt={productName}
                            className="order-item-image"
                            onError={(e) => {
                              e.target.src = '/placeholder.png';
                              e.target.onerror = null; // Prevent infinite loop
                            }}
                          />
                          <div className="order-item-details">
                            <h4>{productName}</h4>
                            <p>Quantity: {item.quantity}</p>
                            <p className="order-item-price">${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p>No items in this order</p>
                  )}
                </div>

                <div className="order-timeline">
                  <div className="timeline-item">
                    <span className="timeline-label">Ordered:</span>
                    <span className="timeline-date">{formatDate(order.orderedAt || order.createdAt)}</span>
                  </div>
                  {order.shippedAt && (
                    <div className="timeline-item">
                      <span className="timeline-label">Shipped:</span>
                      <span className="timeline-date">{formatDate(order.shippedAt)}</span>
                    </div>
                  )}
                  {order.deliveredAt && (
                    <div className="timeline-item">
                      <span className="timeline-label">Delivered:</span>
                      <span className="timeline-date">{formatDate(order.deliveredAt)}</span>
                    </div>
                  )}
                </div>

                <div className="order-summary">
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>${(order.itemsPrice || 0).toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Tax:</span>
                    <span>${(order.taxPrice || 0).toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Shipping:</span>
                    <span>${(order.shippingPrice || 0).toFixed(2)}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total:</span>
                    <span>${(order.totalPrice || 0).toFixed(2)}</span>
                  </div>
                </div>

                {order.shippingAddress && (
                  <div className="order-shipping">
                    <h4>Shipping Address:</h4>
                    <p>
                      {order.shippingAddress.street}<br/>
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;

