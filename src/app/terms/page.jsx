import React from 'react';
import styles from './page.module.scss';

const TermsAndConditionsPage = () => {
  return (
    <div className={styles.termsPage}>
      <h1>Terms and Conditions</h1>
      <p>Last updated:  2023-09-15</p>:

      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using the Dental Booking website (dentalbooking.co.uk), you agree to comply with and be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our website.</p>
      </section>

      <section>
        <h2>2. Use of the Service</h2>
        <p>Dental Booking provides a platform for comparing dental treatment prices across the UK. The information provided is for general informational purposes only and should not be considered as professional medical advice.</p>
      </section>

      <section>
        <h2>3. User Accounts</h2>
        <p>Some features of our service may require you to create an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.</p>
      </section>

      <section>
        <h2>4. Accuracy of Information</h2>
        <p>While we strive to provide accurate and up-to-date information, we cannot guarantee the accuracy, completeness, or timeliness of the pricing data or other information on our website.</p>
      </section>

      <section>
        <h2>5. Intellectual Property</h2>
        <p>All content on this website, including text, graphics, logos, and software, is the property of Dental Booking and is protected by UK and international copyright laws.</p>
      </section>

      <section>
        <h2>6. Limitation of Liability</h2>
        <p>Dental Booking shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising out of your access to, or use of, the website.</p>
      </section>

      <section>
        <h2>7. Changes to Terms</h2>
        <p>We reserve the right to modify these Terms and Conditions at any time. Your continued use of the website after any changes indicates your acceptance of the modified terms.</p>
      </section>

      <section>
        <h2>8. Governing Law</h2>
        <p>These Terms and Conditions shall be governed by and construed in accordance with the laws of the United Kingdom.</p>
      </section>

      <p>If you have any questions about these Terms and Conditions, please contact us at info@dentaladvisor.ai.</p>
    </div>
  );
};

export default TermsAndConditionsPage;