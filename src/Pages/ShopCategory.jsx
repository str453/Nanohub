/* 
Functional Requirement #6-7 Viewing Product Details
*/

import React, { useState, useEffect } from 'react'
import './CSS/ShopCategory.css'
import {productAPI} from '../services/api'
import dropdown_icon from '../Components/Assets/dropdown_icon.png'
import Item from '../Components/Item/Item'

export const ShopCategory = (props) => {
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => { 
    const fetchCategoryProducts = async (page=1, limit=20) => {
    try {
      setLoading(true);
      console.log(`Fetching ${props.category} products page ${page}`);

      const data = await productAPI.getProductsByCategoryPaginated(props.category, page, limit);
      console.log(`Got ${data.products?.length || 0} ${props.category} products on page ${page}`);

      if(page === 1){
      setProducts(data.products || []);
      } else {
      setProducts(prev => [...prev, ...(data.products || [])]);
      }

      setHasMore(data.pagination?.next_page || false);
      setCurrentPage(page);
    }
    catch(e){
      console.error(`Error fetching ${props.category} products:`, e);
      setProducts([]);
      setHasMore(false);
    }
    finally {
      setLoading(false);
    }
  };

    setProducts([]);
    setCurrentPage(1);
    setHasMore(true);

    fetchCategoryProducts(1);
  }, [props.category]);

  const loadMoreProducts = () => {
    if(!loading && hasMore){
      fetchMoreProducts();
    }
  };

  const fetchMoreProducts = async () => {
    try{
      setLoading(true);
      const nextPage = currentPage + 1;
      const data = await productAPI.getProductsByCategoryPaginated(props.category, nextPage, 20);

      setProducts(prev => [...prev, ...(data.products || [])]);
      setHasMore(data.pagination?.next_page || false);
      setCurrentPage(nextPage);
    }
    catch(e) {
      console.error(`Error fetching more ${props.category} products`, e);
    }
    finally{
      setLoading(false);
    }
  };

  const productCount = products.length;

  

  return (
    <div className='shop-category'>
      <img className='shopcategory-banner'src={props.banner} alt="" />
      <div className="shopcategory-indexSort">
        <p>
          <span>Showing 1-{productCount}</span> out of {productCount} products
          {hasMore && ` (more available)`}
        </p>
        <div className="shopcategory-sort">
          Sort by <img src={dropdown_icon} alt="" />
        </div>
      </div>

      <div className="shopcategory-products">
        {products.map((item,i)=> (
           <Item key={i} id={item._id || item.id} name={item.name} image={item.images && item.images.length > 0 ? item.images[0].url: '/placeholder.png'} price={item.price}/>
        ))}
      </div>

      {loading && (
        <div className="loading-Message">Loading {props.category} procucts from DB</div>
      )}

      {hasMore && !loading && (
        <div className="shopcategory-loadmore" onClick={loadMoreProducts}>
          Explore More {props.category} Products
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <div className="no-more-products">
          All {props.category} products loaded ({products.length} total)
        </div>
      )}

      {products.length === 0 && !loading && (
        <div className="no-prodcuts-message">
          <h3>No {props.category} products found</h3>
          <p>Make sure backend is running and has {props.category} products</p>
        </div>
      )}
    </div>
  )
}

export default ShopCategory;