'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './page.module.css'
import CyclistCard from '@/components/CyclistCard'

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

export default function DiscoverPage() {
  const [cyclists, setCyclists] = useState<Cyclist[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [matches, setMatches] = useState(0)

  useEffect(() => {
    fetchCyclists()
  }, [])

  const fetchCyclists = async () => {
    try {
      const response = await fetch('/api/cyclists')
      const data = await response.json()
      if (data.success) {
        setCyclists(data.data)
      }
    } catch (error) {
      console.error('Error fetching cyclists:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSwipe = async (action: 'like' | 'pass') => {
    if (currentIndex >= cyclists.length) return

    if (action === 'like') {
      try {
        const response = await fetch('/api/matches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 1, // Mock current user ID
            matchedUserId: cyclists[currentIndex].id,
            action: 'like'
          })
        })
        const data = await response.json()
        if (data.success && data.isMatch) {
          setMatches(prev => prev + 1)
          alert(`🎉 It's a match with ${cyclists[currentIndex].name}!`)
        }
      } catch (error) {
        console.error('Error creating match:', error)
      }
    }

    setCurrentIndex(prev => prev + 1)
  }

  const currentCyclist = cyclists[currentIndex]

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading cyclists...</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.backButton}>← Back</Link>
        <h1 className={styles.title}>Discover Cyclists</h1>
        <div className={styles.matchCounter}>💚 {matches} Matches</div>
      </header>

      <main className={styles.main}>
        {currentCyclist ? (
          <div className={styles.cardContainer}>
            <CyclistCard cyclist={currentCyclist} />
            <div className={styles.actions}>
              <button 
                className={styles.passButton}
                onClick={() => handleSwipe('pass')}
                aria-label="Pass"
              >
                ✕
              </button>
              <button 
                className={styles.likeButton}
                onClick={() => handleSwipe('like')}
                aria-label="Like"
              >
                💚
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.empty}>
            <h2>No more cyclists to discover</h2>
            <p>Check back later for more riding partners!</p>
            <Link href="/" className={styles.homeButton}>
              Go Home
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
