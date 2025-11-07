# 🚴 Bicycle Network - Cycling Social App

A Next.js-based social networking application for cyclists - like Tinder, but for finding cycling partners! Match with riders who share your pace, style, and passion for cycling.

## Features

### 🎯 Core Functionality
- **Swipe Interface** - Tinder-like card swiping to discover cyclists
- **Smart Matching** - Match with riders based on experience and preferences
- **User Profiles** - Detailed cyclist profiles with interests and riding stats
- **Real-time Updates** - Match notifications and instant feedback

### 🚴 Cyclist Features
- Experience levels (Beginner, Intermediate, Advanced, Expert)
- Bike type preferences (Road, Mountain, Hybrid, etc.)
- Distance preferences
- Location-based discovery
- Interest tags and bio

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules
- **API**: Next.js API Routes (Server-side)
- **State Management**: React Hooks

## Project Structure

```
bicycle-network/
├── app/
│   ├── api/                # Backend API routes
│   │   ├── cyclists/       # Cyclist CRUD operations
│   │   │   └── route.ts
│   │   └── matches/        # Match creation and retrieval
│   │       └── route.ts
│   ├── discover/           # Swipe interface page
│   │   ├── page.tsx
│   │   └── page.module.css
│   ├── profile/            # User profile page
│   │   ├── page.tsx
│   │   └── page.module.css
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   ├── page.module.css
│   └── globals.css
├── components/
│   ├── CyclistCard.tsx     # Profile card component
│   └── CyclistCard.module.css
├── lib/                    # Utility functions
├── public/                 # Static assets
├── package.json
├── tsconfig.json
└── next.config.js
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
cd bicycle-network
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Pages

### Home (`/`)
- Landing page with app introduction
- Feature highlights
- Call-to-action buttons

### Discover (`/discover`)
- Swipe through cyclist profiles
- Like or pass on each profile
- Match notifications
- Real-time match counter

### Profile (`/profile`)
- View your cyclist profile
- Stats dashboard (rides, matches, miles)
- Detailed information display
- Edit profile button

## API Endpoints

### Cyclists API (`/api/cyclists`)

**GET** - Retrieve cyclists
```bash
# Get all cyclists
GET /api/cyclists

# Filter by experience
GET /api/cyclists?experience=intermediate

# Filter by location
GET /api/cyclists?location=seattle
```

**POST** - Create new cyclist
```bash
POST /api/cyclists
Content-Type: application/json

{
  "name": "John Rider",
  "age": 28,
  "location": "Seattle, WA",
  "experience": "Intermediate",
  "preferredDistance": "20-40 miles",
  "bikeType": "Road Bike",
  "interests": ["Long rides", "Fitness"],
  "bio": "Love exploring new routes!"
}
```

### Matches API (`/api/matches`)

**GET** - Retrieve matches
```bash
GET /api/matches?userId=1
```

**POST** - Create match/like
```bash
POST /api/matches
Content-Type: application/json

{
  "userId": 1,
  "matchedUserId": 2,
  "action": "like"  // or "pass"
}
```

## Components

### CyclistCard
Displays cyclist profile information in a card format.

**Props:**
- `cyclist` (object): Cyclist data including name, age, location, etc.

**Usage:**
```tsx
import CyclistCard from '@/components/CyclistCard'

<CyclistCard cyclist={cyclistData} />
```

## Features in Detail

### Matching Algorithm
1. User swipes right (like) or left (pass) on cyclist profiles
2. When both users like each other, it's a match!
3. Matches are stored and can be viewed later
4. Real-time notifications when matches occur

### Profile System
- Detailed cyclist profiles with multiple data points
- Experience levels for skill matching
- Distance preferences for compatible ride planning
- Interest tags for hobby alignment

### Filtering & Discovery
- Filter cyclists by experience level
- Location-based filtering
- Smart recommendations based on preferences

## Customization

### Adding New Features

1. **New API Endpoint**
   ```bash
   # Create new route file
   touch app/api/your-feature/route.ts
   ```

2. **New Page**
   ```bash
   # Create new page directory
   mkdir app/your-page
   touch app/your-page/page.tsx
   ```

3. **New Component**
   ```bash
   touch components/YourComponent.tsx
   touch components/YourComponent.module.css
   ```

## Environment Variables

Create a `.env.local` file:
```
NEXT_PUBLIC_APP_NAME=Bicycle Network
NEXT_PUBLIC_API_URL=/api
```

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Docker
```bash
docker build -t bicycle-network .
docker run -p 3000:3000 bicycle-network
```

### Other Platforms
- AWS Amplify
- Netlify
- DigitalOcean App Platform

## Future Enhancements

- [ ] User authentication (NextAuth.js)
- [ ] Real-time chat between matches
- [ ] Route sharing and mapping
- [ ] Event planning for group rides
- [ ] Photo uploads
- [ ] Push notifications
- [ ] Mobile app (React Native)
- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Advanced filtering (skill level, bike type, etc.)
- [ ] User reviews and ratings
- [ ] Integration with Strava/fitness apps

## Testing

```bash
# Run tests (when implemented)
npm test

# Run linting
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Performance Optimization

- Server-side rendering with Next.js
- API routes for efficient data fetching
- CSS Modules for scoped styling
- Optimized images with Next.js Image component
- Code splitting and lazy loading

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Common Issues

**Port already in use**
```bash
# Change port
PORT=3001 npm run dev
```

**Dependencies issues**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Build errors**
```bash
npm run lint
npm run build
```

## License

ISC

## Support

For issues or questions:
- Create an issue on GitHub
- Check the documentation
- Review Next.js documentation

## Acknowledgments

- Built with Next.js 14
- Inspired by modern dating apps
- Designed for the cycling community

---

**Happy Cycling! 🚴‍♀️🚴‍♂️**
