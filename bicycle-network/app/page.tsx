import Link from 'next/link'
import styles from './page.module.css'

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <h1 className={styles.title}>🚴 Bicycle Network</h1>
        <p className={styles.tagline}>Find Your Perfect Cycling Partner</p>
        <p className={styles.description}>
          Connect with cyclists in your area. Swipe through profiles, match with riders who share your pace and style, and plan your next adventure together!
        </p>
        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.icon}>👥</span>
            <h3>Match with Cyclists</h3>
            <p>Swipe right on riders you want to connect with</p>
          </div>
          <div className={styles.feature}>
            <span className={styles.icon}>🗺️</span>
            <h3>Discover Routes</h3>
            <p>Share and explore cycling routes in your area</p>
          </div>
          <div className={styles.feature}>
            <span className={styles.icon}>💬</span>
            <h3>Plan Rides</h3>
            <p>Chat with matches and organize group rides</p>
          </div>
        </div>
        <div className={styles.actions}>
          <Link href="/discover" className={styles.primaryButton}>
            Start Discovering
          </Link>
          <Link href="/profile" className={styles.secondaryButton}>
            View Profile
          </Link>
        </div>
      </div>
    </main>
  )
}
