import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { productAPI } from '../services/api'
import Item from '../Components/Item/Item'
import './CSS/Search.css'

export const Search = () => {
  const [searchParams] = useSearchParams()
  const searchTerm = searchParams.get('q')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setLoading(true)
        if (searchTerm) {
          const response = await productAPI.searchProducts(searchTerm)
          setProducts(response.products || [])
        }
      } catch (error) {
        console.error('Error searching products:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchSearchResults()
  }, [searchTerm])

  return (
    <div className="search-results">
      <div className="search-hero">
        <h1>Search Results</h1>
        <p>Results for: <strong>{searchTerm}</strong></p>
      </div>

      <div className="search-products">
        {loading ? (
          <div className="search-loading">
            Loading search results...
          </div>
        ) : products.length === 0 ? (
          <div className="search-empty">
            <h2>No products found</h2>
            <p>Try searching with different keywords</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((item, i) => (
              <Item 
                key={i} 
                id={item._id || item.id} 
                name={item.name} 
                image={item.images && item.images.length > 0 ? item.images[0].url : '/placeholder.png'} 
                price={item.price}
                discount={item.discount}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Search
