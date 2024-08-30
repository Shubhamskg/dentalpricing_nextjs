"use client"

import { useState, useRef, useEffect } from 'react';
import styles from './page.module.scss';
import Link from 'next/link';
import { FaUser, FaBoxOpen, FaFileInvoiceDollar, FaCog, FaSignOutAlt, FaSort, FaSortNumericDown, FaSortNumericUp } from 'react-icons/fa';
import { categoryNames } from '../lib/data';
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";


export default function Dashboard() {
  const [searchMethod, setSearchMethod] = useState('category');
  const [category, setCategory] = useState('');
  const [treatment, setTreatment] = useState('');
  const [postcode, setPostcode] = useState('');
  const [radius, setRadius] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSubmenu, setShowSubmenu] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState(categoryNames);
  const [isLoading, setIsLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState('distance-asc');
  const [warningMessage, setWarningMessage] = useState('');
  const submenuRef = useRef(null);
  const [hasSearched, setHasSearched] = useState(false);

  const { user } = useKindeBrowserClient();

  const trackClick = async (url) => {
    try {
      await fetch('/api/track-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url,
          userEmail: user?.email || 'anonymous'
        }),
      });
    } catch (error) {
      console.error("Error tracking click:", error);
    }
  };
  const handleSearch = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);
    setWarningMessage('');
    setHasSearched(true);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          searchMethod,
          category: searchMethod === 'category' ? category : '',
          treatment: searchMethod === 'treatment' ? treatment : '',
          postcode,
          radius: parseFloat(radius)
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSearchResults(sortResults(data, sortOrder));
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      setWarningMessage('An error occurred while fetching results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const validateInputs = () => {
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
  };

  const sortResults = (results, order) => {
    const [field, direction] = order.split('-');
    return results?.sort((a, b) => {
      if (field === 'price') {
        return direction === 'asc' ? a.Price - b.Price : b.Price - a.Price;
      } else {
        return direction === 'asc' ? a.distance - b.distance : b.distance - a.distance;
      }
    });
  };

  const handleSortChange = (newOrder) => {
    setSortOrder(newOrder);
    setSearchResults(sortResults([...searchResults], newOrder));
  };

  const toggleSubmenu = () => {
    setShowSubmenu(!showSubmenu);
  };

  const handleCategoryInputChange = (e) => {
    const value = e.target.value;
    setCategory(value);
    setFilteredCategories(
      categoryNames.filter(cat => 
        cat.toLowerCase().includes(value.toLowerCase())
      ).sort((a, b) => a.localeCompare(b))
    );
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

  const isSearchButtonDisabled = () => {
    if (searchMethod === 'category' && (!category || !postcode || !radius)) return true;
    if (searchMethod === 'treatment' && (!treatment || !postcode || !radius)) return true;
    return false;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Dental Pricing</h1>
          <nav>
            <div ref={submenuRef} className={styles.accountWrapper}>
              <button onClick={toggleSubmenu} className={styles.accountButton}>My Account</button>
              {showSubmenu && (
                <div className={styles.accountSubmenu}>
                  <ul>
                    <li><Link href="/profile"><FaUser /> Profile</Link></li>
                    <li><Link href="/subscriptions"><FaBoxOpen /> Subscription</Link></li>
                    <li><Link href="/billing"><FaFileInvoiceDollar /> Billing</Link></li>
                    <li><Link href="/settings"><FaCog /> Settings</Link></li>
                    <li><LogoutLink><FaSignOutAlt /> Logout</LogoutLink></li>
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
          
          <div className={styles.searchMethodToggle}>
            <button 
              className={`${styles.methodButton} ${searchMethod === 'category' ? styles.active : ''}`}
              onClick={() => setSearchMethod('category')}
            >
              Search by Category
            </button>
            <button 
              className={`${styles.methodButton} ${searchMethod === 'treatment' ? styles.active : ''}`}
              onClick={() => setSearchMethod('treatment')}
            >
              Search by Treatment
            </button>
          </div>
          
          <div className={styles.searchInputs}>
            {searchMethod === 'category' ? (
              <div className={styles.categoryInputWrapper}>
                <input 
                  type="text"
                  placeholder="Select or type a category..."
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
              placeholder="Enter postcode"
              className={styles.searchInput}
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
            />
            <input 
              type="number"
              placeholder="Search radius (miles)"
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
            onClick={handleSearch}
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
                  <h3 className={styles.resultsTitle}>Search Results ({searchResults.length})</h3>
                  <div className={styles.sortControls}>
                    <span>Sort by:</span>
                    <span>Distance</span>
                    <button onClick={() => handleSortChange('distance-asc')} className={sortOrder === 'distance-asc' ? styles.active : ''}><FaSortNumericUp /></button>
                    <button onClick={() => handleSortChange('distance-desc')} className={sortOrder === 'distance-desc' ? styles.active : ''}>
                       <FaSortNumericDown />
                    </button>
                    <span>&nbsp;</span>
                    <span>Pricess</span>
                    <button onClick={() => handleSortChange('price-asc')} className={sortOrder === 'price-asc' ? styles.active : ''}>
                       <FaSortNumericUp />
                    </button>
                   
                    <button onClick={() => handleSortChange('price-desc')} className={sortOrder === 'price-desc' ? styles.active : ''}>
                       <FaSortNumericDown />
                    </button>
                  </div>
                </div>
              )}
              {searchResults.length > 0 ? (
                <ul className={styles.resultsList}>
                  {searchResults.map((result) => (
                    <li key={result._id} className={styles.resultItem}>
                      <h4>{result.Name}</h4>
                      <p>Treatment: {result.treatment}</p>
                      <p>Price: £{result.Price}</p>
                      <p>Category: {result.Category}</p>
                      <p>Address: {result["Address 1"]}, {result.Postcode}</p>
                      <p>Distance: {result.distance.toFixed(2)} miles</p>
                      <p>Website: <a href={result.Website} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(result.Website)}>{result.Website}</a></p>
        <p>Fee Page: <a href={result.Feepage} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(result.Feepage)}>Fee Guide</a></p>
                      {/* <p>Website: <a href={result.Website} target="_blank" rel="noopener noreferrer">{result.Website}</a></p>
                      <p>Fee Page: <a href={result.Feepage} target="_blank" rel="noopener noreferrer">Fee Guide</a></p> */}
                    </li>
                  ))}
                </ul>
              ) :  hasSearched ? (
              <p className={styles.noResults}>No results found for your search criteria. Please try adjusting your search parameters.</p>
            ) :
              (
                <p className={styles.resultsPlaceholder}>Your search results will appear here.</p>
              )}
            </>
          )}
        </section>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2024 DentalPricing.co.uk. All rights reserved.</p>
      </footer>
    </div>
  );
}
// "use client"

// import { useState, useRef, useEffect } from 'react';
// import styles from './page.module.scss';
// import Link from 'next/link';
// import { FaUser, FaBoxOpen, FaFileInvoiceDollar, FaCog, FaSignOutAlt, FaSort, FaSortNumericDown, FaSortNumericUp, FaSearch } from 'react-icons/fa';
// import { categoryNames } from '../lib/data';
// import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
// import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

// export default function Dashboard() {
//   const [searchMethod, setSearchMethod] = useState('category');
//   const [category, setCategory] = useState('');
//   const [treatment, setTreatment] = useState('');
//   const [postcode, setPostcode] = useState('');
//   const [radius, setRadius] = useState('');
//   const [searchResults, setSearchResults] = useState([]);
//   const [showSubmenu, setShowSubmenu] = useState(false);
//   const [filteredCategories, setFilteredCategories] = useState(categoryNames);
//   const [isLoading, setIsLoading] = useState(false);
//   const [sortOrder, setSortOrder] = useState('distance-asc');
//   const [warningMessage, setWarningMessage] = useState('');
//   const [error, setError] = useState(null);
//   const submenuRef = useRef(null);
//   const [hasSearched, setHasSearched] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(0);
//   const { user } = useKindeBrowserClient();

//   const handleSearch = async (page = 1) => {
//     if (!validateInputs()) {
//       return;
//     }

//     setIsLoading(true);
//     setWarningMessage('');
//     setError(null);
//     setHasSearched(true);

//     try {
//       const response = await fetch('/api/search', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ 
//           searchMethod,
//           category: searchMethod === 'category' ? category : '',
//           treatment: searchMethod === 'treatment' ? treatment : '',
//           postcode,
//           radius: parseFloat(radius),
//           page,
//           pageSize: 10 // You can adjust this value
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || `HTTP error! status: ${response.status}`);
//       }

//       setSearchResults(data.results);
//       setCurrentPage(data.pagination.currentPage);
//       setTotalPages(data.pagination.totalPages);
//     } catch (error) {
//       console.error("Search error:", error);
//       setSearchResults([]);
//       setError(error.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const validateInputs = () => {
//     if (searchMethod === 'category' && !category) {
//       setWarningMessage('Please select a category.');
//       return false;
//     }
//     if (searchMethod === 'treatment' && !treatment) {
//       setWarningMessage('Please enter a treatment.');
//       return false;
//     }
//     if (!postcode) {
//       setWarningMessage('Please enter a postcode.');
//       return false;
//     }
//     if (!radius) {
//       setWarningMessage('Please enter a search radius.');
//       return false;
//     }
//     return true;
//   };

//   const handleSortChange = (newOrder) => {
//     setSortOrder(newOrder);
//     const sortedResults = [...searchResults].sort((a, b) => {
//       if (newOrder === 'price-asc') return a.Price - b.Price;
//       if (newOrder === 'price-desc') return b.Price - a.Price;
//       if (newOrder === 'distance-asc') return a.distance - b.distance;
//       if (newOrder === 'distance-desc') return b.distance - a.distance;
//       return 0;
//     });
//     setSearchResults(sortedResults);
//   };

//   const toggleSubmenu = () => {
//     setShowSubmenu(!showSubmenu);
//   };

//   const handleCategoryInputChange = (e) => {
//     const value = e.target.value;
//     setCategory(value);
//     setFilteredCategories(
//       categoryNames.filter(cat => 
//         cat.toLowerCase().includes(value.toLowerCase())
//       ).sort((a, b) => a.localeCompare(b))
//     );
//   };

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (submenuRef.current && !submenuRef.current.contains(event.target)) {
//         setShowSubmenu(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   const isSearchButtonDisabled = () => {
//     if (searchMethod === 'category' && (!category || !postcode || !radius)) return true;
//     if (searchMethod === 'treatment' && (!treatment || !postcode || !radius)) return true;
//     return false;
//   };

//   const trackClick = async (url) => {
//     try {
//       await fetch('/api/track-click', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ 
//           url,
//           userEmail: user?.email || 'anonymous'
//         }),
//       });
//     } catch (error) {
//       console.error("Error tracking click:", error);
//     }
//   };

//   return (
//     <div className={styles.container}>
//       <header className={styles.header}>
//         <div className={styles.headerContent}>
//           <h1 className={styles.title}>Dental Pricing</h1>
//           <nav>
//             <div ref={submenuRef} className={styles.accountWrapper}>
//               <button onClick={toggleSubmenu} className={styles.accountButton}>My Account</button>
//               {showSubmenu && (
//                 <div className={styles.accountSubmenu}>
//                   <ul>
//                     <li><Link href="/profile"><FaUser /> Profile</Link></li>
//                     <li><Link href="/subscriptions"><FaBoxOpen /> Subscription</Link></li>
//                     <li><Link href="/billing"><FaFileInvoiceDollar /> Billing</Link></li>
//                     <li><Link href="/settings"><FaCog /> Settings</Link></li>
//                     <li><LogoutLink><FaSignOutAlt /> Logout</LogoutLink></li>
//                   </ul>
//                 </div>
//               )}
//             </div>
//           </nav>
//         </div>
//       </header>
//       <main className={styles.main}>
//         <section className={styles.searchSection}>
//           <h2 className={styles.searchTitle}>Search Dental Treatment Prices</h2>
          
//           <div className={styles.searchMethodToggle}>
//             <button 
//               className={`${styles.methodButton} ${searchMethod === 'category' ? styles.active : ''}`}
//               onClick={() => setSearchMethod('category')}
//             >
//               Search by Category
//             </button>
//             <button 
//               className={`${styles.methodButton} ${searchMethod === 'treatment' ? styles.active : ''}`}
//               onClick={() => setSearchMethod('treatment')}
//             >
//               Search by Treatment
//             </button>
//           </div>
          
//           <div className={styles.searchInputs}>
//             {searchMethod === 'category' ? (
//               <div className={styles.categoryInputWrapper}>
//                 <input 
//                   type="text"
//                   placeholder="Select or type a category..."
//                   value={category}
//                   onChange={handleCategoryInputChange}
//                   className={styles.searchInput}
//                 />
//                 {filteredCategories.length > 0 && category && (
//                   <ul className={styles.categoryDropdown}>
//                     {filteredCategories.map((cat) => (
//                       <li 
//                         key={cat} 
//                         onClick={() => {
//                           setCategory(cat);
//                           setFilteredCategories([]);
//                         }}
//                       >
//                         {cat}
//                       </li>
//                     ))}
//                   </ul>
//                 )}
//               </div>
//             ) : (
//               <input 
//                 type="text"
//                 placeholder="Enter treatment name..."
//                 value={treatment}
//                 onChange={(e) => setTreatment(e.target.value)}
//                 className={styles.searchInput}
//               />
//             )}
//             <input 
//               type="text"
//               placeholder="Enter postcode"
//               className={styles.searchInput}
//               value={postcode}
//               onChange={(e) => setPostcode(e.target.value)}
//             />
//             <input 
//               type="number"
//               placeholder="Search radius (miles)"
//               className={styles.searchInput}
//               value={radius}
//               onChange={(e) => setRadius(e.target.value)}
//               min="0"
//               step="0.1"
//             />
//           </div>
          
//           {warningMessage && <p className={styles.warningMessage}>{warningMessage}</p>}
          
//           <button 
//             className={styles.searchButton} 
//             onClick={() => handleSearch(1)}
//             disabled={isSearchButtonDisabled()}
//           >
//             <FaSearch /> Search Prices
//           </button>
//         </section>

//         <section id="search-results" className={styles.resultsSection}>
//           {isLoading ? (
//             <div className={styles.loadingSpinner}>Loading...</div>
//           ) : error ? (
//             <p className={styles.errorMessage}>{error}</p>
//           ) : (
//             <>
//               {searchResults.length > 0 && (
//                 <div className={styles.resultsSummary}>
//                   <h3 className={styles.resultsTitle}>Search Results ({searchResults.length})</h3>
//                   <div className={styles.sortControls}>
//                     <span>Sort by:</span>
//                     <button onClick={() => handleSortChange('distance-asc')} className={sortOrder === 'distance-asc' ? styles.active : ''}>
//                       Distance <FaSortNumericDown />
//                     </button>
//                     <button onClick={() => handleSortChange('distance-desc')} className={sortOrder === 'distance-desc' ? styles.active : ''}>
//                       Distance <FaSortNumericUp />
//                     </button>
//                     <button onClick={() => handleSortChange('price-asc')} className={sortOrder === 'price-asc' ? styles.active : ''}>
//                       Price <FaSortNumericDown />
//                     </button>
//                     <button onClick={() => handleSortChange('price-desc')} className={sortOrder === 'price-desc' ? styles.active : ''}>
//                       Price <FaSortNumericUp />
//                     </button>
//                   </div>
//                 </div>
//               )}
//               {searchResults.length > 0 ? (
//                 <>
//                   <ul className={styles.resultsList}>
//                     {searchResults.map((result) => (
//                       <li key={result._id} className={styles.resultItem}>
//                         <h4>{result.Name}</h4>
//                         <p>Treatment: {result.treatment}</p>
//                         <p>Price: £{result.Price}</p>
//                         <p>Category: {result.Category}</p>
//                         <p>Address: {result["Address 1"]}, {result.Postcode}</p>
//                         <p>Distance: {result.distance.toFixed(2)} miles</p>
//                         <p>Website: <a href={result.Website} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(result.Website)}>{result.Website}</a></p>
//                         <p>Fee Page: <a href={result.Feepage} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(result.Feepage)}>Fee Guide</a></p>
//                       </li>
//                     ))}
//                   </ul>
//                   <div className={styles.pagination}>
//                     <button 
//                       onClick={() => handleSearch(currentPage - 1)} 
//                       disabled={currentPage === 1}
//                       className={styles.paginationButton}
//                     >
//                       Previous
//                     </button>
//                     <span className={styles.pageInfo}>Page {currentPage} of {totalPages}</span>
//                     <button 
//                       onClick={() => handleSearch(currentPage + 1)} 
//                       disabled={currentPage === totalPages}
//                       className={styles.paginationButton}
//                     >
//                       Next
//                     </button>
//                   </div>
//                 </>
//               ) : hasSearched ? (
//                 <p className={styles.noResults}>No results found for your search criteria. Please try adjusting your search parameters.</p>
//               ) : (
//                 <p className={styles.resultsPlaceholder}>Your search results will appear here.</p>
//               )}
//             </>
//           )}
//         </section>
//       </main>

//       <footer className={styles.footer}>
//         <p>&copy; 2024 DentalPricing.co.uk. All rights reserved.</p>
//       </footer>
//     </div>
//   );
// }