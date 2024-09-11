"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.scss';
import Link from 'next/link';
import { RegisterLink, LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

export default function Home() {
  const { user, isLoading } = useKindeBrowserClient();
  const router = useRouter();

  useEffect(() => {
    // if (!isLoading && user) {
    if(true){
      router.push('/price');
    }
  // }, [isLoading, user, router]);
  },[]);

  // if (isLoading) {
  //   return <div>Loading...</div>;
  // }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Dental Pricing</h1>
          <p className={styles.subtitle}>Compare Private Dental Treatment Prices Across the UK</p>
          <div className={styles.authButtons}>
            <LoginLink className={styles.authButton}>Sign in</LoginLink>
            <RegisterLink className={styles.authButton}>Sign up</RegisterLink>
          </div>
        </div>
      </header>

      <main className={styles.main}>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Welcome to Dental Pricing</h2>
          <p className={styles.paragraph}>We've collected pricing data from 95% of private dental clinics in the UK, allowing both dentists and patients to compare treatment prices across the country as of 2024.</p>
          <ul className={styles.list}>
            <li>Comprehensive pricing data from 95% of UK private dental clinics</li>
            <li>Prices for over 100 categories of treatments, including composite posterior fillings, implant placements, and more</li>
            <li>Over 5,000 patients have already used our service</li>
            <li>200 dentists are paid subscribers, benefiting from nationwide price comparisons</li>
            <li>Compare prices for a wide range of private dental treatments</li>
            <li>Make informed decisions about dental care and pricing</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>For Patients</h2>
          <p className={styles.paragraph}>Access comprehensive pricing information from 95% of private dental clinics across the UK. Compare prices for over 100 treatment categories, including:</p>
          <ul className={styles.list}>
            <li>Composite posterior fillings</li>
            <li>Implant placements</li>
            <li>Root canal treatments</li>
            <li>Crowns and bridges</li>
            <li>And many more...</li>
          </ul>
          <p className={styles.paragraph}>Find the best value and make informed decisions about your oral health care.</p>
          <RegisterLink className={styles.ctaButton}>Compare Prices Now</RegisterLink>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>For Dentists</h2>
          <p className={styles.paragraph}>Join our network of 200 dentists who have already subscribed to our premium services. Gain a competitive edge with our nationwide pricing data:</p>
          <ul className={styles.list}>
            <li>Compare your prices with those from across the country</li>
            <li>Access pricing data for over 100 treatment categories</li>
            <li>Understand market trends and pricing strategies in different regions</li>
            <li>Set competitive rates based on national pricing insights</li>
            <li>Attract new patients with informed, market-competitive pricing</li>
          </ul>
          <p className={styles.paragraph}>Stay ahead in the dental market with comprehensive, nationwide pricing intelligence.</p>
          <RegisterLink className={styles.ctaButton}>Subscribe Now</RegisterLink>
        </section>
        </main>

<footer className={styles.footer}>
  <p>&copy; 2024 Dental Pricing. All rights reserved.</p>
</footer>
</div>
);
}