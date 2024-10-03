import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaStar, FaCalendar } from 'react-icons/fa';
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import { initializeApp } from "firebase/app";
import styles from './BestDeals.module.scss';

const CACHE_KEY = 'bestDealsCache';
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "detalpricing.firebaseapp.com",
  projectId: "detalpricing",
  storageBucket: "detalpricing.appspot.com",
  messagingSenderId: "949733253823",
  appId: "1:949733253823:web:50eb1b2f8739abad0d5c0a"
};
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const BestDeals = () => {
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const fetchClinicImage = async (clinicName, website) => {
    const folderName = website.replace(/^https?:\/\//, '').replace(/\/$/, '');
    try {
      // Try 'all_clinics_img' folder first
      const allClinicsRef = ref(storage, `all_clinics_img/${folderName}`);
      const allClinicsContents = await listAll(allClinicsRef);
      if (allClinicsContents.items.length > 0) {
        const largestImage = allClinicsContents.items.reduce((prev, current) => 
          (prev.size > current.size) ? prev : current
        );
        return await getDownloadURL(largestImage);
      }

      // If not found, try 'images' folder
      const imagesRef = ref(storage, `images/${clinicName}`);
      const imagesContents = await listAll(imagesRef);
      if (imagesContents.items.length > 0) {
        const largestImage = imagesContents.items.reduce((prev, current) => 
          (prev.size > current.size) ? prev : current
        );
        return await getDownloadURL(largestImage);
      }
    } catch (error) {
      console.error(`Error fetching image for ${clinicName}:`, error);
    }
    return null;
  };

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

        // Fetch images for each deal
        console.log('Fetched data:', data)
        const dealsWithImages = await Promise.all(data.bestDeals.map(async (deal) => {
          const imageUrl = await fetchClinicImage(deal.clinicName, deal.website);
          return { ...deal, imageUrl };
        }));

        setDeals(dealsWithImages);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: dealsWithImages, timestamp: Date.now() }));
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
              <div className={styles.clinicImageWrapper}>
                {deal.imageUrl ? (
                  <Image
                    src={deal.imageUrl}
                    alt={`${deal.clinicName} clinic`}
                    layout="fill"
                    objectFit="cover"
                    className={styles.clinicImage}
                  />
                ) : (
                  <div className={styles.placeholderImage}>No Image Available</div>
                )}
              </div>
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