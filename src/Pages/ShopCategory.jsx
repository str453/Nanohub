/* 
Functional Requirement #6-7 Viewing Product Details
*/

import React, { useState, useEffect, useContext } from 'react'
import './CSS/ShopCategory.css'
import { ShopContext } from '../Context/ShopContext';
import {productAPI} from '../services/api'
import dropdown_icon from '../Components/Assets/dropdown_icon.png'
import Item from '../Components/Item/Item'

export const ShopCategory = (props) => {
  const {all_product} = useContext(ShopContext);
  const [gpuProducts, setGpuProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    //fetch category GPU
    if(props.category === 'GPU') {
      fetchGPUProducts();
    }
  }, [props.category]);


  const fetchGPUProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching GPU products from API');
      const data = await productAPI.getProductsByCategory('GPU');
      setGpuProducts(data.products || []);
      console.log('GPU API Response:', data);
      console.log('GPU Products:', data.products);
      setGpuProducts(data.products || []);
    }
    catch(e){
      console.error('Error fetching GPU products:', e);
      setGpuProducts([]);
    }
    finally {
      setLoading(false);
    }
  };

  const displayProducts = props.category === 'GPU' ? gpuProducts : all_product.filter(item => props.category === item.category);

  const productCount = displayProducts.length;

  

  return (
    <div className='shop-category'>
      <img className='shopcategory-banner'src={props.banner} alt="" />
      <div className="shopcategory-indexSort">
        <p>
          <span>Showing 1-{productCount}</span> out of {productCount} products
        </p>
        <div className="shopcategory-sort">
          Sort by <img src={dropdown_icon} alt="" />
        </div>
      </div>

      <div className="shopcategory-products">
        {displayProducts.map((item,i)=> (
           <Item key={i} id={item._id} name={item.name} image={item.images && item.images.length > 0 ? item.images[0].url: '/placeholder.png'} price={item.price}/>
        ))}
      </div>

      {loading && props.category === 'GPU' && (
        <div className="loading-Message">Loading GPU procucts from DB</div>
      )}

      {props.category === 'GPU' && gpuProducts.length === 0 && !loading && (
        <div className="no-products-message">
          <h3>No GPU products found in DB</h3>
          <p>Check if backend is running</p>
        </div>
      )}
      <div className="shopcategory-loadmore">
        Explore More
      </div>
    </div>
  )
}

export default ShopCategory;