"use client"

import { useState, useEffect } from 'react';
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import styles from './page.module.scss';
import Loading from '../components/Loading';

export default function Profile() {
  const { user, isLoading } = useKindeBrowserClient();
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: `${user.given_name} ${user.family_name}`,
        email: user.email,
        id: user.id,
        picture: user.picture
      });
    }
  }, [user]);

  if (isLoading) return <Loading/>;

  if (!profileData) return <div>No profile data available</div>;

  return (
    <div className={styles.profileContainer}>
      <h1>User Profile</h1>
      <div className={styles.profileInfo}>
        {profileData.picture ? (
          <img src={profileData.picture} alt={profileData.name} className={styles.profilePicture} />
        ) : (
          <div className={styles.profileInitials}>{profileData.name.charAt(0)}</div>
        )}
        <p><strong>Name:</strong> {profileData.name}</p>
        <p><strong>Email:</strong> {profileData.email}</p>
        <p><strong>User ID:</strong> {profileData.id}</p>
      </div>
    </div>
  );
}