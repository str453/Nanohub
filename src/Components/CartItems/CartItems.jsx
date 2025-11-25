/* 
Functional Requirement #8-11 Shopping Cart
Functional Requirement #16 Checkout
*/

import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import './CartItems.css'
import { ShopContext } from './../../Context/ShopContext';
import remove_icon from '../Assets/cart_cross_icon.png'

const CartItems = () => {
    const {getTotalCartAmount, getTaxAmount, getFinalTotal, all_product, cartItems, addToCart, removeFromCart} = useContext(ShopContext)
    const navigate = useNavigate();
    
    const subtotal = getTotalCartAmount() || 0;
    const tax = getTaxAmount() || 0;
    const total = getFinalTotal() || 0;
  return (
    <div className='cartitems'>
        <div className="cartitems-format-main">
            <p>Products</p>
            <p>Title</p>
            <p>Price</p>
            <p>Quantity</p>
            <p>Total</p>
            <p>Remove</p>
        </div>
        <hr />
        {all_product.map((e)=>{
            if(cartItems[e.id]>0)
            {
                const itemPrice = e.price || 0;
                const itemTotal = itemPrice * cartItems[e.id];
                return <div key={e.id}>
                            <div className="cartitems-format cartitems-format-main">
                                <img src={e.image} alt="" className='carticon-product-icon'/>
                                <p>{e.name}</p>
                                <p>${itemPrice.toFixed(2)}</p>
                                <div className='cartitems-quantity-controls'>
                                    <button 
                                        className='cartitems-quantity-btn' 
                                        onClick={() => removeFromCart(e.id)}
                                        disabled={cartItems[e.id] <= 0}
                                    >
                                        −
                                    </button>
                                    <span className='cartitems-quantity-value'>{cartItems[e.id]}</span>
                                    <button 
                                        className='cartitems-quantity-btn' 
                                        onClick={() => addToCart(e.id)}
                                    >
                                        +
                                    </button>
                                </div>
                                <p>${itemTotal.toFixed(2)}</p>
                                <img className='cartitems-remove-icon'src={remove_icon} onClick={()=>{removeFromCart(e.id)}} alt="" />
                            </div>
                            <hr />
                        </div>
            }
            return null;
        })}
        <div className="cartitems-down">
            <div className="cartitems-total">
                <h1>Cart Total</h1>
                <div>
                    <div className="cartitems-total-item">
                        <p>Subtotal</p>
                        <p>${subtotal.toFixed(2)}</p>
                    </div>
                    <hr />
                    <div className="cartitems-total-item">
                        <p>Tax (8.75%)</p>
                        <p>${tax.toFixed(2)}</p>
                    </div>
                    <hr />
                    <div className="cartitems-total-item">
                        <p>Shipping Total</p>
                        <p>Free</p>
                    </div>
                    <hr />
                    <div className="cartitems-total-item">
                        <h3>Total</h3>
                        <h3>${total.toFixed(2)}</h3>
                    </div>
                </div>
                <button onClick={() => navigate('/checkout')}>PROCEED TO CHECKOUT</button>
            </div>
            <div className="cartitems-promocode">
                <p>Enter Promo Code:</p>
                <div className="cartitems-promobox">
                    <input type="text" placeholder='Promo Code' />
                    <button>Submit</button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default CartItems