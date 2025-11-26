/* 
Functional Requirement #18 - Popular Items
*/

import React, {useState, useEffect} from 'react'
import './Popular.css'
import {productAPI} from '../../services/api'
import Item from '../Item/Item'

export const Popular = () => {
  const [popularProdcuts, setPopularProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRandomProducts()
  }, [])
  
  const fetchRandomProducts = async () => {
    try{
      setLoading(true)
      const response = await productAPI.getAllProducts()

      if (response.success && response.products){
        const rp = [...response.products].sort(() => 0.5 - Math.random())
        const randomProducts = rp.slice(0,4)

        const matchedProducts = randomProducts.map(product => ({
          id: product._id || product.id,
          name: product.name,
          image: product.images && product.images.length > 0 ? product.images[0].url : '/placeholder.png',
          price: product.price,
          brand: product.brand,
          category: product.category
        }))

        setPopularProducts(matchedProducts)
      }
    } 
    catch(e) {
      console.error('Error fetching popular products: ', e)
      setPopularProducts([])
    }
    finally{
      setLoading(false)
    }
  }

  if(loading){
    return(
      <div className="popular">
        <h1>POPULAR IN PC PARTS</h1>
        <hr />
        <div className="loading-message">Loading Popular products..</div>
      </div>
    )
  }

  return(
    <div className="popular">
      <h1>POPULAR IN PC PARTS</h1>
      <hr />
      <div className="popular-item">
        {popularProdcuts.map((item, i) => (
          <Item key={i} id={item.id} name={item.name} image={item.image} price={item.price} category={item.category}/>
        ))}
      </div>

      {popularProdcuts.length === 0 && !loading && (
        <div className="no-products-message">
          <p>No products found. Make sure backend is running.</p>
        </div>
      )}
    </div>
  )
}

export default Popular