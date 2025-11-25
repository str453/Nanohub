import React, {useState, useEffect, useCallback} from 'react'
import './Splurge.css'
import {productAPI} from '../../services/api'
import Item from '../Item/Item'

const CATEGORIES = ['GPU', 'CPU', 'Monitor', 'Motherboard', 'Cooling', 'Case', 'Storage']

export const Splurge = () => {
  const [splurgeProducts, setSplurgeProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [cachedData, setCachedData] = useState(null)


  const getRandomSubset = useCallback((products, percentage = 0.3) => {
    if (products.length === 0) return []
    const shuffled = [...products].sort(() => Math.random() - 0.5)
    const subsetSize = Math.max(1, Math.floor(products.length * percentage))
    return shuffled.slice(0, subsetSize)
  }, [])

    const processProductsOptimized = useCallback((products) => {
    const splurgeItems = []
    
    CATEGORIES.forEach(category => {
          const categoryProducts = products.filter(product => 
        product.category === category &&
        product.price !== undefined &&
        product.price !== null
      )
      
      if (categoryProducts.length > 0) {
        
        const randomHalf = getRandomSubset(categoryProducts, 0.3)
        console.log(`Category ${category}: ${categoryProducts.length} total, ${randomHalf.length} in random subset`)
        
        if (randomHalf.length > 0) {
          const sortedHalf = randomHalf.sort((a, b) => (b.price || 0) - (a.price || 0))
          const mostExpensiveFromHalf = sortedHalf[0] 
          
          splurgeItems.push({
            id: mostExpensiveFromHalf._id || mostExpensiveFromHalf.id, 
            name: mostExpensiveFromHalf.name, 
            image: mostExpensiveFromHalf.images?.[0]?.url || '/placeholder.png',
            price: mostExpensiveFromHalf.price, 
            category: mostExpensiveFromHalf.category
          })
        }
      }
    })
    
    console.log(`Generated ${splurgeItems.length} splurge items from ${CATEGORIES.length} categories`)
    
    const finalProducts = splurgeItems.length > 8 
      ? [...splurgeItems].sort(() => Math.random() - 0.5).slice(0, 8)
      : [...splurgeItems].sort(() => Math.random() - 0.5)
    
    return finalProducts
  }, [getRandomSubset])

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
        <div className="loading-message">Loading Splurge Items..</div>
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