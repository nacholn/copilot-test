import styles from './CyclistCard.module.css'

interface Cyclist {
  id: number
  name: string
  age: number
  location: string
  experience: string
  preferredDistance: string
  bikeType: string
  interests: string[]
  bio: string
  image: string
}

interface CyclistCardProps {
  cyclist: Cyclist
}

export default function CyclistCard({ cyclist }: CyclistCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.imageSection}>
        <div className={styles.avatar}>{cyclist.image}</div>
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <h2 className={styles.name}>{cyclist.name}, {cyclist.age}</h2>
          <p className={styles.location}>📍 {cyclist.location}</p>
        </div>

        <div className={styles.details}>
          <div className={styles.badge}>
            🚴 {cyclist.bikeType}
          </div>
          <div className={styles.badge}>
            ⭐ {cyclist.experience}
          </div>
          <div className={styles.badge}>
            📏 {cyclist.preferredDistance}
          </div>
        </div>

        <div className={styles.bio}>
          <p>{cyclist.bio}</p>
        </div>

        <div className={styles.interests}>
          <strong>Interests:</strong>
          <div className={styles.interestTags}>
            {cyclist.interests.map((interest, index) => (
              <span key={index} className={styles.interestTag}>
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
