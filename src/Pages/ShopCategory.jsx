/* 
Functional Requirement #6-7 Viewing Product Details
Functional Requirement #5
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
  const productsPerPage = 20;

  // Get category display name
  const getCategoryDisplayName = () => {
    // Use custom categoryDisplay prop if provided
    if (props.categoryDisplay) {
      return props.categoryDisplay;
    }
    
    const names = {
      'GPU': 'Graphics Cards (GPUs)',
      'Monitor': 'Monitors',
      'CPU': 'Processors (CPUs)',
      'Motherboard': 'Motherboards',
      'Case': 'PC Cases',
      'Cooling': 'CPU Coolers',
      'Storage': 'Storage (HDD/SSD)'
    };
    return names[props.category] || props.category;
  };

  const sortParamaters = (sortOption) => {
    switch(sortOption){
      case 'default':
        return 'random';
      case 'price-low-high':
        return 'price_asc';
      case 'price-high-low':
        return 'price_desc';
      default:
        return '';
    }
  };

  useEffect(() => { 
    const fetchCategoryProducts = async () => {
    try {
      setLoading(true);

      const sortParamater = sortParamaters(sortBy);
      const data = await productAPI.getProductsByCategoryPaginated(props.category, 1, 500, sortParamater);
     
      let fetchedProducts = data?.products || [];
      setAllProducts(fetchedProducts);
      
      const firstProducts = fetchedProducts.slice(0, productsPerPage);
      setProducts(firstProducts);

      setHasMore(fetchedProducts.length > productsPerPage);
      setCurrentPage(1);
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
  }, [props.category, sortBy]); 

  const loadMoreProducts = () => {
    if(!loading && hasMore){
      setLoading(true);

      const nextPage = currentPage + 1;
      const startIndex = 0;
      const endIndex = nextPage * productsPerPage;

      const nextProducts = allProducts.slice(startIndex, endIndex);
      setProducts(nextProducts);
      setCurrentPage(nextPage);
      setHasMore(endIndex < allProducts.length);

      setLoading(false);
    }
  };

  const sortChange = (sortOption) => {
    setSortBy(sortOption);
    setDropdown(false);
  };

  const productCount = products.length;
  const totalProducts = allProducts.length;
  const displayCount = Math.min(productCount, currentPage * productsPerPage);
  
  return (
    <div className='shop-category'>
      {/* Custom Banner per Category */}
      <div className={`shopcategory-banner-container category-${props.category.toLowerCase()}`}>
        {props.banner && <img className='shopcategory-banner' src={props.banner} alt={props.category} />}
        <div className="banner-text-overlay">
          <h1>{getCategoryDisplayName()}</h1>
          <p>Build your dream PC with premium components</p>
          <p style={{fontSize: '14px', marginTop: '10px'}}>
            Showing {totalProducts} products
          </p>
        </div>
      </div>

      <div className="shopcategory-indexSort">
        <p>
          <span>Showing 1-{displayCount}</span> products out of {totalProducts} products
          {hasMore && ` (${totalProducts - displayCount} more available)`}
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
           <Item key={i} id={item._id || item.id} name={item.name} image={item.images && item.images.length > 0 ? item.images[0].url: ''} price={item.price}/>
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