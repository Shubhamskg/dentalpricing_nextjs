import React from 'react';
import styles from './page.module.scss';

const PrivacyPolicyPage = () => {
  return (
    <div className={styles.privacyPage}>
      <h1>Privacy Policy</h1>
      <p>Last updated: 15/09/2023</p>:

      <section>
        <h2>1. Introduction</h2>
        <p>Dental Booking ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website (dentalbooking.co.uk).</p>
      </section>

      <section>
        <h2>2. Information We Collect</h2>
        <p>We may collect personal information that you provide directly to us, such as your name, email address, and location when you register for an account or use our services.</p>
      </section>

      <section>
        <h2>3. How We Use Your Information</h2>
        <p>We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to comply with legal obligations.</p>
      </section>

      <section>
        <h2>4. Data Sharing and Disclosure</h2>
        <p>We do not sell your personal information. We may share your information with third-party service providers who perform services on our behalf, subject to confidentiality agreements.</p>
      </section>

      <section>
        <h2>5. Data Security</h2>
        <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized or unlawful processing, accidental loss, destruction, or damage.</p>
      </section>

      <section>
        <h2>6. Your Rights</h2>
        <p>Under the UK GDPR, you have the right to access, rectify, erase, restrict processing, object to processing, and data portability in relation to your personal data.</p>
      </section>

      <section>
        <h2>7. Cookies</h2>
        <p>We use cookies and similar tracking technologies to track activity on our website and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
      </section>

      <section>
        <h2>8. Changes to This Privacy Policy</h2>
        <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
      </section>

      <section>
        <h2>9. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at support@dentaladvisor.com</p>
      </section>
    </div>
  );
};

export default PrivacyPolicyPage;