# LifeBalance AI - Work-Life Balance Analyzer

AI-powered work-life balance analysis using Google Calendar data and Claude AI insights.

## 🚀 Features

- **Google Calendar Integration** - Secure OAuth 2.0 connection to analyze your calendar
- **AI-Powered Analysis** - Claude AI provides personalized insights about your schedule
- **Work-Life Balance Scoring** - Get quantified metrics on your balance
- **Personalized Recommendations** - Actionable advice based on your patterns
- **Beautiful Dashboard** - Modern, responsive interface with data visualizations
- **Privacy First** - Your data is processed securely and never stored permanently

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Tailwind CSS
- Lucide React Icons
- Recharts for data visualization

**Backend:**
- Node.js + Express
- Google Calendar API
- Anthropic Claude API
- Express Sessions

## 📋 Prerequisites

- Node.js 18+ installed
- Google Cloud Platform account
- Anthropic API account
- Git

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/lifebalance-ai.git
cd lifebalance-ai
```

### 2. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client && npm install && cd ..
```

### 3. Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Calendar API
4. Go to "Credentials" and create OAuth 2.0 Client IDs
5. Set authorized redirect URIs:
   - `http://localhost:3001/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)

### 4. Anthropic API Setup

1. Sign up at [Anthropic](https://www.anthropic.com/)
2. Get your API key from the dashboard
3. Make sure you have sufficient credits

### 5. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Copy the example and fill in your values
cp .env.example .env
```

Fill in your environment variables:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback

# Anthropic Claude API
ANTHROPIC_API_KEY=your_claude_api_key_here

# Session Configuration
SESSION_SECRET=your_super_secret_session_key_here

# Application URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001

# Environment
NODE_ENV=development
PORT=3001
```

### 6. Start the Application

```bash
# Start both frontend and backend
npm run dev-full

# Or start them separately:
# Backend: npm run dev
# Frontend: npm run client
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 🔒 Google Calendar Permissions

The app requests the following permissions:
- `calendar.readonly` - Read access to calendar events
- `userinfo.email` - Access to user email for authentication

## 📱 Usage

1. **Landing Page** - Learn about the features and benefits
2. **Connect Calendar** - Authorize Google Calendar access via OAuth
3. **Analysis** - Watch as Claude AI analyzes your calendar patterns
4. **Results** - View your personalized work-life balance report
5. **Recommendations** - Get actionable insights to improve your balance

## 🏗️ Project Structure

```
lifebalance-ai/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   └── index.js       # App entry point
│   ├── package.json
│   └── tailwind.config.js
├── server.js              # Express backend
├── package.json
├── .env.example
└── README.md
```

## 🚀 Deployment

### Heroku Deployment

1. Create a Heroku app:
```bash
heroku create your-app-name
```

2. Set environment variables:
```bash
heroku config:set GOOGLE_CLIENT_ID=your_client_id
heroku config:set GOOGLE_CLIENT_SECRET=your_client_secret
heroku config:set ANTHROPIC_API_KEY=your_claude_key
heroku config:set SESSION_SECRET=your_session_secret
heroku config:set NODE_ENV=production
```

3. Update redirect URI in Google Cloud Console:
```
https://your-app-name.herokuapp.com/api/auth/google/callback
```

4. Deploy:
```bash
git push heroku main
```

### Vercel Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start backend in development mode
npm run client       # Start frontend development server
npm run dev-full     # Start both frontend and backend
npm run build        # Build for production
npm run start        # Start production server
```

### Adding New Features

1. **Backend API Routes** - Add new routes in `server.js`
2. **Frontend Components** - Add components in `client/src/components/`
3. **Styling** - Use Tailwind CSS classes or add custom CSS in `index.css`

## 🐛 Troubleshooting

### Common Issues

1. **Google OAuth Error**
   - Check redirect URI matches exactly
   - Ensure Google Calendar API is enabled
   - Verify client ID and secret

2. **Claude API Error**
   - Check API key is valid
   - Ensure sufficient credits
   - Verify request format

3. **CORS Issues**
   - Check frontend/backend URLs in `.env`
   - Verify CORS configuration in `server.js`

### Debug Mode

Enable debug logging:
```bash
DEBUG=* npm run dev
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Support

For support, email support@yourapp.com or create an issue on GitHub.

## 🙏 Acknowledgments

- [Anthropic](https://www.anthropic.com/) for Claude AI
- [Google](https://developers.google.com/calendar) for Calendar API
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide](https://lucide.dev/) for icons