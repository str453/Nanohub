import React, {useState, useEffect, useCallback} from 'react'
import './Splurge.css'
import {productAPI} from '../../services/api'
import Item from '../Item/Item'

const CATEGORIES = ['GPU', 'CPU', 'Monitor', 'Motherboard', 'Cooling', 'Case', 'Storage']

export const Splurge = () => {
  const [splurgeProducts, setSplurgeProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [cachedData, setCachedData] = useState({})


  const getRandomTopProduct = useCallback(async () => {
    try {
      setLoading(true)

    const fetchP = CATEGORIES.map(category => {
      if(cachedData[category] && cachedData[category].length >= 80){
        const topFive = [...cachedData[category]]
        .sort((a,b) => (b.price || 0) - (a.price || 0))
        .slice(0,5)
        .map(product => ({
          id: product.id || product._id,
          name: product.name,
          image: product.images?.[0]?.url || '',
          price: product.price,
          category: product.category
        }))
        return Promise.resolve({category, products: topFive, fromCache: true})
      }
      else{
        return productAPI.getProductsByCategoryPaginated(category, 1, 80).then(response => {
          if(response.success && response.products){
            const products = response.products
            const topFive = products.sort((a, b) => (b.price || 0) - (a.price || 0))
              .slice(0, 5)
              .map(product => ({
                id: product.id || product._id,
                name: product.name,
                image: product.images?.[0]?.url || '',
                price: product.price,
                category: product.category
              }))
              return {category, products: topFive, rawData: products, fromCache: false}
          }
          return {category, products: [], fromCache: false}
        })
        .catch(e => {
          console.error(`Error fetching ${category}`, e)
          return {category, products: [], fromCache: false}
        })
      }
    })

    const results = await Promise.allSettled(fetchP)
    const allTopFiveProducts = []
    const cacheUpdates = {}
    results.forEach(result => {
      if(result.status === 'fulfilled'){
        const{category, products, rawData, fromCache} = result.value
        allTopFiveProducts.push(...products)

        if(!fromCache && rawData){
          cacheUpdates[category] = rawData
        }
      }
    })
    if(Object.keys(cacheUpdates).length > 0){
      setCachedData(prev => ({...prev, ...cacheUpdates}))
    }
    
    const shuffled = [...allTopFiveProducts].sort(() => Math.random() - 0.5).slice(0,8)
    setSplurgeProducts(shuffled)
  } catch(error){
    console.error('Error fetching splurge products:', error)
    setSplurgeProducts([])
  } finally {
    setLoading(false)
  }
  }, [cachedData])

  useEffect(() => {
    getRandomTopProduct()
  }, [getRandomTopProduct])
  
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