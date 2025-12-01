/* 
Functional Requirement #1 - Home Page
*/
import React, { useState, useEffect } from 'react'
import './Hero.css'
import hand_icon from '../Assets/hand_icon.png'
import arrow_icon from '../Assets/arrow.png'
import { productAPI } from '../../services/api'

export const Hero = () => {
  const [heroImage, setHeroImage] = useState('/placeholder.png')
  const [loading, setLoading] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    fetchRandomProductImage()
  }, [])

  useEffect(() => {
    // Set interval to change image every 10 seconds
    const interval = setInterval(() => {
      setFadeOut(true) // Start fade out
      
      setTimeout(() => {
        fetchRandomProductImage()
        setFadeOut(false) // Start fade in
      }, 500) // Wait for fade out animation
    }, 10000) // Change every 10 seconds

    return () => clearInterval(interval)
  }, [])

  const fetchRandomProductImage = async () => {
    try {
      setLoading(true)
      // Fetch products from a category
      const response = await productAPI.getProductsByCategoryPaginated('GPU', 1, 50)
      
      if (response.success && response.products && response.products.length > 0) {
        // Pick a random product
        const randomProduct = response.products[Math.floor(Math.random() * response.products.length)]
        
        // Get image URL
        const imageUrl = randomProduct.images && randomProduct.images.length > 0 
          ? randomProduct.images[0].url 
          : '/placeholder.png'
        
        setHeroImage(imageUrl)
      }
    } catch (error) {
      console.error('Error fetching random product image:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className = 'hero'>
        <div className="hero-left">
            <h2>NEW ARRIVALS ONLY</h2>
            <div>
               <div className="hero-hand-icon">
                <p>new</p>
                <img src={hand_icon} alt=""/>
               </div>
                <p>best deals on</p>
                <p>computer parts</p>
            </div>
            <div className="hero-latest-btn">
                <div>Latest Collection</div>
                <img src={arrow_icon} alt="" />
            </div>
        </div>
        <div className="hero-right">
            {loading ? (
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                <p>Loading...</p>
              </div>
            ) : (
              <img 
                src={heroImage} 
                alt="New Product"
                style={{
                  opacity: fadeOut ? 0 : 1,
                  transition: 'opacity 0.5s ease-in-out'
                }}
              />
            )}
        </div>
    </div>
  )
}

export default Hero