"use client"
import { Suspense } from 'react';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaUser, FaBoxOpen, FaFileInvoiceDollar, FaCog, FaSignOutAlt, FaStar, FaSort, FaSortNumericDown, FaSortNumericUp } from 'react-icons/fa';
import { HiSortAscending, HiSortDescending } from 'react-icons/hi';
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { categoryNames } from '../lib/data';
import styles from './page.module.scss';
import Image from 'next/image';
import GoogleReviews from '../components/GoogleReviews';
import DentalPricingInfo from '../components/DentalPricingInfo';


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

  const submenuRef = useRef(null);

  useEffect(() => {
    const shouldSearch = searchParams.get('searchMethod') && 
                         (searchParams.get('category') || searchParams.get('treatment')) && 
                         searchParams.get('postcode') && 
                         searchParams.get('radius');
    if (shouldSearch) {
      handleSearch();
    }
  }, [searchParams]);

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
      setSearchResults(data.results);
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
  }, [searchMethod, category, treatment, postcode, radius, sortOrder, currentPage, router]);

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

  const isSearchButtonDisabled = useCallback(() => {
    if (searchMethod === 'category' && (!category || !postcode || !radius)) return true;
    if (searchMethod === 'treatment' && (!treatment || !postcode || !radius)) return true;
    return isLoading;
  }, [searchMethod, category, treatment, postcode, radius, isLoading]);

  const trackClick = useCallback(async (url) => {
    try {
      await fetch('/api/track-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url,
          userEmail: 'anonymous' // Replace with actual user email if available
        }),
      });
    } catch (error) {
      console.error("Error tracking click:", error);
    }
  }, []);
  const handleClinicClick = (clinicName, category, treatment) => {
    const encodedClinicName = encodeURIComponent(clinicName);
    const encodedCategory = encodeURIComponent(category);
    const encodedTreatment = encodeURIComponent(treatment);
    router.push(`/clinic/${encodedClinicName}?category=${encodedCategory}&treatment=${encodedTreatment}`);
  };

  const handleBookAppointment = (clinic, treatment, price, postcode) => {
    const bookingUrl = `/book?clinic=${encodeURIComponent(clinic)}&treatment=${encodeURIComponent(treatment)}&price=${encodeURIComponent(price)}&postcode=${encodeURIComponent(postcode)}`;
    window.location.href = bookingUrl;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href={"/price"} className={styles.title}>Dental Pricing</Link>
        </div>
      </header>
      <main className={styles.main}>
        <section className={styles.searchSection}>
          <h2 className={styles.searchTitle}>Search Dental Treatment Prices</h2>
          
          <div className={styles.searchMethodToggle}>
            <button 
              className={`${styles.methodButton} ${searchMethod === 'category' ? styles.active : ''}`}
              onClick={() => setSearchMethod('category')}
            >
              Search by Category
            </button>
          </div>
          
          <div className={styles.searchInputs}>
            {searchMethod === 'category' ? (
              <div className={styles.categoryInputWrapper}>
                <input 
                  type="text"
                  placeholder="Search for a dental treatment..."
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
            ) : (
              <input 
                type="text"
                placeholder="Enter treatment name..."
                value={treatment}
                onChange={(e) => setTreatment(e.target.value)}
                className={styles.searchInput}
              />
            )}
            <input 
              type="text"
              placeholder="Enter full Postcode (eg nx 2xx)"
              className={styles.searchInput}
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
            />
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
          
          {warningMessage && <p className={styles.warningMessage}>{warningMessage}</p>}
          
          <button 
            className={styles.searchButton} 
            onClick={() => handleSearch(1)}
            disabled={isSearchButtonDisabled()}
          >
            Search Prices
          </button>
        </section>

        <section id="search-results" className={styles.resultsSection}>
          {isLoading ? (
            <div className={styles.loadingSpinner}>Loading...</div>
          ) : (
            <>
              {searchResults.length > 0 && (
                <div className={styles.resultsSummary}>
                  <h3 className={styles.resultsTitle}>Search Results (Showing {searchResults.length} of {totalResults})</h3>
                  <div className={styles.sortControls}>
                    <span>Sort by:</span>
                    <div className={styles.sortOption}>
                      <span>Distance</span>
                      <button 
                        onClick={() => handleSortChange('distance-asc')} 
                        className={sortOrder === 'distance-asc' ? styles.active : ''}
                        aria-label="Sort distance ascending"
                      >
                        <HiSortAscending />
                      </button>
                      <button 
                        onClick={() => handleSortChange('distance-desc')} 
                        className={sortOrder === 'distance-desc' ? styles.active : ''}
                        aria-label="Sort distance descending"
                      >
                        <HiSortDescending />
                      </button>
                    </div>
                    <div className={styles.sortOption}>
                      <span>Price</span>
                      <button 
                        onClick={() => handleSortChange('price-asc')} 
                        className={sortOrder === 'price-asc' ? styles.active : ''}
                        aria-label="Sort price ascending"
                      >
                        <HiSortAscending />
                      </button>
                      <button 
                        onClick={() => handleSortChange('price-desc')} 
                        className={sortOrder === 'price-desc' ? styles.active : ''}
                        aria-label="Sort price descending"
                      >
                        <HiSortDescending />
                      </button>
                    </div>
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
                        </div>
                        <p>Treatment: {result.treatment}</p>
                        <p>Price: £{result.Price}</p>
                        {/* <p>Category: {result.Category}</p> */}
                        <p>Address: {result["Address 1"]}, {result.Postcode}</p>
                        <p>Distance: {result.distance.toFixed(2)} miles</p>
                        <p>Website: <a href={result.Website} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(result.Website)}>{result.Website}</a></p>
                        {/* <p>Fee Page: <a href={result.Feepage} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(result.Feepage)}>Fee Guide</a></p> */}
                        <button 
                          className={styles.bookButton}
                          onClick={() => handleBookAppointment(result.Name, result.treatment, result.Price, result.Postcode)}
                        >
                          Book Appointment
                        </button>
                        {/* <GoogleReviews 
                          name={result.Name}
                          address={result["Address 1"]}
                          postcode={result.Postcode}
                          placeId={result.placeId}
                        /> */}
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
                // <p className={styles.resultsPlaceholder}>Your search results will appear here.</p>
                <DentalPricingInfo />

              )}
            </>
          )}
        </section>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2024 Dental Pricing. All rights reserved.</p>
      </footer>
    </div>
  );
}
export default function PricePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Dashboard />
    </Suspense>
  );
}