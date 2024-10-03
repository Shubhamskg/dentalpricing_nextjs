'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.scss';
import GoogleReviews from '../../components/GoogleReviews';
import ClinicImageGallery from '../../components/ClinicImageGallery';
import { FaMapMarkerAlt, FaGlobe, FaFileInvoiceDollar, FaCalendarAlt, FaSearch, FaTooth, FaStar } from 'react-icons/fa';
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import { initializeApp } from "firebase/app";
import Loading from '@/app/components/Loading';
import ClinicDescription from '../../components/ClinicDescription';

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

export default function ClinicProfile() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const clinicName = decodeURIComponent(params.name);
  const currentCategory = searchParams.get('category');
  const currentTreatment = searchParams.get('treatment');
  const [clinicData, setClinicData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [extractedTitle, setExtractedTitle] = useState('');
  const [extractedDescription, setExtractedDescription] = useState('');
  const [extractedLogo, setExtractedLogo] = useState('');
  const [clinicImages, setClinicImages] = useState([]);
  const [highlightedTreatment, setHighlightedTreatment] = useState(null);
  const [displayedTreatments, setDisplayedTreatments] = useState([]);
  const [hasMoreTreatments, setHasMoreTreatments] = useState(false);
  const [googleRating, setGoogleRating] = useState(null);
  const [totalReviews, setTotalReviews] = useState(0);

  const fetchWebsiteMetadata = async (url) => {
    try {
      const response = await fetch(`/api/fetch-metadata?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch website metadata');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching website metadata:', error);
      return null;
    }
  };

  const fetchClinicLogo = async (clinicName) => {
    try {
      let imagesRef = ref(storage, `all_clinics_img/${clinicName}`);
      let imageList = await listAll(imagesRef);
      
      if (imageList.items.length === 0) {
        imagesRef = ref(storage, `images/${clinicName}`);
        imageList = await listAll(imagesRef);
      }

      if (imageList.items.length > 0) {
          const largestImage = imageList.items.reduce((prev, current) => 
            (prev.size > current.size) ? prev : current
          );
          const url = await getDownloadURL(largestImage);
          return url;
        
      }

      return null;
    } catch (error) {
      console.error('Error fetching clinic logo:', error);
      return null;
    }
  };
  useEffect(() => {
    const fetchClinicData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/clinic?name=${encodeURIComponent(clinicName)}&category=${encodeURIComponent(currentCategory)}&treatment=${encodeURIComponent(currentTreatment)}`)
        if (!response.ok) {
          throw new Error(response.status === 404 ? 'Clinic not found' : 'Failed to fetch clinic data')
        }
        const data = await response.json()
        setClinicData(data)

        if (currentCategory && currentTreatment) {
          const highlighted = data.currentCategory?.treatments.find(t => t.name.toLowerCase() === currentTreatment.toLowerCase())
          setHighlightedTreatment(highlighted || null)
        }

        const allTreatments = [...(data.currentCategory?.treatments || []), ...data.otherTreatments]
        setDisplayedTreatments(allTreatments.slice(0, 8))
        setHasMoreTreatments(allTreatments.length > 8)

        if (data.Website) {
          const metadata = await fetchWebsiteMetadata(data.Website)
          if (metadata) {
            setExtractedTitle(metadata.title || '')
            setExtractedDescription(metadata.description || '')
          }
        }

        const logoUrl = await fetchClinicLogo(clinicName)
        setExtractedLogo(logoUrl)

        const fetchClinicImages = async () => {
          // Fetch images from clinic-specific folder
          const clinicImagesRef = ref(storage, `images/${clinicName}`)
          const clinicImageList = await listAll(clinicImagesRef)
          const clinicUrls = await Promise.all(
            clinicImageList.items.map(imageRef => getDownloadURL(imageRef))
          )

          // Fetch images from all_clinics_img folder
          const clinicUrl=data.Website.replace(/^https?:\/\//, '').replace(/\/$/, '');
          const allClinicsImagesRef = ref(storage, `all_clinics_img/${clinicUrl}`)
          const allClinicsImageList = await listAll(allClinicsImagesRef)
          const allClinicsUrls = await Promise.all(
            allClinicsImageList.items.map(imageRef => getDownloadURL(imageRef))
          )

          // Combine and set all images
          setClinicImages([...clinicUrls, ...allClinicsUrls])
        }

        await fetchClinicImages()

      } catch (error) {
        console.error('Error fetching clinic data:', error)
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchClinicData()
  }, [clinicName, currentCategory, currentTreatment])
  
  const loadMoreTreatments = () => {
    const allTreatments = [...(clinicData.currentCategory?.treatments || []), ...clinicData.otherTreatments];
    const nextTreatments = allTreatments.slice(displayedTreatments.length, displayedTreatments.length + 4);
    setDisplayedTreatments(prev => [...prev, ...nextTreatments]);
    setHasMoreTreatments(displayedTreatments.length + nextTreatments.length < allTreatments.length);
  };

  const handleBookAppointment = (treatment, price) => {
    const bookingUrl = `/book?clinic=${encodeURIComponent(clinicData.Name)}&treatment=${encodeURIComponent(treatment)}&price=${encodeURIComponent(price)}&postcode=${encodeURIComponent(clinicData.Postcode)}`;
    router.push(bookingUrl);
  };

  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, l => l.toUpperCase());
  };

  const filterTreatments = (treatments) => {
    if (!searchTerm) return treatments;
    return treatments.filter(treatment =>
      treatment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      treatment.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleRatingFetched = useCallback((rating, reviews) => {
    setGoogleRating(rating);
    setTotalReviews(reviews);
  }, []);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar key={index} className={index < Math.floor(rating) ? styles.starFilled : styles.starEmpty} />
    ));
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  if (!clinicData) {
    return <div className={styles.error}>No data available</div>;
  }

  const clinicDescription = extractedDescription || clinicData.Description;

  const filteredTreatments = filterTreatments(displayedTreatments);

  return (
    <div className={styles.clinicProfilePage}>
      <div className={styles.clinicProfile}>
        <div className={styles.heroSection}>
          <div className={styles.clinicLogo}>
            {extractedLogo ? (
              <Image src={extractedLogo} alt={`${clinicData.Name} logo`} width={200} height={200} />
            ) : (
              <div className={styles.letterLogo}>{clinicData.Name[0].toUpperCase()}</div>
            )}
          </div>
          <div className={styles.clinicMainInfo}>
            <h1>{clinicData.Name} </h1>
            {googleRating !== null && (
              <div className={styles.googleRating}>
                <span className={styles.ratingNumber}>
                  {typeof googleRating === 'number' ? googleRating.toFixed(1) : googleRating}
                </span>
                <div className={styles.stars}>{renderStars(googleRating)}</div>
                <span className={styles.reviewCount}>({totalReviews} reviews)</span>
              </div>
            )}
            
            <h3>{extractedTitle}</h3>
            {clinicDescription && <p>{clinicDescription}</p>}
            
            <div className={styles.clinicInfo}>
              <p><FaMapMarkerAlt /> {clinicData.Address}, {clinicData.Postcode}</p>
              <p><FaGlobe /> <a href={clinicData.Website} target="_blank" rel="noopener noreferrer">{clinicData.Website}</a></p>
              {clinicData.Feepage && (
                <p><FaFileInvoiceDollar /> <a href={clinicData.Feepage} target="_blank" rel="noopener noreferrer">View Fee Guide</a></p>
              )}
            </div>
          </div>
        </div>
        
        {clinicImages.length > 0 && (
          <div className={styles.gallerySection}>
            <ClinicImageGallery images={clinicImages} />
          </div>
        )}
        
        {highlightedTreatment && (
          <div className={styles.highlightedTreatment}>
            <div className={styles.highlightedContent}>
              <FaTooth className={styles.treatmentIcon} />
              <div className={styles.treatmentInfo}>
                <h2>{capitalizeWords(currentCategory)} - {capitalizeWords(highlightedTreatment.name)}</h2>
                <p className={styles.price}>£{highlightedTreatment.price}</p>
              </div>
              <button 
                className={styles.bookButton}
                onClick={() => handleBookAppointment(highlightedTreatment.name, highlightedTreatment.price)}
              >
               <FaCalendarAlt/> Book Appointment
              </button>
            </div>
          </div>
        )}
        
        <div className={styles.descriptionSection}>
          <ClinicDescription website={clinicData.Website} />
        </div>
        
        <div className={styles.reviewsSection}>
          <GoogleReviews 
            name={clinicData.Name}
            address={clinicData.Address}
            postcode={clinicData.Postcode.split(" ").join("")}
            placeId={clinicData.placeId}
            onRatingFetched={handleRatingFetched}
          />
        </div>
        
        <div className={styles.treatmentsSection}>
          <div className={styles.searchContainer}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search treatments or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          <div className={styles.allTreatments}>
            <h2>Other Treatments</h2>
            <div className={styles.treatmentGrid}>
              {filteredTreatments.map((treatment, index) => (
                <div key={index} className={styles.treatmentCard}>
                  <h3>{capitalizeWords(treatment.name)}</h3>
                  <p className={styles.category}>{capitalizeWords(treatment.category)}</p>
                  <p className={styles.price}>£{treatment.price}</p>
                  <button 
                    className={styles.bookButton}
                    onClick={() => handleBookAppointment(treatment.name, treatment.price)}
                    aria-label={`Book appointment for ${treatment.name}`}
                  >
                    <FaCalendarAlt /> 
                  </button>
                </div>
              ))}
            </div>
            {!searchTerm && hasMoreTreatments && (
              <button onClick={loadMoreTreatments} className={styles.loadMoreButton}>
                Load More Treatments
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}