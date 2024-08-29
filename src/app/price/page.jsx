"use client"

import { useState, useRef, useEffect } from 'react';
import styles from './page.module.scss';
import Link from 'next/link';
import { FaUser, FaBoxOpen, FaFileInvoiceDollar, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { categoryNames } from '../lib/data';
import {LogoutLink} from "@kinde-oss/kinde-auth-nextjs/components";

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSubmenu, setShowSubmenu] = useState(false);
  const submenuRef = useRef(null);

  const handleSearch = async () => {
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchTerm, category, location }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("res", data);
      setSearchResults(data);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    }
  };

  const toggleSubmenu = () => {
    setShowSubmenu(!showSubmenu);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (submenuRef.current && !submenuRef.current.contains(event.target)) {
        setShowSubmenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.container}>
       <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>DentalPricing.co.uk</h1>
          <nav>
            <div ref={submenuRef} className={styles.accountWrapper}>
              <button onClick={toggleSubmenu} className={styles.accountButton}>My Account</button>
              {showSubmenu && (
                <div className={styles.accountSubmenu}>
                  <ul>
                    <li><Link href="/profile"><FaUser /> Profile</Link></li>
                    <li><Link href="/subscription"><FaBoxOpen /> Subscription</Link></li>
                    <li><Link href="/billing"><FaFileInvoiceDollar /> Billing</Link></li>
                    <li><Link href="/settings"><FaCog /> Settings</Link></li>
                    <li><LogoutLink href="/logout"><FaSignOutAlt /> Logout</LogoutLink></li>
                  </ul>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>
      <main className={styles.main}>
        <section className={styles.searchSection}>
          <h2 className={styles.searchTitle}>Search Dental Treatment Prices</h2>
          
          <div className={styles.searchBar}>
            <input 
              type="text" 
              placeholder="Search for a dental treatment..." 
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className={styles.categoryDropdowns}>
            <select 
              className={styles.dropdown}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select Treatment Category</option>
              {categoryNames.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input 
              type="text"
              placeholder="Enter location or postcode"
              className={styles.dropdown}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <button className={styles.searchButton} onClick={handleSearch}>Search Prices</button>
        </section>

        <section id="search-results" className={styles.resultsSection}>
          <h3 className={styles.resultsTitle}>Search Results</h3>
          {searchResults.length > 0 ? (
            <ul className={styles.resultsList}>
              {searchResults.map((result) => {
                console.log("result",result)
                return(
                <li key={result._id} className={styles.resultItem}>
                  <h4>{result.Name}</h4>
                  <p>Treatment: {result.treatment}</p>
                  <p>Price: £{result.Price}</p>
                  <p>Category: {result.Category}</p>
                  <p>Address: {result["Address 1"]}, {result.Postcode}</p>
                  <p>Website: <a href={result.Website} target="_blank" rel="noopener noreferrer">{result.Website}</a></p>
                  <p>Fee Page: <a href={result.Feepage} target="_blank" rel="noopener noreferrer">Fee Guide</a></p>
                </li>
              )})}
            </ul>
          ) : (
            <p className={styles.resultsPlaceholder}>Your search results will appear here.</p>
          )}
        </section>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2024 DentalPricing.co.uk. All rights reserved.</p>
      </footer>
    </div>
  );
}