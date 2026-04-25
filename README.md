# Mkulima Smart 🌽

AI-powered market negotiator for Kenyan farmers.

## Problem Statement

Many farmers still struggle with:
- Unreliable market information
- Limited access to timely agricultural advice
- Poor decision-making on crop planning and sales
- Lack of accessible digital farming tools
- Difficulty understanding modern agricultural systems

Mkulima Smart addresses these challenges by offering a smart, accessible, and easy-to-use platform for farmers.

## Project Overview

Mkulima Smart aims to bridge the gap between farmers and reliable agricultural information by providing:
- Smart farming support
- Agricultural market insights
- Farmer-friendly digital tools
- Easy access to practical crop information
- A modern web experience for agricultural innovation

This project is designed with the goal of improving productivity, reducing uncertainty, and helping farmers make informed decisions in a simple and accessible way.

## Features
- **Smart Negotiation**: Get fair price estimates and tips using Gemini AI.
- **Language Support**: Code-switch between Sheng and English.
- **Market Outlook**: Real-time analysis of crop trends in Kenya.
- **History Tracking**: Securely save all your negotiations in Firestore.
- **Google Auth**: Simple login for farmers.

## Technology Stack
- **Frontend**: React (Vite), Tailwind CSS, Motion.
- **Backend**: Node.js (Express), Gemini API.
- **Database/Auth**: Firebase Firestore & Authentication.
- **Deployment**: Google Cloud Run or Vercel.

## Setup Instructions

### Prerequisites
- Node.js 20+
- Firebase Project
- Gemini API Key

### Local Development
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env`:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_api_key_here
   VITE_FIREBASE_PROJECT_ID=your_api_key_here
   VITE_FIREBASE_STORAGE_BUCKET=your_api_key_here
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_api_key_here
   VITE_FIREBASE_APP_ID=your_api_key_here
   VITE_FIREBASE_FIRESTORE_DATABASE_ID=your_api_key_here
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

### Deployment to Cloud Run
1. Build the Docker image:
   ```bash
   docker build -t gcr.io/[PROJECT_ID]/mkulima-smart .
   ```
2. Push to Container Registry:
   ```bash
   docker push gcr.io/[PROJECT_ID]/mkulima-smart
   ```
3. Deploy to Cloud Run:
   ```bash
   gcloud run deploy mkulima-smart --image gcr.io/[PROJECT_ID]/mkulima-smart --platform managed
   ```

## License
Apache-2.0
