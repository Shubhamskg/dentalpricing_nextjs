"use client"
import React from 'react';
import styles from './page.module.scss';
import { FaCheckCircle, FaUsers, FaHospital } from 'react-icons/fa';

const AboutPage = () => {
  return (
    <div className={styles.aboutPage}>
      <h1>About Dental Pricing</h1>
      <p className={styles.intro}>Dental Pricing is the UK's leading platform for comparing private dental treatment prices, helping both patients and dentists make informed decisions about dental care and pricing.</p>

      <section className={styles.missionSection}>
        <h2>Our Mission</h2>
        <p>We aim to bring transparency to dental pricing across the UK, empowering patients to find affordable care and helping dentists stay competitive in the market.</p>
      </section>

      <section className={styles.statsSection}>
        <h2>Dental Pricing at a Glance</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <FaCheckCircle />
            <h3>95%</h3>
            <p>of UK private dental clinics covered</p>
          </div>
          <div className={styles.statItem}>
            <FaUsers />
            <h3>5,000+</h3>
            <p>patients have used our service</p>
          </div>
          <div className={styles.statItem}>
            <FaHospital />
            <h3>200</h3>
            <p>dentists are paid subscribers</p>
          </div>
        </div>
      </section>

      <section className={styles.servicesSection}>
        <h2>Our Services</h2>
        <h3>For Patients</h3>
        <ul>
          <li>Compare prices for over 100 dental treatment categories</li>
          <li>Access pricing data from 95% of UK private dental clinics</li>
          <li>Make informed decisions about dental care</li>
        </ul>
        <h3>For Dentists</h3>
        <ul>
          <li>Access nationwide pricing data for competitive analysis</li>
          <li>Set informed, market-competitive rates</li>
          <li>Attract new patients with transparent pricing</li>
        </ul>
      </section>

      <section className={styles.teamSection}>
        <h2>Our Team</h2>
        <p>Dental Pricing was founded by a team of dental professionals and data analysts passionate about improving access to dental care information. Our diverse team brings together expertise in dentistry, data science, and customer service to provide the most comprehensive and user-friendly dental pricing platform in the UK.</p>
      </section>
    </div>
  );
};

export default AboutPage;