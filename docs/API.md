# API Documentation

REST API documentation for the backend service.

## Base URL

```
Development: http://localhost:3001
Production: https://your-domain.com
```

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Endpoints

### Health Check

Check if the server is running and healthy.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Example:**
```bash
curl http://localhost:3001/health
```

---

## User Management

### Get All Users

Retrieve a list of all users.

**Endpoint:** `GET /api/users`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com"
    }
  ]
}
```

**Example:**
```bash
curl http://localhost:3001/api/users
```

---

### Get User by ID

Retrieve a specific user by their ID.

**Endpoint:** `GET /api/users/:id`

**Parameters:**
- `id` (path parameter) - User ID (integer)

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Response (User Not Found):**
```json
{
  "success": false,
  "error": "User not found"
}
```

**Status Codes:**
- `200 OK` - User found
- `404 Not Found` - User does not exist

**Example:**
```bash
curl http://localhost:3001/api/users/1
```

---

### Create User

Create a new user.

**Endpoint:** `POST /api/users`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Required Fields:**
- `name` (string) - User's full name
- `email` (string) - User's email address

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Response (Missing Fields):**
```json
{
  "success": false,
  "error": "Name and email are required"
}
```

**Status Codes:**
- `201 Created` - User created successfully
- `400 Bad Request` - Missing required fields

**Example:**
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'
```

---

### Update User

Update an existing user's information.

**Endpoint:** `PUT /api/users/:id`

**Parameters:**
- `id` (path parameter) - User ID (integer)

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com"
}
```

**Optional Fields:**
- `name` (string) - User's full name
- `email` (string) - User's email address

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane.doe@example.com"
  }
}
```

**Error Response (User Not Found):**
```json
{
  "success": false,
  "error": "User not found"
}
```

**Status Codes:**
- `200 OK` - User updated successfully
- `404 Not Found` - User does not exist

**Example:**
```bash
curl -X PUT http://localhost:3001/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane.doe@example.com"}'
```

---

### Delete User

Delete a user by their ID.

**Endpoint:** `DELETE /api/users/:id`

**Parameters:**
- `id` (path parameter) - User ID (integer)

**Success Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error Response (User Not Found):**
```json
{
  "success": false,
  "error": "User not found"
}
```

**Status Codes:**
- `200 OK` - User deleted successfully
- `404 Not Found` - User does not exist

**Example:**
```bash
curl -X DELETE http://localhost:3001/api/users/1
```

---

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

### Common Errors

**Invalid JSON:**
```json
{
  "error": "Invalid JSON in request body"
}
```

**Server Error:**
```json
{
  "error": "Something went wrong!"
}
```

---

## Rate Limiting

Currently, there are no rate limits implemented. In production, consider implementing rate limiting to prevent abuse.

**Recommended limits:**
- 100 requests per 15 minutes per IP address
- 1000 requests per hour per authenticated user

---

## CORS

The API has CORS enabled for the following origins:
- `http://localhost:3000` (development)
- Configure production origins in environment variables

---

## Authentication

⚠️ **Not Implemented Yet**

Future versions will include:
- JWT token-based authentication
- OAuth 2.0 integration
- API key authentication

---

## Pagination

⚠️ **Not Implemented Yet**

Future versions will support pagination:

```
GET /api/users?page=1&limit=10
```

Response will include:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## Filtering and Sorting

⚠️ **Not Implemented Yet**

Future versions will support:

**Filtering:**
```
GET /api/users?email=john@example.com
GET /api/users?name=John
```

**Sorting:**
```
GET /api/users?sort=name&order=asc
GET /api/users?sort=createdAt&order=desc
```

---

## Testing the API

### Using cURL

See examples above for each endpoint.

### Using Postman

1. Create a new collection
2. Set base URL: `http://localhost:3001`
3. Add requests for each endpoint
4. Save and test

### Using JavaScript/Fetch

```javascript
// Get all users
fetch('http://localhost:3001/api/users')
  .then(res => res.json())
  .then(data => console.log(data));

// Create user
fetch('http://localhost:3001/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'John', email: 'john@example.com' })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

### Using Axios

```javascript
// Get all users
axios.get('http://localhost:3001/api/users')
  .then(res => console.log(res.data));

// Create user
axios.post('http://localhost:3001/api/users', {
  name: 'John',
  email: 'john@example.com'
})
  .then(res => console.log(res.data));
```

---

## Code Examples

### Frontend Integration

```javascript
// services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data.data;
};

export const createUser = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data.data;
};
```

### Backend Controller

```javascript
// controllers/userController.js
const getAllUsers = (req, res) => {
  try {
    // Business logic here
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

---

## Changelog

### Version 1.0.0 (Current)
- Basic user CRUD operations
- Health check endpoint
- CORS support
- Error handling

### Planned Features
- Authentication & authorization
- Pagination
- Filtering & sorting
- Search functionality
- File upload support
- WebSocket support for real-time updates

---

## Support

For issues or questions:
- Create an issue on GitHub
- Contact the development team
- Check the [main documentation](README.md)

---

## Related Documentation

- [Backend Setup](../backend/README.md)
- [Frontend Setup](../frontend/README.md)
- [Architecture](ARCHITECTURE.md)
- [Quick Start](../QUICKSTART.md)
