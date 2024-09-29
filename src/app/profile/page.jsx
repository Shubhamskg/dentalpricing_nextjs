"use client"
import { useState, useEffect } from 'react';
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import styles from './page.module.scss';
import Link from 'next/link';

export default function Profile() {
  const { user, isLoading } = useKindeBrowserClient();
  const [profileData, setProfileData] = useState(null);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: `${user.given_name} ${user.family_name}`,
        email: user.email,
        id: user.id,
        picture: user.picture
      });
      fetchAppointments(user.email);
    }
  }, [user]);

  const fetchAppointments = async (email) => {
    try {
      const response = await fetch(`/api/appointmentData?email=${email}`);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      } else {
        console.error('Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  if (isLoading) return <div className={styles.loadingSpinner}></div>;
  if (!profileData) return <div className={styles.profileContainer}>No profile data available</div>;

  return (
    <div className={styles.profilePage}>
      <div className={styles.profileContainer}>
        <div className={styles.profileInfo}>
          <h2 className={styles.heading}>{profileData.name}</h2>
          <p><strong>Email:</strong> {profileData.email}</p>
          <p><strong>User ID:</strong> {profileData.id}</p>
        </div>
        
        <h2 className={styles.heading}>Your Dental Appointments</h2>
        <div className={styles.appointmentsList}>
          {appointments.length > 0 ? (
            appointments.map((appointment, index) => (
              <div key={index} className={styles.appointmentItem}>
                <p><strong>_id:</strong> {appointment._id}</p>
                <p><strong>name:</strong> {appointment.name}</p>
                <p><strong>email:</strong> {appointment.email}</p>
                <p><strong>phone:</strong> {appointment.phone}</p>
                <p><strong>preferredDate:</strong> {appointment.preferredDate}</p>
                <p><strong>preferredTimeSlot:</strong> {appointment.preferredTimeSlot}</p>
                <p><strong>alternativeDate:</strong> {appointment.alternativeDate}</p>
                <p><strong>alternativeTimeSlot:</strong> {appointment.alternativeTimeSlot}</p>
                <p><strong>issue:</strong> {appointment.issue}</p>
                <p><strong>clinic:</strong> {appointment.clinic}</p>
                <p><strong>treatment:</strong> {appointment.treatment}</p>
                <p><strong>price:</strong> {appointment.price}</p>
                <p><strong>createdAt:</strong> {appointment.createdAt}</p>
                <p><strong>paymentStatus:</strong> {appointment.paymentStatus}</p>
                <p><strong>paymentIntentId:</strong> {appointment.paymentIntentId}</p>
                <p><strong>depositAmount:</strong> {appointment.depositAmount}</p>
                <p><strong>updatedAt:</strong> {appointment.updatedAt}</p>
              </div>
            ))
          ) : (
            <p>No appointments scheduled.</p>
          )}
        </div>
      </div>
    </div>
  );
}