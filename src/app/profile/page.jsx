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
          {/* {profileData.picture ? (
            <img src={profileData.picture} alt={profileData.name} className={styles.profilePicture} />
          ) : (
            <div className={styles.profileInitials}>{profileData.name.charAt(0)}</div>
          )} */}
          <h2 className={styles.heading}>{profileData.name}</h2>
          <p><strong>Email:</strong> {profileData.email}</p>
          <p><strong>User ID:</strong> {profileData.id}</p>
        </div>
        
        <h2 className={styles.heading}>Your Dental Appointments</h2>
        <div className={styles.appointmentsList}>
          {appointments.length > 0 ? (
            appointments.map((appointment, index) => (
              <div key={index} className={styles.appointmentItem}>
                <p><strong>Date:</strong> {appointment.date}</p>
                <p><strong>Time:</strong> {appointment.time}</p>
                <p><Link href={`/clinic/${appointment.clinic}`}><strong>Clinic:</strong> {appointment.clinic}</Link></p>
                <p><strong>Treatment:</strong> {appointment.treatment}</p>
                <p><strong>Price:</strong> ${appointment.price}</p>
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