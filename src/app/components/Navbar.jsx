"use client"

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaTooth, FaUserCircle } from 'react-icons/fa';
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { LoginLink, LogoutLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";
import styles from './Navbar.module.scss';
import Loading from './Loading';

const NavLink = React.memo(({ href, children }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} className={`${styles.navLink} ${isActive ? styles.active : ''}`}>
      {children}
    </Link>
  );
});

NavLink.displayName = 'NavLink';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

const Navbar = () => {
  const { user, isLoading } = useKindeBrowserClient();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [cachedUser, setCachedUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('cachedUser');
    if (storedUser) {
      setCachedUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('cachedUser', JSON.stringify(user));
      setCachedUser(user);
    } else if (user === null && !isLoading) {
      localStorage.removeItem('cachedUser');
      setCachedUser(null);
    }
  }, [user, isLoading]);

  const toggleProfileMenu = useCallback(() => {
    setIsProfileMenuOpen(prev => !prev);
  }, []);

  const memoizedUser = useMemo(() => cachedUser || user, [cachedUser, user]);

  const renderAuthSection = () => {
    if (isLoading) return <Loading />;

    if (memoizedUser) {
      return (
        <div className={styles.userProfile}>
          <button onClick={toggleProfileMenu} className={styles.profileButton}>
            {memoizedUser.picture ? (
              <img src={memoizedUser.picture} alt={memoizedUser.given_name} className={styles.profilePicture} />
            ) : (
              <FaUserCircle className={styles.defaultProfileIcon} />
            )}
            <span>{memoizedUser.given_name}</span>
          </button>
          {isProfileMenuOpen && (
            <div className={styles.profileMenu}>
              <Link href="/profile">My Profile</Link>
              <LogoutLink>Log Out</LogoutLink>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={styles.authButtons}>
        <LoginLink className={styles.loginButton}>Log in</LoginLink>
        <RegisterLink className={styles.signupButton}>Sign up</RegisterLink>
      </div>
    );
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <Link href="/" className={styles.logoLink}>
          <FaTooth className={styles.logo} />
          <span className={styles.logoText}>Dental Pricing</span>
        </Link>
        <ul className={styles.navLinks}>
          {navLinks.map(({ href, label }) => (
            <li key={href}><NavLink href={href}>{label}</NavLink></li>
          ))}
        </ul>
        <div className={styles.authSection}>
          {renderAuthSection()}
        </div>
      </div>
    </nav>
  );
};

export default React.memo(Navbar);