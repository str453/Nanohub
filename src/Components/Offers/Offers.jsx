/* 
Functional Requirement #1 - Home Page
*/
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Offers.css'
import { productAPI } from '../../services/api'

export const Offers = () => {
  const [discountedProducts, setDiscountedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const STORAGE_KEY = 'exclusive_offers_products'

  useEffect(() => {
    fetchDiscountedProducts()
  }, [])

  const fetchDiscountedProducts = async () => {
    try {
      setLoading(true)
      
      // Check if we have stored products in localStorage
      const storedProducts = localStorage.getItem(STORAGE_KEY)
      
      if (storedProducts) {
        try {
          // Use stored products directly - they are already formatted
          const products = JSON.parse(storedProducts)
          // Validate that stored products are in the correct format
          if (Array.isArray(products) && products.length === 3 && products[0]?.id) {
            setDiscountedProducts(products)
            setLoading(false)
            return
          }
        } catch (err) {
          console.error('Error parsing stored products:', err)
          // Clear corrupted data and fetch fresh
          localStorage.removeItem(STORAGE_KEY)
        }
      }
      
      // If no stored products or couldn't parse them, fetch new random ones
      const categories = ['GPU', 'CPU', 'Monitor', 'Motherboard', 'Cooling', 'Case', 'Storage']
      
      const fetchPromises = categories.slice(0, 3).map(category =>
        productAPI.getProductsByCategoryPaginated(category, 1, 50)
          .then(response => {
            if (response.success && response.products && response.products.length > 0) {
              return response.products[Math.floor(Math.random() * response.products.length)]
            }
            return null
          })
          .catch(() => null)
      )

      const results = await Promise.all(fetchPromises)
      const products = results.filter(p => p !== null).slice(0, 3)
      
      setFormattedProducts(products)
    } catch (error) {
      console.error('Error fetching discounted products:', error)
    } finally {
      setLoading(false)
    }
  }

  const setFormattedProducts = (products) => {
    const formattedProducts = products.map(product => {
      const discountPercentage = 20
      const originalPrice = parseFloat(product.price) || 0
      const discountedPrice = (originalPrice * (1 - discountPercentage / 100)).toFixed(2)
      
      return {
        id: product._id || product.id,
        name: product.name,
        image: product.images && product.images.length > 0 ? product.images[0].url : '/placeholder.png',
        price: originalPrice,
        originalPrice: originalPrice,
        discountedPrice: parseFloat(discountedPrice),
        discount: discountPercentage,
        brand: product.brand,
        category: product.category
      }
    })

    // Store the formatted products for persistence
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formattedProducts))
    setDiscountedProducts(formattedProducts)
  }

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`)
  }

  const handleResetOffers = () => {
    localStorage.removeItem(STORAGE_KEY)
    setDiscountedProducts([])
    fetchDiscountedProducts()
  }

  if (loading) {
    return (
      <div className="offers-container">
        <h1>EXCLUSIVE OFFERS</h1>
        <hr />
        <div className="offers-loading">Loading exclusive products...</div>
      </div>
    )
  }

  return (
    <div className="offers-container">
      <h1>EXCLUSIVE OFFERS</h1>
      <hr />
      <div className="offers-products-grid">
        {discountedProducts.map((product) => (
          <div 
            key={product.id} 
            className="offers-product-card"
            onClick={() => handleProductClick(product.id)}
          >
            <div className="product-image-container">
              <img src={product.image} alt={product.name} className="product-image" />
              <span className="discount-badge">-{product.discount}%</span>
            </div>
            <p className="product-category">{product.category}</p>
            <h3 className="product-name">{product.name}</h3>
            <div className="product-prices">
              <span className="discounted-price">${typeof product.discountedPrice === 'number' ? product.discountedPrice.toFixed(2) : parseFloat(product.discountedPrice).toFixed(2)}</span>
              <span className="original-price">${typeof product.originalPrice === 'number' ? product.originalPrice.toFixed(2) : parseFloat(product.originalPrice).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
  
}

export default Offers