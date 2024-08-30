"use client"
import styles from './page.module.scss';
import Link from 'next/link';
import {RegisterLink, LoginLink} from "@kinde-oss/kinde-auth-nextjs/components";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation'





export default function Home() {
  const { user } = useKindeBrowserClient();
  useEffect(()=>{
    if(user){
      console.log("user",user)
      redirect('/price')
    }
  })
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Dental Pricing</h1>
          <p className={styles.subtitle}>Compare Private Dental Treatment Prices Across the UK</p>
          <div className={styles.authButtons}>
            {/* <Link href="/signup" className={styles.authButton}>Sign Up</Link>
            <Link href="/login" className={styles.authButton}>Login</Link> */}
            <LoginLink className={styles.authButton}>Sign in</LoginLink>
            <RegisterLink className={styles.authButton}>Sign up</RegisterLink>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Welcome to DentalPricing.co.uk</h2>
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
          <Link href="/signup" className={styles.ctaButton}>Compare Prices Now</Link>
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
          <Link href="#signup" className={styles.ctaButton}>Subscribe Now</Link>
        </section>

        {/* <section id="signup" className={styles.section}>
          <h2 className={styles.sectionTitle}>Sign Up</h2>
          <form className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="user-type">I am a:</label>
              <select id="user-type" name="user-type" required>
                <option value="">Select one</option>
                <option value="patient">Patient</option>
                <option value="dentist">Dentist</option>
              </select>
            </div>
            <button type="submit" className={styles.submitButton}>Sign Up</button>
          </form>
        </section> */}
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2024 DentalPricing.co.uk. All rights reserved.</p>
      </footer>
    </div>
  );
}