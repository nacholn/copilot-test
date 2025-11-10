export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Cyclists Social Network - Backend API</h1>
      <p>API server running on port 3001</p>
      <h2>Available Endpoints:</h2>
      <ul>
        <li>
          <strong>POST /api/auth/register</strong> - Register a new user
        </li>
        <li>
          <strong>POST /api/auth/login</strong> - Login user
        </li>
        <li>
          <strong>POST /api/auth/recover</strong> - Recover password
        </li>
        <li>
          <strong>GET /api/profile?userId=...</strong> - Get user profile
        </li>
        <li>
          <strong>PATCH /api/profile?userId=...</strong> - Update user profile
        </li>
      </ul>
    </main>
  );
}
