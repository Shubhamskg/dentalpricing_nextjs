import React, { useState, useEffect, useCallback } from 'react';
import { FaStar, FaGoogle } from 'react-icons/fa';
import styles from './GoogleReviews.module.scss';
import Loading from './Loading';

const MAX_REVIEW_LENGTH = 500;
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

const GoogleReviews = ({name, address, postcode, placeId: initialPlaceId, onRatingFetched, searchPage=false }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [placeId, setPlaceId] = useState(initialPlaceId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedReviews, setExpandedReviews] = useState({});

  const cacheKey = `googleReviews_${placeId || `${name}_${address}_${postcode}`}`;

  const getCachedData = useCallback(() => {
    if (typeof window === 'undefined') return null; // Check if we're on the client-side
    try {
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_DURATION) {
          return data;
        }
      }
    } catch (error) {
      console.error('Error reading from cache:', error);
    }
    return null;
  }, [cacheKey]);

  const setCachedData = useCallback((data) => {
    if (typeof window === 'undefined') return; // Check if we're on the client-side
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error writing to cache:', error);
    }
  }, [cacheKey]);

  const fetchPlaceIdAndReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const cachedData = getCachedData();
      if (cachedData) {
        setReviews(cachedData.reviews);
        setRating(cachedData.rating);
        setTotalReviews(cachedData.totalReviews);
        setPlaceId(cachedData.placeId);
        onRatingFetched(cachedData.rating, cachedData.totalReviews);
        setLoading(false);
        return;
      }

      let currentPlaceId = placeId;

      if (!currentPlaceId) {
        if (!name || !address || !postcode) {
          throw new Error('Name, address, and postcode are required when placeId is not provided');
        }

        const placeIdResponse = await fetch(`/api/place-id?name=${encodeURIComponent(name)}&address=${encodeURIComponent(address)}&postcode=${encodeURIComponent(postcode)}`);
        
        if (!placeIdResponse.ok) {
          const errorData = await placeIdResponse.json();
          throw new Error(errorData.error || `HTTP error! status: ${placeIdResponse.status}`);
        }
        
        const placeIdData = await placeIdResponse.json();
        currentPlaceId = placeIdData.placeId;
        setPlaceId(currentPlaceId);
      }

      const reviewsResponse = await fetch(`/api/google-reviews?placeId=${currentPlaceId}`);
      
      if (!reviewsResponse.ok) {
        const errorData = await reviewsResponse.json();
        throw new Error(errorData.error || `HTTP error! status: ${reviewsResponse.status}`);
      }
      
      const reviewsData = await reviewsResponse.json();
      const newData = {
        reviews: reviewsData.reviews || [],
        rating: reviewsData.rating || null,
        totalReviews: reviewsData.totalReviews || 0,
        placeId: currentPlaceId,
      };
      setReviews(newData.reviews);
      setRating(newData.rating);
      setTotalReviews(newData.totalReviews);
      onRatingFetched(newData.rating, newData.totalReviews);
      setCachedData(newData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [name, address, postcode, placeId, getCachedData, setCachedData, onRatingFetched]);


  useEffect(() => {
    fetchPlaceIdAndReviews();
  }, [fetchPlaceIdAndReviews]);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar key={index} className={index < Math.floor(rating) ? styles.starFilled : styles.starEmpty} />
    ));
  };

  const toggleReviewExpansion = (index) => {
    setExpandedReviews(prev => ({ ...prev, [index]: !prev[index] }));
  };

  if (loading) return <Loading/>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!placeId || reviews.length === 0) return null;
  const isValidUrl = urlString=> {
    var urlPattern = new RegExp('^(https?:\\/\\/)?'+ // validate protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // validate domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // validate OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // validate port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // validate query string
  '(\\#[-a-z\\d_]*)?$','i'); // validate fragment locator
return !!urlPattern.test(urlString);
}
  return (
    <div >
      {searchPage?
      <div className={styles.googleReviewSummary}>
      <div className={styles.googleLogo}>
        {/* <FaGoogle /> */}
      </div>
      <div className={styles.ratingOverview}>
        <span className={styles.ratingNumber}>{rating?.toFixed(1) || 'N/A'}</span>
        <div className={styles.stars}>{renderStars(rating)}</div>
        <span className={styles.reviewCount}>({totalReviews})</span>
      </div>
    </div>:
      <div className={styles.reviewSection}>
      <div className={styles.googleReviewSummary}>
        <div className={styles.googleLogo}>
          <FaGoogle />
          <span>Google Reviews</span>
        </div>
        <div className={styles.ratingOverview}>
          <span className={styles.ratingNumber}>{rating?.toFixed(1) || 'N/A'}</span>
          <div className={styles.stars}>{renderStars(rating)}</div>
          <span className={styles.reviewCount}>({totalReviews})</span>
        </div>
        <a href={`https://search.google.com/local/writereview?placeid=${placeId}`} target="_blank" rel="noopener noreferrer" className={styles.writeReviewLink}>
          Write a Review
        </a>
      </div>
      <div className={styles.reviewList}>
        {reviews.map((review, index) => {
        
        return(
          <div key={index} className={styles.review}>
            <div className={styles.reviewHeader}>
              {isValidUrl(review.profile_photo_url)?              
              <img src={review.profile_photo_url} alt={review.author_name} className={styles.reviewerImage} />:
              <div className={styles.letterLogo}>{review.author_name[0].toUpperCase()}</div>}
              <div className={styles.reviewerInfo}>
                <span className={styles.reviewAuthor}>{review.author_name}</span>
                <span className={styles.reviewTime}>{review.relative_time_description}</span>
              </div>
            </div>
            <div className={styles.reviewStars}>{renderStars(review.rating)}</div>
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
        )})}
      </div>
      </div>}
    </div>
  );
};

export default GoogleReviews;