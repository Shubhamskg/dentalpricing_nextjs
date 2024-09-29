import React, { useState, useEffect, useCallback } from 'react';
import { FaStar, FaGoogle } from 'react-icons/fa';
import styles from './GoogleReviews.module.scss';
import Loading from './Loading';

const MAX_REVIEW_LENGTH = 200;

const GoogleReviews = ({ name, address, postcode, placeId, onRatingFetched, searchPage = false }) => {
  const [reviews, setReviews] = useState({});
  const [rating, setRating] = useState(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedReviews, setExpandedReviews] = useState({});
  const [reviewType, setReviewType] = useState('most_relevant');
  const [isFromDatabase, setIsFromDatabase] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const fetchReviews = useCallback(async (showAll = false) => {
    try {
      setLoading(true);
      setError(null);

      const dbResponse = await fetch(`/api/reviewsData?name=${encodeURIComponent(name)}&address=${encodeURIComponent(address)}&postcode=${encodeURIComponent(postcode)}&showAll=${showAll}`);
      
      if (dbResponse.ok) {
        const dbData = await dbResponse.json();
        setReviews(dbData.reviews);
        setRating(dbData.rating);
        setTotalReviews(dbData.totalReviews);
        setIsFromDatabase(true);
        onRatingFetched(dbData.rating, dbData.totalReviews);
      } else {
        if (!placeId) {
          throw new Error('Place ID is required when fetching from Google API');
        }
        const apiResponse = await fetch(`/api/google-reviews?placeId=${placeId}`);
        
        if (!apiResponse.ok) {
          throw new Error('Failed to fetch reviews from Google API');
        }
        
        const apiData = await apiResponse.json();
        setReviews(apiData.reviews);
        setRating(apiData.rating);
        setTotalReviews(apiData.totalReviews);
        setIsFromDatabase(false);
        onRatingFetched(apiData.rating, apiData.totalReviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [name, address, postcode, placeId, onRatingFetched]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const renderStars = (rating) => {
    return (
      <div className={styles.stars}>
        {Array.from({ length: 5 }, (_, index) => (
          <FaStar key={index} className={index < Math.floor(rating) ? styles.starFilled : styles.starEmpty} />
        ))}
      </div>
    );
  };
  

  const toggleReviewExpansion = (index) => {
    setExpandedReviews(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleReviewTypeChange = (e) => {
    setReviewType(e.target.value);
  };

  const handleShowAllReviews = () => {
    setShowAllReviews(true);
    fetchReviews(true);
  };

  if (loading) return <Loading />;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!reviews || Object.keys(reviews).length === 0) return null;

  const displayedReviews = reviews[reviewType] || [];

  return (
    <div className={styles.reviewSection}>
      <div className={styles.googleReviewHeader}>
        <div className={styles.googleLogo}>
          <FaGoogle />
          <span>Google Reviews</span>
        </div>
        <div className={styles.ratingOverview}>
          <span className={styles.ratingNumber}>
            {rating ? rating.toFixed(1) : 'N/A'}
          </span>
          {renderStars(rating)}
          <span className={styles.reviewCount}>({totalReviews})</span>
        </div>
        <a href={`https://search.google.com/local/writereview?placeid=${placeId}`} 
           target="_blank" 
           rel="noopener noreferrer" 
           className={styles.writeReviewLink}>
          Write a Review
        </a>
      </div>

      {isFromDatabase && (
        <div className={styles.sortingContainer}>
          <select 
            value={reviewType} 
            onChange={handleReviewTypeChange}
            className={styles.sortSelect}
          >
            <option value="most_relevant">Most Relevant</option>
            <option value="newest">Newest</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      )}

      <div className={styles.reviewList}>
        {displayedReviews.map((review, index) => (
          <div key={index} className={styles.review}>
            <div className={styles.reviewHeader}>
              <div className={styles.reviewerInfo}>
                <span className={styles.reviewAuthor}>{review.name}</span>
                <span className={styles.reviewTime}>{review.relative_time}</span>
              </div>
              <div className={styles.userRating}>
              <span className={styles.ratingValue}>{review.rating.toFixed(0)}</span>
                {renderStars(review.rating)}
              </div>
            </div>
            <p className={styles.reviewText}>
              {expandedReviews[index] || review.text.length <= MAX_REVIEW_LENGTH
                ? review.text
                : `${review.text.substring(0, MAX_REVIEW_LENGTH)}...`}
              {review.text.length > MAX_REVIEW_LENGTH && (
                <button onClick={() => toggleReviewExpansion(index)} className={styles.readMoreButton}>
                  {expandedReviews[index] ? 'Read less' : 'Read more'}
                </button>
              )}
            </p>
          </div>
        ))}
      </div>

      {!showAllReviews && displayedReviews.length === 3 && (
        <button onClick={handleShowAllReviews} className={styles.showAllButton}>
          Show All Reviews
        </button>
      )}
    </div>
  );
};

export default GoogleReviews;