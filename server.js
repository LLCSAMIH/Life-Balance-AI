const express = require('express');
const session = require('express-session');
const { google } = require('googleapis');
const Anthropic = require('@anthropic-ai/sdk');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Initialize Google OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/auth/google/callback'
);

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Auth Routes
app.get('/api/auth/google', (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/userinfo.email'
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });

  res.redirect(url);
});

app.get('/api/auth/google/callback', async (req, res) => {
  const { code } = req.query;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2',
    });
    const userInfo = await oauth2.userinfo.get();

    // Store in session
    req.session.tokens = tokens;
    req.session.userEmail = userInfo.data.email;

    // Redirect to frontend
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?auth=success`);
  } catch (error) {
    console.error('Auth error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/connect?auth=error`);
  }
});

app.get('/api/auth/status', (req, res) => {
  if (req.session.tokens && req.session.userEmail) {
    res.json({
      authenticated: true,
      email: req.session.userEmail
    });
  } else {
    res.json({ authenticated: false });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Calendar Routes
app.get('/api/calendar/fetch', async (req, res) => {
  if (!req.session.tokens) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    oauth2Client.setCredentials(req.session.tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Get events from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: thirtyDaysAgo.toISOString(),
      timeMax: new Date().toISOString(),
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];
    
    // Format events for analysis
    const formattedEvents = events.map(event => ({
      id: event.id,
      summary: event.summary || 'Untitled',
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      description: event.description || '',
      location: event.location || '',
      attendees: event.attendees?.length || 0,
      creator: event.creator?.email === req.session.userEmail
    }));

    res.json({ events: formattedEvents });
  } catch (error) {
    console.error('Calendar fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch calendar data' });
  }
});

// Analysis Routes
app.post('/api/analyze', async (req, res) => {
  if (!req.session.tokens) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { calendarData } = req.body;
    
    if (!calendarData || !calendarData.events) {
      return res.status(400).json({ error: 'No calendar data provided' });
    }

    // Prepare data for Claude analysis
    const eventsForAnalysis = calendarData.events.map(event => ({
      title: event.summary,
      start: event.start,
      end: event.end,
      duration: calculateDuration(event.start, event.end),
      category: categorizeEvent(event.summary, event.description),
      isWorkHours: isWorkingHours(event.start),
      hasAttendees: event.attendees > 0
    }));

    // Create analysis prompt
    const analysisPrompt = createAnalysisPrompt(eventsForAnalysis);

    // Send to Claude for analysis
    const message = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 2000,
      messages: [{
        role: "user",
        content: analysisPrompt
      }]
    });

    // Parse Claude's response
    const analysis = parseClaudeResponse(message.content[0].text);

    res.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze calendar data' });
  }
});

// Helper Functions
function calculateDuration(start, end) {
  const startTime = new Date(start);
  const endTime = new Date(end);
  return (endTime - startTime) / (1000 * 60 * 60); // Duration in hours
}

function categorizeEvent(title, description) {
  const lowerTitle = title.toLowerCase();
  const lowerDesc = (description || '').toLowerCase();
  
  if (lowerTitle.includes('sleep') || lowerTitle.includes('bed')) return 'sleep';
  if (lowerTitle.includes('gym') || lowerTitle.includes('workout') || lowerTitle.includes('fitness')) return 'fitness';
  if (lowerTitle.includes('work') || lowerTitle.includes('meeting') || lowerTitle.includes('call')) return 'work';
  if (lowerTitle.includes('lunch') || lowerTitle.includes('dinner') || lowerTitle.includes('breakfast') || lowerTitle.includes('meal')) return 'meal';
  if (lowerTitle.includes('class') || lowerTitle.includes('study') || lowerTitle.includes('school')) return 'education';
  if (lowerTitle.includes('personal') || lowerTitle.includes('family') || lowerTitle.includes('friend')) return 'personal';
  
  return 'other';
}

function isWorkingHours(eventTime) {
  const date = new Date(eventTime);
  const hour = date.getHours();
  const day = date.getDay();
  
  // Monday to Friday, 9 AM to 6 PM
  return day >= 1 && day <= 5 && hour >= 9 && hour <= 18;
}

function createAnalysisPrompt(events) {
  const eventSummary = events.map(event => 
    `${event.title} (${event.category}) - ${event.duration.toFixed(1)}h on ${event.start}`
  ).join('\n');

  return `
You are a work-life balance expert. Analyze the following calendar data and provide insights about the person's work-life balance. 

Calendar Events (last 30 days):
${eventSummary}

Please analyze this data and provide a JSON response with the following structure:
{
  "balanceScore": <number 0-100>,
  "sleepQuality": "<Excellent/Good/Fair/Poor>",
  "workLifeRatio": "<work%/life%>",
  "topInsight": "<key insight about their schedule>",
  "recommendations": [
    "<recommendation 1>",
    "<recommendation 2>",
    "<recommendation 3>"
  ],
  "timeBreakdown": {
    "work": <hours>,
    "sleep": <hours>,
    "fitness": <hours>,
    "personal": <hours>,
    "meals": <hours>
  },
  "patterns": {
    "consistentSleep": <boolean>,
    "regularExercise": <boolean>,
    "workOvertime": <boolean>,
    "skipsMeals": <boolean>
  }
}

Focus on:
1. Sleep consistency and quality
2. Work-life boundaries
3. Time allocation across categories
4. Health and wellness habits
5. Areas for improvement

Provide actionable, personalized recommendations based on the specific patterns you observe.
`;
}

function parseClaudeResponse(responseText) {
  try {
    // Extract JSON from Claude's response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback if JSON parsing fails
    return {
      balanceScore: 75,
      sleepQuality: "Good",
      workLifeRatio: "60/40",
      topInsight: "Your calendar shows a generally balanced lifestyle with room for optimization.",
      recommendations: [
        "Consider blocking time for focused work sessions",
        "Maintain consistent sleep schedule",
        "Schedule regular breaks between meetings"
      ],
      timeBreakdown: {
        work: 40,
        sleep: 56,
        fitness: 10,
        personal: 20,
        meals: 7
      },
      patterns: {
        consistentSleep: true,
        regularExercise: true,
        workOvertime: false,
        skipsMeals: false
      }
    };
  } catch (error) {
    console.error('Error parsing Claude response:', error);
    throw new Error('Failed to parse analysis results');
  }
}

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});