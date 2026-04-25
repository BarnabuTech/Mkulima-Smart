# Mkulima Smart 🌽

AI-powered market negotiator for Kenyan farmers.

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
- **Deployment**: Google Cloud Run.

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
   GEMINI_API_KEY=your_api_key_here
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
