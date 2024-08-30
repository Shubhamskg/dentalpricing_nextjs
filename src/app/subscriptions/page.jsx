"use client"

import { useState } from 'react';
import styles from './page.module.scss';

export default function Subscription() {
  const [currentPlan, setCurrentPlan] = useState('basic');

  const plans = [
    { name: 'Basic', price: '£9.99', features: ['Access to basic pricing data', 'Monthly updates'] },
    { name: 'Pro', price: '£19.99', features: ['Access to all pricing data', 'Weekly updates', 'Price trend analysis'] },
    { name: 'Enterprise', price: '£49.99', features: ['All Pro features', 'API access', 'Custom reports'] },
  ];

  const handleUpgrade = (planName) => {
    // Here you would integrate with your payment system
    console.log(`Upgrading to ${planName} plan`);
    setCurrentPlan(planName.toLowerCase());
  };

  return (
    <div className={styles.subscriptionContainer}>
      <h1>Subscription</h1>
      <p>Current Plan: {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</p>
      <div className={styles.plansList}>
        {plans.map((plan) => (
          <div key={plan.name} className={styles.planCard}>
            <h2>{plan.name}</h2>
            <p className={styles.price}>{plan.price}/month</p>
            <ul>
              {plan.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            <button 
              onClick={() => handleUpgrade(plan.name)}
              disabled={currentPlan === plan.name.toLowerCase()}
            >
              {currentPlan === plan.name.toLowerCase() ? 'Current Plan' : 'Upgrade'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}