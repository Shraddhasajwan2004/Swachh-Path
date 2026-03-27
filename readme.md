# SwachhPath - Smart Waste Management System

SwachhPath is a full-stack web application designed for intelligent waste management. It integrates IoT data from smart bins (via ThingSpeak) with real-time monitoring, AI-driven insights (Gemini), and geospatial visualization (Google Maps) to optimize waste collection processes.

## Key Features

- **Real-time Monitoring:** Track fill levels (wet/dry waste) and status of smart bins.
- **Geospatial Visualization:** View bin locations and status on an interactive map.
- **AI Insights:** Leverage Gemini AI for waste management analysis and recommendations.
- **Command & Control:** Remotely trigger bin operations (e.g., opening lids).
- **Admin Dashboard:** Manage bin configurations and monitor system health.
- **User Panel:** View bin status and report issues.
- **Secure Authentication:** User and Admin roles with MongoDB-backed storage.

## Project Structure

The project is organized into a backend and a frontend directory to maintain a clear separation of concerns.

```text
SWACHH PATH/
├── backend/                # Backend API and Database logic
│   ├── src/
│   │   ├── models/         # MongoDB Mongoose models (BinConfig, User)
│   │   └── index.ts        # Backend entry point
│   ├── .env.example        # Backend environment variables example
│   └── package.json        # Backend dependencies
├── src/                    # Frontend source code
│   ├── api/                # API configuration
│   ├── components/         # Reusable UI components
│   ├── context/            # React Context for state management
│   ├── data/               # Mock data and constants
│   ├── pages/              # Application pages (Dashboard, Auth, etc.)
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Frontend entry point
├── .env                    # Local environment variables
├── package.json            # Root dependencies and scripts
├── server.ts               # Main server entry point (Express + Vite)
└── vite.config.js          # Vite configuration
```

## Technology Stack

### Frontend
- **Framework:** React (Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Visualization:** Chart.js, React-Leaflet
- **State Management:** React Context API

### Backend
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB (via Mongoose)
- **IoT Integration:** ThingSpeak API

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd "SWACHH PATH"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your keys:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   GOOGLE_MAPS_PLATFORM_KEY=your_google_maps_api_key
   PORT=3000
   ```

4. **Run the Application:**
   ```bash
   npm run dev
   ```

## API Endpoints

- `GET /api/bins/live-data`: Fetches real-time data from ThingSpeak.
- `POST /api/bins`: Adds a new bin configuration.
- `DELETE /api/bins/:id`: Removes a bin configuration.
- `POST /api/bins/:binId/command`: Sends a command to a specific bin.
- `POST /api/auth/register`: User registration.
- `POST /api/auth/login`: User login.

