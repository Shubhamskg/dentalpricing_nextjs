"use client"

import { useState, useEffect } from 'react';
import styles from './page.module.scss';

export default function Billing() {
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [nextPayment, setNextPayment] = useState(null);

  useEffect(() => {
    // Simulating API call to get payment history and next payment date
    const fetchPaymentData = async () => {
      // Replace this with actual API call
      const mockPaymentHistory = [
        { date: '2024-07-01', amount: '£19.99', status: 'Paid' },
        { date: '2024-06-01', amount: '£19.99', status: 'Paid' },
        { date: '2024-05-01', amount: '£19.99', status: 'Paid' },
      ];
      const mockNextPayment = { date: '2024-08-01', amount: '£19.99' };

      setPaymentHistory(mockPaymentHistory);
      setNextPayment(mockNextPayment);
    };

    fetchPaymentData();
  }, []);

  return (
    <div className={styles.billingContainer}>
      <h1>Billing</h1>
      
      <section className={styles.nextPayment}>
        <h2>Next Payment</h2>
        {nextPayment ? (
          <p>Your next payment of {nextPayment.amount} is due on {nextPayment.date}</p>
        ) : (
          <p>No upcoming payments</p>
        )}
      </section>

      <section className={styles.paymentHistory}>
        <h2>Payment History</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {paymentHistory.map((payment, index) => (
              <tr key={index}>
                <td>{payment.date}</td>
                <td>{payment.amount}</td>
                <td>{payment.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}