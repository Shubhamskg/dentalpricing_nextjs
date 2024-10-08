"use client"
import React from 'react';
import styles from './page.module.scss';
import { FaSearch, FaCommentDollar, FaClipboardList, FaUserMd, FaPoundSign, FaStar, FaBolt, FaCheckCircle } from 'react-icons/fa';
import {  FaBalanceScale, FaLock, FaChartLine, FaHandshake, FaHeartbeat, FaCalendarAlt } from 'react-icons/fa';

const AboutPage = () => {
  return (
    <div className={styles.aboutPage}>
      <header className={styles.pageHeader}>
        <h1>About Dental Booking</h1>
        <p className={styles.subtitle}>Your Trusted Guide to Affordable and Quality Dental Care</p>
      </header>
      
      <section className={styles.intro}>
        <h2>Welcome to Dental Booking</h2>
        <p>At <strong>Dental Booking</strong>, we are dedicated to helping patients find the <strong>best dental treatments</strong> at the most <strong>affordable prices</strong>. Whether you're looking for a routine check-up, cosmetic dentistry like teeth whitening, or more complex treatments such as braces or dental implants, our goal is to make <strong>dental care accessible</strong> and <strong>transparent</strong>.</p>
      </section>

      <section className={styles.mission}>
        <h2>Our Mission</h2>
        <p>We understand that finding the right dentist can be a confusing and time-consuming process, especially when it comes to comparing prices and ensuring you're getting the best care. Our mission is simple: to <strong>simplify</strong> the search for <strong>trusted dentists</strong> by providing a platform where you can easily compare <strong>prices, reviews, and services</strong> from verified dental practices in your area.</p>
        <p>By offering you <strong>transparent pricing</strong> and genuine patient reviews, we empower you to make <strong>informed decisions</strong> about your dental health.</p>
      </section>

      <section className={styles.trustReasons}>
        <h2>Why Trust Dental Booking?</h2>
        <p>We know that when it comes to your health, <strong>trust</strong> is everything. That's why <strong>Dental Booking</strong> works only with <strong>verified and experienced dentists</strong> who meet our strict quality standards.</p>
        <div className={styles.cardGrid}>
          <div className={styles.card}>
            <FaCheckCircle className={styles.icon} />
            <h3>Verified Practices</h3>
            <p>We work with licensed and qualified professionals only.</p>
          </div>
          <div className={styles.card}>
            <FaBalanceScale className={styles.icon} />
            <h3>Transparent Pricing</h3>
            <p>No hidden fees—just upfront pricing you can trust.</p>
          </div>
          <div className={styles.card}>
            <FaStar className={styles.icon} />
            <h3>Real Patient Reviews</h3>
            <p>Read honest reviews from verified patients.</p>
          </div>
          <div className={styles.card}>
            <FaLock className={styles.icon} />
            <h3>Secure Booking</h3>
            <p>Book online with confidence and peace of mind.</p>
          </div>
        </div>
      </section>

      <section className={styles.howItWorks}>
        <h2>How Dental Booking Works</h2>
        <p>Using our platform is fast, free, and easy:</p>
        <div className={styles.cardGrid}>
          <div className={styles.card}>
            <FaSearch className={styles.icon} />
            <h3>1. Search</h3>
            <p>Enter your dental treatment and location.</p>
          </div>
          <div className={styles.card}>
            <FaClipboardList className={styles.icon} />
            <h3>2. Compare</h3>
            <p>View prices, reviews, and services from multiple dental practices near you.</p>
          </div>
          <div className={styles.card}>
            <FaCalendarAlt className={styles.icon} />
            <h3>3. Book</h3>
            <p>Choose the best option for you and book your appointment securely online.</p>
          </div>
        </div>
        <p className={styles.note}>We believe in <strong>choice and transparency</strong>. By giving you all the information you need in one place, we save you time and money while ensuring you get top-notch care.</p>
      </section>

      <section className={styles.values}>
        <h2>Our Values</h2>
        <p>At Dental Booking, our values guide everything we do. We're committed to:</p>
        <div className={styles.cardGrid}>
          <div className={styles.card}>
            <FaChartLine className={styles.icon} />
            <h3>Transparency</h3>
            <p>Providing clear, upfront pricing and information about dental services.</p>
          </div>
          <div className={styles.card}>
            <FaHandshake className={styles.icon} />
            <h3>Affordability</h3>
            <p>Helping you find cost-effective options without compromising on quality.</p>
          </div>
          <div className={styles.card}>
            <FaHeartbeat className={styles.icon} />
            <h3>Patient-Centered Care</h3>
            <p>Prioritizing your health and satisfaction throughout your dental journey.</p>
          </div>
        </div>
      </section>

      {/* <section className={styles.whyCompare}>
        <h2>Why Compare Dental Prices?</h2>
        <p>Dental Booking can vary greatly between practices, even within the same city. That's why it's important to <strong>compare prices</strong> to ensure you're getting the best deal. By using <strong>Dental Booking</strong>, you can instantly see how much different dentists charge for treatments such as teeth whitening, fillings, crowns, and more, giving you the power to make <strong>informed decisions</strong> based on your needs and budget.</p>
      </section> */}
      <section className={styles.whyCompare}>
        <h3><FaCommentDollar /> Why compare dental prices?</h3>
        <p>
          At <strong>Dental Booking</strong>, we believe in empowering patients with the <strong>knowledge</strong> they need to make the <strong>best</strong> dental care decisions. Whether you're looking for routine check-ups or advanced treatments, comparing prices is the <strong>smartest way</strong> to ensure you're getting top-quality care at a price that suits your budget. Here's why <strong>comparing dental prices</strong> matters:
        </p>
        <div className={styles.reasonsGrid}>
          <div className={styles.reason}>
            <h4>1. Get the best value for your treatment</h4>
            <p>Dental practices often charge <strong>different prices</strong> for the same treatments. By comparing dental prices, you can find <strong>affordable</strong> options without sacrificing quality. Whether it's teeth whitening, braces, or dental implants, why pay more when you don't have to?</p>
          </div>
          <div className={styles.reason}>
            <h4>2. Transparent pricing for every service</h4>
            <p>We take the guesswork out of dental costs. No hidden fees or surprises—just clear, upfront pricing from verified dental clinics in your area. <strong>Know exactly what you're paying for</strong> before booking your appointment.</p>
          </div>
          <div className={styles.reason}>
            <h4>3. Choose a dentist that suits your needs</h4>
            <p>With <strong>Dental Booking</strong>, you're not just comparing prices. You're also comparing <strong>dentist reviews</strong>, <strong>locations</strong>, and the specific treatments they offer. This way, you can choose a dentist who fits your needs, whether it's based on price, proximity, or patient ratings.</p>
          </div>
          <div className={styles.reason}>
            <h4>4. Make informed decisions</h4>
            <p>Dental care is a significant investment in your health. Our platform ensures you make <strong>informed decisions</strong> by giving you all the information at your fingertips—<strong>prices, reviews, and services</strong>, all in one place.</p>
          </div>
          <div className={styles.reason}>
            <h4>5. Avoid overpaying</h4>
            <p>Don't overpay for treatments like <strong>crowns, fillings, root canals</strong>, and more. With <strong>Dental Booking</strong>, you can instantly see how much different dentists charge and select the one that offers the most competitive pricing.</p>
          </div>
          <div className={styles.reason}>
            <h4>6. Plan your dental care budget</h4>
            <p>By comparing prices across various dental treatments and practices, you can better <strong>plan your dental care budget</strong>. This helps you prioritize treatments, save for more expensive procedures, and make the most of your dental insurance coverage.</p>
          </div>
        </div>
      </section>

      <section className={styles.commitment}>
        <h2>Our Commitment to You</h2>
        <p>At <strong>Dental Booking</strong>, we are committed to making your search for a dentist as easy as possible. Our platform is designed to give you all the tools you need to find the <strong>right dental care at the right price</strong>, without the hassle. Whether you're looking for an affordable <strong>dental check-up</strong>, seeking the best deal on <strong>dental implants</strong>, or comparing options for <strong>cosmetic treatments</strong>, we're here to help.</p>
      </section>

      <section className={styles.contact}>
        <h2>Contact Us</h2>
        <p>Have questions? We're here to help! You can reach our friendly support team by visiting our Contact Page or sending us an email at <strong>support@dentaladvisor.ai</strong>.</p>
      </section>
    </div>
  );
};

export default AboutPage;