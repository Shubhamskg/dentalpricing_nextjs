"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { FaTooth, FaUserCircle } from 'react-icons/fa';
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { LoginLink, LogoutLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";
import styles from './Navbar.module.scss';
import Loading from './Loading';

const NavLink = ({ href, children }) => (
  <Link href={href} className={styles.navLink}>
    {children}
  </Link>
);

const Navbar = () => {
  const { user, isLoading } = useKindeBrowserClient();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <Link href="/" className={styles.logoLink}>
          <FaTooth className={styles.logo} />
          <span className={styles.logoText}>DentalPricing</span>
        </Link>
        <ul className={styles.navLinks}>
          <li><NavLink href="/">Home</NavLink></li>
          {/* <li><NavLink href="/price">Compare Prices</NavLink></li> */}
          <li><NavLink href="/about">About</NavLink></li>
          <li><NavLink href="/contact">Contact</NavLink></li>
        </ul>
        <div className={styles.authSection}>
          {isLoading ? (
            <Loading/>
          ) : user ? (
            <div className={styles.userProfile}>
              <button onClick={toggleProfileMenu} className={styles.profileButton}>
                {user.picture ? (
                  <img src={user.picture} alt={user.given_name} className={styles.profilePicture} />
                ) : (
                  <FaUserCircle className={styles.defaultProfileIcon} />
                )}
                <span>{user.given_name}</span>
              </button>
              {isProfileMenuOpen && (
                <div className={styles.profileMenu}>
                  <Link href="/profile">My Profile</Link>
                  <LogoutLink>Log Out</LogoutLink>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.authButtons}>
              <LoginLink className={styles.loginButton}>Log in</LoginLink>
              <RegisterLink className={styles.signupButton}>Sign up</RegisterLink>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;