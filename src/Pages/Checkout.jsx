/*
Functional Requirement #16
*/
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ShopContext } from '../Context/ShopContext';
import { useAuth } from '../Context/AuthContext';
import { paymentAPI } from '../services/api';
import { STRIPE_PUBLISHABLE_KEY } from '../config/stripe';
import './CSS/Checkout.css';

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { all_product, cartItems, getTotalCartAmount, getTaxAmount, getFinalTotal } = useContext(ShopContext);
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: 'US'  // ISO 3166-1 alpha-2 country code (US, not USA)
  });

  // Get token from localStorage
  const token = localStorage.getItem('token');

  const subtotal = getTotalCartAmount() || 0;
  const tax = getTaxAmount() || 0;
  const total = getFinalTotal() || 0;

  // Redirect if not logged in (wait for auth to finish loading)
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Redirect if cart is empty
  useEffect(() => {
    const hasItems = Object.values(cartItems).some(qty => qty > 0);
    if (!authLoading && !hasItems) {
      navigate('/cart');
    }
  }, [cartItems, authLoading, navigate]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="checkout-loading">
        <p>Loading...</p>
      </div>
    );
  }

  // Don't render form if not logged in (will redirect)
  if (!user) {
    return null;
  }

  const handleAddressChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!stripe || !elements) {
      setLoading(false);
      return;
    }

    // Validate shipping address
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipcode) {
      setError('Please fill in all shipping address fields');
      setLoading(false);
      return;
    }

    try {
      // Create payment intent
      const paymentIntentResponse = await paymentAPI.createPaymentIntent(total, token);
      
      if (!paymentIntentResponse.success) {
        throw new Error(paymentIntentResponse.error || 'Failed to create payment intent');
      }

      // Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        paymentIntentResponse.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: user.name,
              email: user.email,
              address: {
                line1: shippingAddress.street,
                city: shippingAddress.city,
                state: shippingAddress.state,
                postal_code: shippingAddress.zipcode,
                country: shippingAddress.country
              }
            }
          }
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Prepare order items
        const orderItems = [];
        for (const itemId in cartItems) {
          if (cartItems[itemId] > 0) {
            const product = all_product.find(p => p.id === itemId);
            if (product) {
              orderItems.push({
                product: itemId,
                name: product.name,
                price: product.price,
                quantity: cartItems[itemId]
              });
            }
          }
        }

        // Create order
        const orderData = {
          orderItems,
          shippingAddress,
          paymentMethod: 'credit_card',
          paymentResult: {
            id: paymentIntent.id,
            status: paymentIntent.status,
            update_time: new Date().toISOString(),
            email_address: user.email
          },
          itemsPrice: subtotal,
          taxPrice: tax,
          shippingPrice: 0,
          totalPrice: total
        };

        const orderResponse = await paymentAPI.createOrder(orderData, token);
        
        if (orderResponse.success) {
          // Redirect to success page or order confirmation
          navigate('/order-success', { state: { orderId: orderResponse.order._id } });
        } else {
          throw new Error(orderResponse.error || 'Failed to create order');
        }
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Payment processing failed. Please try again.');
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <div className="checkout-section">
        <h2>Shipping Address</h2>
        <div className="checkout-form-group">
          <input
            type="text"
            name="street"
            placeholder="Street Address"
            value={shippingAddress.street}
            onChange={handleAddressChange}
            required
          />
        </div>
        <div className="checkout-form-row">
          <input
            type="text"
            name="city"
            placeholder="City"
            value={shippingAddress.city}
            onChange={handleAddressChange}
            required
          />
          <input
            type="text"
            name="state"
            placeholder="State"
            value={shippingAddress.state}
            onChange={handleAddressChange}
            required
          />
          <input
            type="text"
            name="zipcode"
            placeholder="ZIP Code"
            value={shippingAddress.zipcode}
            onChange={handleAddressChange}
            required
          />
        </div>
      </div>

      <div className="checkout-section">
        <h2>Payment Information</h2>
        <div className="checkout-card-element">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {error && <div className="checkout-error">{error}</div>}

      <div className="checkout-summary">
        <div className="checkout-summary-item">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="checkout-summary-item">
          <span>Tax:</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="checkout-summary-item checkout-total">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="checkout-submit-btn"
      >
        {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
      </button>
    </form>
  );
};

const Checkout = () => {
  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1>Checkout</h1>
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      </div>
    </div>
  );
};

export default Checkout;

