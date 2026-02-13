# AI Image Generator

A minimalist AI Image Generator built with React (Vite) and Node.js (Express).

## 🚀 Deployment on Render

This project is configured to be deployed as a single **Web Service** on Render.

### 1. Create a New Web Service
- Connect your GitHub repository to Render.
- Select this repository (`IMAGE-GENERATION`).

### 2. Configuration
- **Environment**: `Node`
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

### 3. Environment Variables
Add the following variable in the Render dashboard:
- `VITE_IMAGE_API_KEY`: `img-sk-8f3a9b2c4d5e6f7a8b9c0d1e2f3a4b5c` (or your actual key)

## Local Development

### 1. Install Dependencies
Run in the root folder:
```bash
npm install-client
npm install-server
```

### 2. Run the App
- **Backend**: `cd server && npm start`
- **Frontend**: `cd client && npm run dev`

Navigate to `http://localhost:5173` to see the app.
