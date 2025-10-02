import React from 'react'
import './Offers.css'
import exclusive_image from '../Assets/exclusive_image.webp'

export const Offers = () => {
  return (
    <div className="offers">
        <div className="offers-left">
            <h1>Exclusive</h1>
            <h1>Offers</h1>
            <p>Save 20% off! Offer ends soon!</p>
            <button>SHOP NOW</button>
        </div>
        <div className="offers-right">
            <img src={exclusive_image} alt="" />
        </div>
    </div>
  )
  
}

export default Offers