import { NextRequest, NextResponse } from 'next/server'

// Mock data store for matches
let matches = [
  {
    id: 1,
    userId: 1,
    matchedUserId: 2,
    status: 'matched',
    matchedAt: new Date().toISOString()
  },
  {
    id: 2,
    userId: 1,
    matchedUserId: 3,
    status: 'matched',
    matchedAt: new Date().toISOString()
  }
]

let nextMatchId = 3

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'userId is required' },
      { status: 400 }
    )
  }

  const userMatches = matches.filter(
    m => m.userId === parseInt(userId) && m.status === 'matched'
  )

  return NextResponse.json({
    success: true,
    data: userMatches,
    count: userMatches.length
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, matchedUserId, action } = body

    if (!userId || !matchedUserId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (action === 'like') {
      // Check if the other user also liked this user (mutual match)
      const mutualMatch = matches.find(
        m => m.userId === matchedUserId && m.matchedUserId === userId && m.status === 'pending'
      )

      if (mutualMatch) {
        // It's a match!
        mutualMatch.status = 'matched'
        mutualMatch.matchedAt = new Date().toISOString()

        const newMatch = {
          id: nextMatchId++,
          userId,
          matchedUserId,
          status: 'matched',
          matchedAt: new Date().toISOString()
        }
        matches.push(newMatch)

        return NextResponse.json(
          { success: true, data: newMatch, isMatch: true },
          { status: 201 }
        )
      } else {
        // Just a like, waiting for the other user
        const newMatch = {
          id: nextMatchId++,
          userId,
          matchedUserId,
          status: 'pending',
          matchedAt: null
        }
        matches.push(newMatch)

        return NextResponse.json(
          { success: true, data: newMatch, isMatch: false },
          { status: 201 }
        )
      }
    } else if (action === 'pass') {
      return NextResponse.json(
        { success: true, message: 'Passed on user' },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request data' },
      { status: 400 }
    )
  }
}
