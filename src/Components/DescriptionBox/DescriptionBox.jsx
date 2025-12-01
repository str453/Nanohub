import React, { useState } from 'react'
import './DescriptionBox.css'

export const DescriptionBox = ({ product }) => {
  const [activeTab, setActiveTab] = useState('description')
  
  // Get review count from product data (from CSV or database)
  const reviewCount = product?.rating?.count || product?.reviews || 122
  
  // Mock review data
  const mockReviews = [
    { id: 1, author: 'John D.', rating: 5, text: 'Great product, highly recommend! Very satisfied with the purchase.', date: '2024-11-20' },
    { id: 2, author: 'Sarah M.', rating: 4, text: 'Good quality and fast shipping. Would be 5 stars but arrived a day late.', date: '2024-11-15' },
    { id: 3, author: 'Mike K.', rating: 5, text: 'Excellent product, exceeded my expectations. Best purchase this year!', date: '2024-11-10' },
    { id: 4, author: 'Emma L.', rating: 4, text: 'Very good. Works as described. Minor issue with packaging but product is perfect.', date: '2024-11-05' },
    { id: 5, author: 'David R.', rating: 5, text: 'Outstanding quality and customer service was great too!', date: '2024-10-28' }
  ]

  return (
    <div className='descriptionbox'>
      <div className="descriptionbox-navigator">
        <div 
          className={`descriptionbox-nav-box ${activeTab === 'description' ? '' : 'fade'}`}
          onClick={() => setActiveTab('description')}
          style={{ cursor: 'pointer' }}
        >
          Description
        </div>
        <div 
          className={`descriptionbox-nav-box ${activeTab === 'reviews' ? '' : 'fade'}`}
          onClick={() => setActiveTab('reviews')}
          style={{ cursor: 'pointer' }}
        >
          Reviews ({reviewCount})
        </div>
      </div>
      <div className="descriptionbox-description">
        {activeTab === 'description' && (
          <>
            <p>{product?.description || 'An e-commerce website is an online platform that facilitates buying and selling of products or services over the internet.'}</p>
          </>
        )}
        {activeTab === 'reviews' && (
          <div className="reviews-container">
            {mockReviews.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <div className="review-author-rating">
                    <strong>{review.author}</strong>
                    <div className="review-stars">
                      {'⭐'.repeat(review.rating)}
                    </div>
                  </div>
                  <span className="review-date">{review.date}</span>
                </div>
                <p className="review-text">{review.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DescriptionBox