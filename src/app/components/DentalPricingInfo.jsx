import React, { useState } from 'react';
import styles from './DentalPricingInfo.module.scss';
import { FaSearch, FaCommentDollar, FaClipboardList, FaUserMd, FaPoundSign, FaStar, FaBolt, FaCheckCircle, FaTooth } from 'react-icons/fa';
import { MdExpandMore, MdExpandLess } from 'react-icons/md';
import { RiMentalHealthFill } from 'react-icons/ri';
import Image from 'next/image';

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
          <h1>Dental pricing</h1>
        </div>
        <h2>Find the best and most affordable dental treatments near you</h2>
        <p>We help you compare prices and services from the top dental practices in your area. Save time and money by discovering the best deals on dental treatments today!</p>
      </section>

      <section className={styles.whyCompare}>
        <h3><FaCommentDollar /> Why compare dental prices?</h3>
        <p>
          At <strong>Dental Pricing</strong>, we believe in empowering patients with the <strong>knowledge</strong> they need to make the <strong>best</strong> dental care decisions. Whether you're looking for routine check-ups or advanced treatments, comparing prices is the <strong>smartest way</strong> to ensure you're getting top-quality care at a price that suits your budget. Here's why <strong>comparing dental prices</strong> matters:
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
            <p>With <strong>Dental Pricing</strong>, you're not just comparing prices. You're also comparing <strong>dentist reviews</strong>, <strong>locations</strong>, and the specific treatments they offer. This way, you can choose a dentist who fits your needs, whether it's based on price, proximity, or patient ratings.</p>
          </div>
          <div className={styles.reason}>
            <h4>4. Make informed decisions</h4>
            <p>Dental care is a significant investment in your health. Our platform ensures you make <strong>informed decisions</strong> by giving you all the information at your fingertips—<strong>prices, reviews, and services</strong>, all in one place.</p>
          </div>
          <div className={styles.reason}>
            <h4>5. Avoid overpaying</h4>
            <p>Don't overpay for treatments like <strong>crowns, fillings, root canals</strong>, and more. With <strong>Dental Pricing</strong>, you can instantly see how much different dentists charge and select the one that offers the most competitive pricing.</p>
          </div>
          <div className={styles.reason}>
            <h4>6. Plan your dental care budget</h4>
            <p>By comparing prices across various dental treatments and practices, you can better <strong>plan your dental care budget</strong>. This helps you prioritize treatments, save for more expensive procedures, and make the most of your dental insurance coverage.</p>
          </div>
        </div>
      </section>


      <section className={styles.popularTreatments}>
        <h3><FaUserMd /> Popular dental treatments you can compare</h3>
        <div className={styles.treatmentsList}>
          <span>Teeth cleaning & check-ups</span>
          <span>Teeth whitening</span>
          <span>Braces & aligners</span>
          <span>Dental implants</span>
          <span>Root canal treatment</span>
        </div>
      </section>

      <section className={styles.howItWorks}>
        <h3><FaBolt /> How it works</h3>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.imageWrapper}>
              <Image
                src="/1.jpg"
                alt="Search for dental treatments"
                width={300}
                height={200}
                layout="responsive"
              />
            </div>
            <h4>1. Search</h4>
            <p>Enter your treatment type and location</p>
          </div>
          <div className={styles.step}>
            <div className={styles.imageWrapper}>
              <Image
                src="/2.jpg"
                alt="Compare dental prices and services"
                width={300}
                height={200}
                layout="responsive"
              />
            </div>
            <h4>2. Compare</h4>
            <p>Review prices, services, and patient reviews</p>
          </div>
          <div className={styles.step}>
            <div className={styles.imageWrapper}>
              <Image
                src="/3.jpg"
                alt="Book your dental appointment"
                width={30}
                height={20}
                layout="responsive"
              />
            </div>
            <h4>3. Book</h4>
            <p>Choose the best dentist and book your appointment online!</p>
          </div>
        </div>
      </section>

      <section className={styles.topDentists}>
        <h3><FaUserMd /> Top dentists near you</h3>
        <p>We partner with trusted dental professionals across the UK to bring you the best pricing for the services you need. Each practice listed on our site is verified for quality, so you can book with confidence.</p>
        <div className={styles.dentistFeatures}>
          <div className={styles.feature}>
            <FaCheckCircle />
            <span>Verified practices</span>
          </div>
          <div className={styles.feature}>
            <FaStar />
            <span>Quality assured</span>
          </div>
          <div className={styles.feature}>
            <FaPoundSign />
            <span>Competitive pricing</span>
          </div>
        </div>
      </section>

      <section className={styles.whyChooseUs}>
        <h3><FaTooth /> Why choose dental pricing?</h3>
        <div className={styles.reasonsGrid}>
          <div className={styles.reason}>
            <FaPoundSign />
            <p>Save money: Find great deals without compromising quality</p>
          </div>
          <div className={styles.reason}>
            <FaStar />
            <p>Trusted reviews: Hear from real patients</p>
          </div>
          <div className={styles.reason}>
            <FaBolt />
            <p>Fast & easy: Compare prices and book appointments from home</p>
          </div>
        </div>
      </section>

      <section className={styles.faq}>
        <h3>Frequently asked questions (FAQs)</h3>
        <FAQItem 
          question="How much does dental treatment cost in the UK?"
          answer="Dental treatment costs can vary significantly depending on the type of procedure and the dentist's location. Dental Pricing allows you to compare prices for everything from routine check-ups to cosmetic treatments like teeth whitening or braces, helping you find the best price."
        />
        <FAQItem 
          question="Can I find affordable cosmetic dental treatments near me?"
          answer="Yes! Our platform lets you search for affordable cosmetic dental treatments such as teeth whitening, veneers, and smile makeovers. Compare prices from top-rated cosmetic dentists in your area to get the best deal."
        />
        <FAQItem 
          question="How can I find a dentist with the best reviews?"
          answer="At Dental Pricing, we provide patient reviews and ratings alongside pricing information. This helps you find a highly-rated dentist who fits your budget and offers quality care."
        />
        <FAQItem 
          question="What are the cheapest dental implants near me?"
          answer="Dental implants can be costly, but by comparing prices on Dental Pricing, you can find the most affordable dental implants near you. Search for practices offering competitive prices without compromising quality."
        />
        <FAQItem 
          question="Are there flexible payment plans for dental treatments?"
          answer="Many dental practices offer payment plans for treatments like braces, implants, and crowns. By comparing dental clinics on our platform, you can find options that allow you to spread out the cost of your treatment."
        />
        <FAQItem 
          question="How can I book a dentist online through Dental Pricing?"
          answer="Booking a dentist online is simple! Once you've compared prices and selected the best dentist for you, just click 'Book Now' and follow the easy steps to confirm your appointment."
        />
        <FAQItem 
          question="What happens if I need to cancel my dental appointment?"
          answer="Cancellation policies vary between dentists. At Dental Pricing, we display each clinic's cancellation terms so you know what to expect if your plans change."
        />
      </section>
    </div>
  );
};

export default DentalPricingInfo;