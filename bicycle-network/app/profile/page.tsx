'use client'

import Link from 'next/link'
import styles from './page.module.css'

export default function ProfilePage() {
  const currentUser = {
    name: 'You',
    age: 30,
    location: 'Your City',
    experience: 'Intermediate',
    preferredDistance: '15-40 miles',
    bikeType: 'Road Bike',
    interests: ['Casual rides', 'Fitness', 'Exploring'],
    bio: 'Passionate cyclist looking to connect with others who love riding!',
    image: '🚴‍♂️'
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.backButton}>← Back</Link>
        <h1 className={styles.title}>Your Profile</h1>
        <div></div>
      </header>

      <main className={styles.main}>
        <div className={styles.profileCard}>
          <div className={styles.avatar}>{currentUser.image}</div>
          <h2 className={styles.name}>{currentUser.name}</h2>
          <p className={styles.location}>📍 {currentUser.location}</p>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>42</span>
              <span className={styles.statLabel}>Rides</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>8</span>
              <span className={styles.statLabel}>Matches</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>234</span>
              <span className={styles.statLabel}>Miles</span>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>About</h3>
            <p className={styles.bio}>{currentUser.bio}</p>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Details</h3>
            <div className={styles.details}>
              <div className={styles.detail}>
                <strong>Age:</strong> {currentUser.age}
              </div>
              <div className={styles.detail}>
                <strong>Experience:</strong> {currentUser.experience}
              </div>
              <div className={styles.detail}>
                <strong>Bike Type:</strong> {currentUser.bikeType}
              </div>
              <div className={styles.detail}>
                <strong>Preferred Distance:</strong> {currentUser.preferredDistance}
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Interests</h3>
            <div className={styles.interests}>
              {currentUser.interests.map((interest, index) => (
                <span key={index} className={styles.interest}>
                  {interest}
                </span>
              ))}
            </div>
          </div>

          <button className={styles.editButton}>Edit Profile</button>
        </div>
      </main>
    </div>
  )
}
