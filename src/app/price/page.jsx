"use client"

import React, { Suspense, useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaTooth, FaSort,  FaStar, FaStarHalfAlt } from 'react-icons/fa';
import { HiSortAscending, HiSortDescending } from 'react-icons/hi';
import { MapPin, Ruler } from 'lucide-react';
import styles from './page.module.scss';
import Loading from '../components/Loading';
import BestDeals from '../components/BestDeals';
import DentalPricingInfo from '../components/DentalPricingInfo';
import { categoryNames } from '../lib/data';

function StarRating({ rating }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className={styles.starRating}>
      {[...Array(5)].map((_, index) => {
        if (index < fullStars) {
          return <FaStar key={index} className={styles.starFull} />;
        } else if (index === fullStars && hasHalfStar) {
          return <FaStarHalfAlt key={index} className={styles.starHalf} />;
        } else {
          return <FaStar key={index} className={styles.starEmpty} />;
        }
      })}
    </div>
  );
}

function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchMethod, setSearchMethod] = useState(searchParams.get('searchMethod') || 'category');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [treatment, setTreatment] = useState(searchParams.get('treatment') || '');
  const [postcode, setPostcode] = useState(searchParams.get('postcode') || '');
  const [radius, setRadius] = useState(searchParams.get('radius') || '');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sort') || 'price-desc');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [filteredCategories, setFilteredCategories] = useState([]);

  const fetchReviews = useCallback(async (name, address, postcode) => {
    try {
      const response = await fetch(`/api/reviewsData?name=${encodeURIComponent(name)}&address=${encodeURIComponent(address)}&postcode=${encodeURIComponent(postcode)}`);
      if (response.ok) {
        const data = await response.json();
        return { rating: data.rating, totalReviews: data.totalReviews };
      } else {
        try {
          const response = await fetch(`/api/place-id?name=${encodeURIComponent(name)}&address=${encodeURIComponent(address)}&postcode=${encodeURIComponent(postcode)}`);
          if (!response.ok) throw new Error('Failed to fetch Place ID');
          const data = await response.json();
          const apiResponse = await fetch(`/api/google-reviews?placeId=${data.placeId}`);
          if (!apiResponse.ok) {
            throw new Error('Failed to fetch reviews from Google API');
          }
          const apiData = await apiResponse.json();
          return { rating: apiData.rating, totalReviews: apiData.totalReviews}
        } catch (error) {
          console.error('Error fetching Place ID:', error);
          throw error;
        }
        
       
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return { rating: 3.4, totalReviews: 5 };
    }
  }, []);

  const handleSearch = useCallback(async (page = currentPage, newSortOrder = sortOrder) => {
    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);
    setWarningMessage('');
    setHasSearched(true);

    const queryParams = new URLSearchParams({
      searchMethod,
      ...(searchMethod === 'category' ? { category } : { treatment }),
      postcode,
      radius,
      page: page.toString(),
      sort: newSortOrder,
    });

    try {
      const response = await fetch(`/api/search?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Fetch reviews for each result
      const resultsWithReviews = await Promise.all(data.results.map(async (result) => {
        const reviewData = await fetchReviews(result.Name, result["Address 1"], result.Postcode);
        return { ...result, ...reviewData };
      }));

      // Sort results based on the new sortOrder
      const sortedResults = sortResults(resultsWithReviews, newSortOrder);

      setSearchResults(sortedResults);
      setCurrentPage(data.pagination.currentPage);
      setTotalPages(data.pagination.totalPages);
      setTotalResults(data.pagination.totalResults);

      // Update URL without triggering a page reload
      router.push(`/price?${queryParams.toString()}`, undefined, { shallow: true });
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      setWarningMessage('An error occurred while fetching results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [searchMethod, category, treatment, postcode, radius, sortOrder, currentPage, router, fetchReviews]);

  const sortResults = (results, order) => {
    switch (order) {
      case 'rating-desc':
        return results.sort((a, b) => b.rating - a.rating);
      case 'rating-asc':
        return results.sort((a, b) => a.rating - b.rating);
      case 'price-desc':
        return results.sort((a, b) => b.Price - a.Price);
      case 'price-asc':
        return results.sort((a, b) => a.Price - b.Price);
      case 'distance-asc':
        return results.sort((a, b) => a.distance - b.distance);
      case 'distance-desc':
        return results.sort((a, b) => b.distance - a.distance);
      default:
        return results;
    }
  };

  const handleSortChange = useCallback((newOrder) => {
    setSortOrder(newOrder);
    handleSearch(1, newOrder);
  }, [handleSearch]);

  const validateInputs = useCallback(() => {
    if (searchMethod === 'category' && !category) {
      setWarningMessage('Please select a category.');
      return false;
    }
    if (searchMethod === 'treatment' && !treatment) {
      setWarningMessage('Please enter a treatment.');
      return false;
    }
    if (!postcode) {
      setWarningMessage('Please enter a postcode.');
      return false;
    }
    if (!radius) {
      setWarningMessage('Please enter a search radius.');
      return false;
    }
    return true;
  }, [searchMethod, category, treatment, postcode, radius]);

  const handleCategoryInputChange = useCallback((e) => {
    const value = e.target.value;
    setCategory(value);
    setFilteredCategories(
      categoryNames.filter(cat => 
        cat.toLowerCase().includes(value.toLowerCase())
      ).sort((a, b) => a.localeCompare(b))
    );
  }, []);

  const handleClinicClick = useCallback((clinicName, category, treatment) => {
    const encodedClinicName = encodeURIComponent(clinicName);
    const encodedCategory = encodeURIComponent(category);
    const encodedTreatment = encodeURIComponent(treatment);
    router.push(`/clinic/${encodedClinicName}?category=${encodedCategory}&treatment=${encodedTreatment}`);
  }, [router]);

  const handleBookAppointment = useCallback((clinic, treatment, price, postcode) => {
    const bookingUrl = `/book?clinic=${encodeURIComponent(clinic)}&treatment=${encodeURIComponent(treatment)}&price=${encodeURIComponent(price)}&postcode=${encodeURIComponent(postcode)}`;
    window.location.href = bookingUrl;
  }, []);

  useEffect(() => {
    const shouldSearch = searchParams.get('searchMethod') && 
                         (searchParams.get('category') || searchParams.get('treatment')) && 
                         searchParams.get('postcode') && 
                         searchParams.get('radius');
    if (shouldSearch) {
      handleSearch();
    }
  }, [searchParams, handleSearch]);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <section className={styles.searchSection}>
          <div className={styles.contentWrapper}>
            <h1 className={styles.mainTitle}>We know what a smile is really worth</h1>
            <p className={styles.subtitle}>Compare dental clinics, find the best prices and book appointments</p>
            <div className={styles.searchInputs}>
              <div className={styles.inputWrapper}>
                <FaTooth className={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="Search for Treatment"
                  value={category}
                  onChange={handleCategoryInputChange}
                  className={styles.searchInput}
                />
                {filteredCategories.length > 0 && category && (
                  <ul className={styles.categoryDropdown}>
                    {filteredCategories.map((cat) => (
                      <li 
                        key={cat} 
                        onClick={() => {
                          setCategory(cat);
                          setFilteredCategories([]);
                        }}
                      >
                        {cat}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className={styles.inputWrapper}>
                <MapPin className={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="Enter full Postcode (eg nx 2xx)"
                  className={styles.searchInput}
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                />
              </div>
              <div className={styles.inputWrapper}>
                <Ruler className={styles.inputIcon} />
                <input
                  type="number"
                  placeholder="Radius (miles)"
                  className={styles.searchInput}
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                  min="0"
                  step="0.1"
                />
              </div>
              <button 
                className={styles.searchButton} 
                onClick={() => handleSearch(1)}
                disabled={isLoading}
              >
                Find
              </button>
            </div>
          </div>
        </section>

        {searchResults.length === 0 && <BestDeals />}

        <section id="search-results" className={styles.resultsSection}>
          {isLoading ? (
            <Loading/>
          ) : (
            <>
              {searchResults.length > 0 && (
                <div className={styles.resultsSummary}>
                  <h3 className={styles.resultsTitle}>Search Results (Showing {searchResults.length} of {totalResults})</h3>
                  <div className={styles.sortControls}>
                    <button 
                      onClick={() => handleSortChange('our-top-picks')}
                      className={`${styles.sortButton} ${sortOrder === 'our-top-picks' ? styles.active : ''}`}
                    >
                      <FaSort /> Our top picks
                    </button>
                    <button 
                      onClick={() => handleSortChange(sortOrder === 'price-asc' ? 'price-desc' : 'price-asc')}
                      className={`${styles.sortButton} ${sortOrder.startsWith('price') ? styles.active : ''}`}
                    >
                      {sortOrder === 'price-asc' ? <HiSortAscending /> : <HiSortDescending />} Price
                    </button>
                    <button 
                      onClick={() => handleSortChange(sortOrder === 'distance-asc' ? 'distance-desc' : 'distance-asc')}
                      className={`${styles.sortButton} ${sortOrder.startsWith('distance') ? styles.active : ''}`}
                    >
                      {sortOrder === 'distance-asc' ? <HiSortAscending /> : <HiSortDescending />} Distance
                    </button>
                    <button 
                      onClick={() => handleSortChange(sortOrder === 'rating-asc' ? 'rating-desc' : 'rating-asc')}
                      className={`${styles.sortButton} ${sortOrder.startsWith('rating') ? styles.active : ''}`}
                    >
                      {sortOrder === 'rating-asc' ? <HiSortAscending /> : <HiSortDescending />} Rating
                    </button>
                  </div>
                </div>
              )}
              {searchResults.length > 0 ? (
                <>
                  <ul className={styles.resultsList}>
                    {searchResults.map((result) => (
                      <li key={result._id} className={styles.resultItem}>
                        <div className={styles.clinicHeader}>
                          <button className={styles.headerButton} onClick={() => handleClinicClick(result.Name, result.Category, result.treatment)}>
                            <h4>{result.Name}</h4>
                          </button>
                          <div className={styles.GoogleReviews}>
  <StarRating rating={result.rating} />
  <span>{result.rating.toFixed(1)} ({result.totalReviews} reviews)</span>
</div>
                        </div>
                        <p>Treatment: {result.treatment}</p>
                        <p>Price: £{result.Price}</p>
                        <p>Address: {result["Address 1"]}, {result.Postcode}</p>
                        <p>Distance: {result.distance.toFixed(2)} miles</p>
                        <p>Website: <a href={result.Website} target="_blank" rel="noopener noreferrer">{result.Website}</a></p>
                        <button 
                          className={styles.bookButton}
                          onClick={() => handleBookAppointment(result.Name, result.treatment, result.Price, result.Postcode)}
                        >
                          Book Appointment
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className={styles.pagination}>
                    <button 
                      onClick={() => handleSearch(currentPage - 1)} 
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button 
                      onClick={() => handleSearch(currentPage + 1)} 
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                </>
              ) : hasSearched ? (
                <p className={styles.noResults}>No results found for your search criteria. Please try adjusting your search parameters.</p>
              ) : (
                <DentalPricingInfo />
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default function PricePage() {
  return (
    <Suspense fallback={<Loading />}>
      <Dashboard />
    </Suspense>
  );
}