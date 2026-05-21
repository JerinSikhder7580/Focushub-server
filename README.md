# FocusHub Server

Backend API server for the FocusHub assignment. This server manages workspace rooms, users, and room bookings with MongoDB, Express, and JWT-protected booking actions.

## Live Server

Add your deployed server URL here:

```text
https://your-vercel-deployment-url.vercel.app
```

## Features

- Express REST API for rooms, users, and bookings
- MongoDB database integration
- Room filtering by name, amenities, price range, and owner email
- JWT verification using the client application's JWKS endpoint
- Protected booking create and update routes
- Booking conflict check for same date and start time
- Vercel deployment configuration

## Technologies Used

- Node.js
- Express.js
- MongoDB
- CORS
- dotenv
- jose
- Vercel

## Environment Variables

Create a `.env` file in the project root and add the following values:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:3000
```

`CLIENT_URL` should point to the frontend application that exposes the JWKS endpoint at `/api/auth/jwks`.

## Installation

1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

3. Create the `.env` file with the required environment variables.
4. Start the server:

```bash
node index.js
```

The server will run on the port configured in `.env`.

## API Endpoints

### Health Check

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/` | Check whether the server is running |

### Rooms

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/rooms` | Get all rooms |
| GET | `/rooms?roomName=value` | Search rooms by room name |
| GET | `/rooms?amenities=value` | Filter rooms by amenity |
| GET | `/rooms?min=100&max=500` | Filter rooms by hourly rate range |
| GET | `/rooms?userEmail=value` | Get rooms added by a specific user |
| GET | `/room/:id` | Get a single room by ID |
| POST | `/rooms` | Add a new room |
| DELETE | `/room/:id` | Delete a room by ID |

### Users

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/user?email=value` | Get a user by email |

### Bookings

| Method | Endpoint | Description | Protected |
| --- | --- | --- | --- |
| GET | `/booking/:id` | Get bookings by user ID | No |
| POST | `/booking` | Create a booking | Yes |
| PATCH | `/booking` | Update room data for booking flow | Yes |
| DELETE | `/booking/:id` | Delete a booking by ID | No |

Protected routes require an authorization header:

```http
Authorization: Bearer your_jwt_token
```

## Database Collections

The server uses the `focushub` database with these collections:

- `rooms`
- `user`
- `booking`
- `focushub`

## Deployment

This project includes a `vercel.json` file for Vercel deployment. Before deploying, add the required environment variables in the Vercel project settings:

- `MONGODB_URI`
- `CLIENT_URL`
- `PORT`

## Project Structure

```text
focus-hub-server/
+-- index.js
+-- package.json
+-- package-lock.json
+-- vercel.json
+-- .gitignore
+-- README.md
```

## Author

Assignment project for Programming Hero Milestone 9.
