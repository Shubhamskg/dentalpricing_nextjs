import React, { useState } from 'react';
import styles from './DentalPricingInfo.module.scss';
import { FaSearch, FaCommentDollar, FaClipboardList, FaUserMd, FaPoundSign, FaStar, FaBolt, FaCheckCircle,FaTooth } from 'react-icons/fa';
import { MdExpandMore, MdExpandLess } from 'react-icons/md';
import { RiMentalHealthFill } from 'react-icons/ri';

const FAQItem = ({ question, answer }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={styles.faqItem}>
      <div className={styles.faqQuestion} onClick={() => setIsExpanded(!isExpanded)}>
        <h4>{question}</h4>
        {isExpanded ? <MdExpandLess /> : <MdExpandMore />}
      </div>
      {isExpanded && <p className={styles.faqAnswer}>{answer}</p>}
    </div>
  );
};

const DentalPricingInfo = () => {
  return (
    <div className={styles.dentalPricingInfo}>
      <section className={styles.hero}>
        <div className={styles.logoContainer}>
          <RiMentalHealthFill className={styles.logo} />
          <h1>Dental Pricing</h1>
        </div>
        <h2>Find the Best and Most Affordable Dental Treatments Near You</h2>
        <p>We help you compare prices and services from the top dental practices in your area. Save time and money by discovering the best deals on dental treatments today!</p>
      </section>

      <section className={styles.whyCompare}>
        <h3><FaCommentDollar /> Why Compare Dental Prices?</h3>
        <div className={styles.reasonsGrid}>
          <div className={styles.reason}>
            <FaSearch />
            <p>Compare prices from multiple dentists near you</p>
          </div>
          <div className={styles.reason}>
            <FaStar />
            <p>Read reviews and ratings from real patients</p>
          </div>
          <div className={styles.reason}>
            <FaClipboardList />
            <p>Explore services to ensure you're getting exactly what you need at the best price</p>
          </div>
        </div>
      </section>

      <section className={styles.popularTreatments}>
        <h3><FaUserMd /> Popular Dental Treatments You Can Compare</h3>
        <div className={styles.treatmentsList}>
          <span>Teeth Cleaning & Check-Ups</span>
          <span>Teeth Whitening</span>
          <span>Braces & Aligners</span>
          <span>Dental Implants</span>
          <span>Root Canal Treatment</span>
        </div>
      </section>

      <section className={styles.howItWorks}>
        <h3><FaBolt /> How It Works</h3>
        <ol>
          <li className={styles.list}><strong>Search: </strong> Enter your treatment type and location</li>
          <li className={styles.list}><strong>Compare: </strong> Review prices, services, and patient reviews</li>
          <li className={styles.list}><strong>Book: </strong> Choose the best dentist and book your appointment online!</li>
        </ol>
      </section>

      <section className={styles.topDentists}>
        <h3><FaUserMd /> Top Dentists Near You</h3>
        <p>We partner with trusted dental professionals across the UK to bring you the best pricing for the services you need. Each practice listed on our site is verified for quality, so you can book with confidence.</p>
        <div className={styles.dentistFeatures}>
          <div className={styles.feature}>
            <FaCheckCircle />
            <span>Verified Practices</span>
          </div>
          <div className={styles.feature}>
            <FaStar />
            <span>Quality Assured</span>
          </div>
          <div className={styles.feature}>
            <FaPoundSign />
            <span>Competitive Pricing</span>
          </div>
        </div>
      </section>

      <section className={styles.whyChooseUs}>
        <h3><FaTooth /> Why Choose Dental Pricing?</h3>
        <div className={styles.reasonsGrid}>
          <div className={styles.reason}>
            <FaPoundSign />
            <p>Save Money: Find great deals without compromising quality</p>
          </div>
          <div className={styles.reason}>
            <FaStar />
            <p>Trusted Reviews: Hear from real patients</p>
          </div>
          <div className={styles.reason}>
            <FaBolt />
            <p>Fast & Easy: Compare prices and book appointments from home</p>
          </div>
        </div>
      </section>

      <section className={styles.faq}>
        <h3>Frequently Asked Questions (FAQs)</h3>
        <FAQItem 
          question="How do I know if a dentist is trustworthy?"
          answer="All dentists listed on Dental Pricing are verified and reviewed by real patients, so you can feel confident in choosing a provider."
        />
        <FAQItem 
          question="Can I see pricing for specific treatments?"
          answer="Yes! Our platform allows you to search for specific treatments like teeth whitening, braces, or implants, and compare prices across multiple dentists in your area."
        />
        <FAQItem 
          question="Do prices vary a lot between dental practices?"
          answer="Yes, prices can vary significantly depending on location, clinic reputation, and the type of treatment. Dental Pricing helps you find the most competitive pricing options without sacrificing quality."
        />
        <FAQItem 
          question="How can I book an appointment?"
          answer="Once you've compared your options, simply click 'Book Now' to schedule an appointment with the dentist of your choice."
        />
      </section>
    </div>
  );
};

export default DentalPricingInfo;