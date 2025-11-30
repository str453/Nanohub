/* 
PC Parts Main Landing Page
Functional Requirement #5-7
*/

import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../Context/ShopContext'
import Item from '../Components/Item/Item'
import './CSS/PCPartsMain.css'

export const PCPartsMain = () => {
  const { all_product, loading } = useContext(ShopContext);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if(!loading){
      setDataLoaded(true);
    }
  }, [loading, all_product.length]);

  // Debug: Log product data
  console.log('Total products loaded:', all_product.length);
  console.log('Loading state:', loading);
  
  // Count products by category
  const categoryCounts = all_product.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {});
  console.log('Products by category:', categoryCounts);

  // Categories to display
  const categories = [
    { name: 'CPU', displayName: 'Processors (CPUs)', route: '/PC-Parts/CPU' },
    { name: 'GPU', displayName: 'Graphics Cards (GPUs)', route: '/PC-Parts/GPU' },
    { name: 'Monitor', displayName: 'Monitors', route: '/PC-Parts/Monitor' },
    { name: 'Motherboard', displayName: 'Motherboards', route: '/PC-Parts/Motherboard' },
    { name: 'Case', displayName: 'PC Cases', route: '/PC-Parts/Case' },
    { name: 'Cooling', displayName: 'CPU Coolers', route: '/PC-Parts/Cooling' },
    { name: 'Storage', displayName: 'Storage (HDD/SSD)', route: '/PC-Parts/Storage' }
  ];

  const getRandomProducts = (category, count = 7) => {
    const categoryProducts = all_product.filter(item => item.category === category);
    
    // Shuffle array using Fisher-Yates algorithm
    const shuffled = [...categoryProducts];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled.slice(0, count);
  };

  // Show loading state
  if (loading || !dataLoaded) {
    return (
      <div className='pc-parts-main'>
        <div className="pc-parts-hero">
          <h1>PC Components</h1>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  // Show message if no products
  if (all_product.length === 0) {
    return (
      <div className='pc-parts-main'>
        <div className="pc-parts-hero">
          <h1>PC Components</h1>
          <p>No products available. Make sure the backend is running!</p>
        </div>
      </div>
    );
  }

  return (
    <div className='pc-parts-main'>
      {/* Hero Section */}
      <div className="pc-parts-hero">
        <h1>PC Components</h1>
        <p>Build your dream PC with premium components</p>
        <p style={{fontSize: '14px', marginTop: '10px'}}>
          Showing {all_product.length} products across {Object.keys(categoryCounts).length} categories
        </p>
      </div>

      {/* Category Sections */}
      {categories.map((category, idx) => {
        const randomProducts = getRandomProducts(category.name, 6);
        
        if (randomProducts.length === 0) return null; // Skip if no products

        return (
          <div key={idx} className="category-section">
            <div className="category-header">
              <h2>{category.displayName}</h2>
              <Link to={category.route} className="view-all-btn">
                View All →
              </Link>
            </div>
            
            <div className="products-grid">
              {randomProducts.map((product, i) => (
                <Item
                  key={i}
                  id={product.id}
                  name={product.name}
                  image={product.image}
                  price={ product.price}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  )
}

export default PCPartsMain

