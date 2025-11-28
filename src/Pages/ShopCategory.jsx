/* 
Functional Requirement #6-7 Viewing Product Details
*/

import React, { useState, useEffect} from 'react'
import './CSS/ShopCategory.css'
import {productAPI} from '../services/api'
import dropdown_icon from '../Components/Assets/dropdown_icon.png'
import Item from '../Components/Item/Item'

export const ShopCategory = (props) => {
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [sortBy, setSortBy] = useState('default');
  const [showDropdown, setDropdown] = useState(false);

  useEffect(() => { 
    const fetchCategoryProducts = async (page=1, limit=20) => {
    try {
      setLoading(true);
      const data = await productAPI.getProductsByCategoryPaginated(props.category, page, limit);
     
      let fetchedProducts = data?.products || [];

      if(page === 1){
      setAllProducts(fetchedProducts);
      setProducts(fetchedProducts);
      } else {
      const newAllProducts = [...allProducts, ...fetchedProducts];
      setAllProducts(newAllProducts);
      setProducts(newAllProducts);
      }

      setHasMore(data.pagination?.next_page || false);
      setCurrentPage(page);
    }
    catch(e){
      console.error(`Error fetching ${props.category} products:`, e);
      setProducts([]);
      setAllProducts([]);
      setHasMore(false);
    }
    finally {
      setLoading(false);
    }
  };

    setProducts([]);
    setAllProducts([]);
    setCurrentPage(1);
    setHasMore(true);

    fetchCategoryProducts(1);
  }, [props.category]); //eslint-disable-line

  useEffect(() => {
    if(sortBy === 'default'){
      setProducts([...allProducts]);
    } else{
      const sorted = sortProducts([...allProducts], sortBy);
      setProducts(sorted);
    }
  }, [sortBy, allProducts]);

  const sortProducts = (productsToSort, sortType) => {
    if(!productsToSort || !Array.isArray(productsToSort)) return [];
    const sorted = [...productsToSort];
    switch(sortType){
      case 'price-low-high':
        return sorted.sort((a,b) => (a.price || 0) - (b.price || 0));
      case 'price-high-low':
        return sorted.sort((a,b) => (b.price || 0) - (a.price || 0));
      default:
        return sorted;
    }
  };

  const sortChange = (sortType) => {
    setSortBy(sortType);
    setDropdown(false);
  };

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

      let newProducts = data?.products || [];

      const updatedAllProducts = [...allProducts, ...newProducts];
      setAllProducts(updatedAllProducts);

      if(sortBy !== 'default'){
        setProducts(updatedAllProducts);
      } else{
        const sortedProducts = sortProducts(updatedAllProducts, sortBy);
        setProducts(sortedProducts);
      }

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
  const displayCount = Math.min(productCount, 20 * currentPage);

  

  return (
    <div className='shop-category'>
      <img className='shopcategory-banner'src={props.banner} alt="" />
      <div className="shopcategory-indexSort">
        <p>
          <span>Showing 1-{displayCount}</span> products
          {hasMore && ` (more available)`}
        </p>
        <div className="shopcategory-sort" onClick={() => setDropdown(!showDropdown)}>
          Sort by <img src={dropdown_icon} alt="" />
          {showDropdown && (
            <div className="sort-dropdown">
              <div className="sort-option" onClick={() => sortChange('default')}>
                Default
            </div>
            <div className="sort-option" onClick={() => sortChange('price-low-high')}>
              Price: low to High
            </div>
            <div className="sort-option" onClick={() => sortChange('price-high-low')}>
              Price: High to Low
            </div>
            </div>
          )}
        </div>
      </div>

      <div className="shopcategory-products">
        {products.map((item,i)=> (
           <Item key={i} id={item._id || item.id} name={item.name} image={item.images && item.images.length > 0 ? item.images[0].url: '/placeholder.png'} price={item.price}/>
        ))}
      </div>

      {loading && (
        <div className="loading-message">Loading {props.category} products from database</div>
      )}

      {hasMore && !loading && (
        <div className="shopcategory-loadmore" onClick={loadMoreProducts}>
          Explore More {props.category}s
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <div className="no-more-products">
          All {props.category} products loaded ({products.length} total)
        </div>
      )}

      {products.length === 0 && !loading && (
        <div className="no-products-message">
          <h3>No {props.category} products found</h3>
          <p>Make sure backend is running and has {props.category} products</p>
        </div>
      )}
    </div>
  )
}

export default ShopCategory;