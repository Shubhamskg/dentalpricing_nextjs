import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaStar, FaCalendar } from 'react-icons/fa';
import styles from './BestDeals.module.scss';

const CACHE_KEY = 'bestDealsCache';
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const BestDeals = () => {
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchBestDeals = async () => {
      try {
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          if (Date.now() - timestamp < CACHE_EXPIRATION) {
            setDeals(data);
            setIsLoading(false);
            return;
          }
        }

        const response = await fetch('/api/best_deals');
        if (!response.ok) {
          throw new Error('Failed to fetch best deals');
        }
        const data = await response.json();
        setDeals(data.bestDeals);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: data.bestDeals, timestamp: Date.now() }));
      } catch (error) {
        console.error('Error fetching best deals:', error);
        setError('Failed to load best deals. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBestDeals();
  }, []);

  const handleBookAppointment = (clinic, treatment, price, postcode) => {
    const bookingUrl = `/book?${new URLSearchParams({ clinic, treatment, price: price.toString(), postcode })}`;
    router.push(bookingUrl);
  };

  const renderStars = (rating) => (
    [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < Math.floor(rating) ? styles.starFilled : styles.starEmpty}
      />
    ))
  );

  if (isLoading) return <div className={styles.loading}>Loading best deals...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <section className={styles.bestDealsSection}>
      <h2 className={styles.bestDealsTitle}>Featured Deals</h2>
      <div className={styles.dealsContainer}>
        {deals.map((deal, index) => (
          <div key={index} className={styles.dealCard}>
            <a href={`/clinic/${deal.clinicName}?category=${deal.category}&treatment=${deal.treatment}`}>
              <div className={styles.clinicName}>{deal.clinicName}</div>
              <div className={styles.dealContent}>
                <div className={styles.treatmentName}>{deal.treatment}</div>
                <div className={styles.treatmentCategory}>{deal.category}</div>
                <div className={styles.ratingPrice}>
                  <div className={styles.rating}>
                    {renderStars(deal.rating)}
                    <span className={styles.reviewCount}>({deal.totalReviews})</span>
                  </div>
                  <div className={styles.price}>£{deal.price.toFixed(2)}</div>
                </div>
                <button
                  className={styles.bookButton}
                  onClick={(e) => {
                    e.preventDefault();
                    handleBookAppointment(deal.clinicName, deal.treatment, deal.price, deal.postcode);
                  }}
                >
                  <FaCalendar /> Book Appointment
                </button>
              </div>
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BestDeals;