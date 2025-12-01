/* 
Functional Requirement #1 - Home Page
*/
import React, { useState, useEffect } from 'react'
import './Offers.css'
import { productAPI } from '../../services/api'

export const Offers = () => {
  const [discountedProducts, setDiscountedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRandomDiscountedProducts()
  }, [])

  const fetchRandomDiscountedProducts = async () => {
    try {
      setLoading(true)
      const categories = ['GPU', 'CPU', 'Monitor', 'Motherboard', 'Cooling', 'Case', 'Storage']
      
      // Fetch products from random categories
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

      const formattedProducts = products.map(product => ({
        id: product._id || product.id,
        name: product.name,
        image: product.images && product.images.length > 0 ? product.images[0].url : '/placeholder.png',
        price: product.price,
        originalPrice: product.price,
        discountedPrice: (product.price * 0.8).toFixed(2),
        brand: product.brand,
        category: product.category
      }))

      setDiscountedProducts(formattedProducts)
    } catch (error) {
      console.error('Error fetching discounted products:', error)
    } finally {
      setLoading(false)
    }
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
          <div key={product.id} className="offers-product-card">
            <div className="product-image-container">
              <img src={product.image} alt={product.name} className="product-image" />
              <span className="discount-badge">-20%</span>
            </div>
            <p className="product-category">{product.category}</p>
            <h3 className="product-name">{product.name}</h3>
            <div className="product-prices">
              <span className="discounted-price">${product.discountedPrice}</span>
              <span className="original-price">${product.originalPrice.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
  
}

export default Offers