"use client"

import { useState } from 'react';
import styles from './page.module.scss';

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');

  const handleNotificationChange = () => {
    setNotifications(!notifications);
  };

  const handleDarkModeChange = () => {
    setDarkMode(!darkMode);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  return (
    <div className={styles.settingsContainer}>
      <h1>Settings</h1>
      <div className={styles.settingItem}>
        <label>
          <input
            type="checkbox"
            checked={notifications}
            onChange={handleNotificationChange}
          />
          Enable Notifications
        </label>
      </div>
      <div className={styles.settingItem}>
        <label>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={handleDarkModeChange}
          />
          Dark Mode
        </label>
      </div>
      <div className={styles.settingItem}>
        <label>
          Language:
          <select value={language} onChange={handleLanguageChange}>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </label>
      </div>
      <button className={styles.saveButton}>Save Settings</button>
    </div>
  );
}