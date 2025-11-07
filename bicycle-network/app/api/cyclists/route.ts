import { NextRequest, NextResponse } from 'next/server'

// Mock data store for cyclists
let cyclists = [
  {
    id: 1,
    name: 'Alex Rider',
    age: 28,
    location: 'San Francisco, CA',
    experience: 'Advanced',
    preferredDistance: '20-50 miles',
    bikeType: 'Road Bike',
    interests: ['Long rides', 'Hill climbing', 'Weekend adventures'],
    bio: 'Love exploring new routes and pushing my limits. Looking for riding partners who enjoy challenging climbs!',
    image: '🚴‍♂️'
  },
  {
    id: 2,
    name: 'Sarah Mountain',
    age: 32,
    location: 'Portland, OR',
    experience: 'Intermediate',
    preferredDistance: '10-30 miles',
    bikeType: 'Mountain Bike',
    interests: ['Trail riding', 'Nature', 'Photography'],
    bio: 'Passionate about mountain biking and capturing beautiful moments on the trail.',
    image: '🚵‍♀️'
  },
  {
    id: 3,
    name: 'Mike Speedster',
    age: 25,
    location: 'Austin, TX',
    experience: 'Expert',
    preferredDistance: '30-70 miles',
    bikeType: 'Road Bike',
    interests: ['Racing', 'Speed', 'Training'],
    bio: 'Competitive cyclist training for races. Always up for fast-paced rides!',
    image: '🚴'
  },
  {
    id: 4,
    name: 'Emma Cruiser',
    age: 29,
    location: 'Seattle, WA',
    experience: 'Beginner',
    preferredDistance: '5-15 miles',
    bikeType: 'Hybrid',
    interests: ['Casual rides', 'City exploring', 'Coffee stops'],
    bio: 'New to cycling and looking for friendly riders to explore the city with!',
    image: '🚲'
  }
]

let nextCyclistId = 5

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const experience = searchParams.get('experience')
  const location = searchParams.get('location')

  let filteredCyclists = [...cyclists]

  if (experience) {
    filteredCyclists = filteredCyclists.filter(
      c => c.experience.toLowerCase() === experience.toLowerCase()
    )
  }

  if (location) {
    filteredCyclists = filteredCyclists.filter(
      c => c.location.toLowerCase().includes(location.toLowerCase())
    )
  }

  return NextResponse.json({
    success: true,
    data: filteredCyclists,
    count: filteredCyclists.length
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, age, location, experience, preferredDistance, bikeType, interests, bio } = body

    if (!name || !age || !location || !experience) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const newCyclist = {
      id: nextCyclistId++,
      name,
      age,
      location,
      experience,
      preferredDistance: preferredDistance || 'Not specified',
      bikeType: bikeType || 'Not specified',
      interests: interests || [],
      bio: bio || '',
      image: '🚴'
    }

    cyclists.push(newCyclist)

    return NextResponse.json(
      { success: true, data: newCyclist },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request data' },
      { status: 400 }
    )
  }
}
