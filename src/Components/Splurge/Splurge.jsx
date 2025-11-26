import React, {useState, useEffect, useCallback} from 'react'
import './Splurge.css'
import {productAPI} from '../../services/api'
import Item from '../Item/Item'

const CATEGORIES = ['GPU', 'CPU', 'Monitor', 'Motherboard', 'Cooling', 'Case', 'Storage']

export const Splurge = () => {
  const [splurgeProducts, setSplurgeProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [cachedData, setCachedData] = useState(null)


  const getRandomTopProduct = useCallback((categoryProducts) => {
    if (categoryProducts.length === 0) return null
    

    const topFive = categoryProducts
      .sort((a, b) => (b.price || 0) - (a.price || 0))
      .slice(0, 5)
    

    if (topFive.length === 0) return null
    const randomIndex = Math.floor(Math.random() * topFive.length)
    const selectedProduct = topFive[randomIndex]
    
    return {
      id: selectedProduct._id || selectedProduct.id, 
      name: selectedProduct.name, 
      image: selectedProduct.images?.[0]?.url || '/placeholder.png',
      price: selectedProduct.price, 
      category: selectedProduct.category
    }
  }, [])

  const processProductsOptimized = useCallback((products) => {
    const splurgeItems = []
    
 
    const productsByCategory = {}
    CATEGORIES.forEach(category => {
      productsByCategory[category] = []
    })
    

    products.forEach(product => {
      if (product.category && product.price != null && CATEGORIES.includes(product.category)) {
        productsByCategory[product.category].push(product)
      }
    })
    
    CATEGORIES.forEach(category => {
      const categoryProducts = productsByCategory[category]
      if (categoryProducts.length > 0) {
        const selectedProduct = getRandomTopProduct(categoryProducts)
        if (selectedProduct) {
          splurgeItems.push(selectedProduct)
        }
      }
    })
    
    
    const shuffled = [...splurgeItems]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    
    return shuffled.slice(0, 8)
  }, [getRandomTopProduct])

  const fetchSplurgeProducts = useCallback(async () => {
    try {
      setLoading(true)
      
      let products
      
      if (cachedData) {
        products = cachedData
      } else {
        const response = await productAPI.getAllProducts()
        if (response.success && response.products) {
          products = response.products
          setCachedData(response.products) 
        } else {
          throw new Error('No products found in response')
        }
      }
      
      const processedProducts = processProductsOptimized(products)
      setSplurgeProducts(processedProducts)
      
    } catch (e) {
      console.error('Error fetching splurge products: ', e)
      if (cachedData) {
        const processedProducts = processProductsOptimized(cachedData)
        setSplurgeProducts(processedProducts)
      } else {
        setSplurgeProducts([])
      }
    } finally {
      setLoading(false)
    }
  }, [cachedData, processProductsOptimized])

  useEffect(() => {
    fetchSplurgeProducts()
  }, [fetchSplurgeProducts])

  if (loading) {
    return (
      <div className="splurge">
        <h1>SPLURGE</h1>
        <hr/>
        <div className="loading-message">Loading Splurge products..</div>
      </div>
    )
  }

  return (
    <div className="splurge">
      <h1>SPLURGE</h1>
      <hr/>
      <div className="collections">
        {splurgeProducts.map((item, i) => (
          <Item 
            key={`${item.id}-${i}`} 
            id={item.id} 
            name={item.name} 
            image={item.image} 
            price={item.price} 
            category={item.category}
          />
        ))}
      </div>

      {splurgeProducts.length === 0 && !loading && (
        <div className="no-products-message">
          <p>No Splurge products found. Make sure backend is running.</p>
        </div>
      )}
    </div>
  )
}

export default Splurge