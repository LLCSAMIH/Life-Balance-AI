import React, { useState, useEffect } from 'react';
import { Calendar, Brain, Shield, Clock, BarChart3, Users, CheckCircle, ArrowRight, Loader2, AlertCircle, RefreshCw, LogOut } from 'lucide-react';

const WorkLifeBalanceApp = () => {
  const [currentView, setCurrentView] = useState('landing'); // landing, auth, analyzing, results
  const [isConnecting, setIsConnecting] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [userEmail, setUserEmail] = useState('');
  const [calendarData, setCalendarData] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [error, setError] = useState('');

  // API call to connect Google Calendar
  const handleGoogleConnect = async () => {
    setIsConnecting(true);
    setError('');
    
    try {
      // Redirect to Google OAuth
      window.location.href = 'http://localhost:3001/api/auth/google';
    } catch (err) {
      setError('Failed to connect to Google Calendar. Please try again.');
      setIsConnecting(false);
    }
  };

  // Start analysis process
  const startAnalysis = async () => {
    setAnalysisProgress(0);
    setCurrentView('analyzing');
    
    try {
      // Fetch calendar data
      setAnalysisProgress(20);
      const calendarResponse = await fetch('http://localhost:3001/api/calendar/fetch', {
        credentials: 'include'
      });
      
      console.log('Calendar response status:', calendarResponse.status);
      
      if (!calendarResponse.ok) {
        throw new Error(`Calendar fetch failed: ${calendarResponse.status}`);
      }
      
      const calendarData = await calendarResponse.json();
      console.log('Calendar data:', calendarData);
      
      // Check for errors in calendar data
      if (calendarData.error) {
        throw new Error(calendarData.error);
      }
      
      setAnalysisProgress(40);
      
      // Send to Claude for analysis
      setAnalysisProgress(60);
      const analysisResponse = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calendarData }),
        credentials: 'include'
      });
      
      if (!analysisResponse.ok) {
        throw new Error(`Analysis failed: ${analysisResponse.status}`);
      }
      
      const results = await analysisResponse.json();
      console.log('Analysis results:', results);
      
      // Check for errors in analysis results
      if (results.error) {
        throw new Error(results.error);
      }
      
      setAnalysisProgress(80);
      
      // Complete analysis
      setAnalysisProgress(100);
      setAnalysisResults(results);
      setCurrentView('results');
      
    } catch (err) {
      console.error('Analysis error:', err);
      setError(`Analysis failed: ${err.message}. Please try again.`);
      setCurrentView('auth');
    }
  };

  const handleReanalyze = () => {
    startAnalysis();
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3001/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    
    setCurrentView('landing');
    setUserEmail('');
    setCalendarData(null);
    setAnalysisResults(null);
    setError('');
    setAnalysisProgress(0);
  };

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for OAuth success parameter first
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('auth') === 'success') {
          // Clear the URL parameter
          window.history.replaceState({}, document.title, window.location.pathname);
          console.log('OAuth success detected, checking auth status...');
        }
        
        // Check authentication status
        const response = await fetch('http://localhost:3001/api/auth/status', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          console.log('Auth status check failed:', response.status);
          return;
        }
        
        const data = await response.json();
        console.log('Auth status response:', data);
        
        if (data.authenticated) {
          setUserEmail(data.email);
          setCurrentView('auth');
          console.log('User authenticated:', data.email);
        }
      } catch (err) {
        console.error('Auth check error:', err);
      }
    };
    
    checkAuth();
  }, []);

  // Landing Page
  if (currentView === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        {/* Header */}
        <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-400 to-purple-400 p-2 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-white">LifeBalance AI</h1>
              </div>
              <button 
                onClick={() => setCurrentView('auth')}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-lg transition-all"
              >
                Sign In
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2 mb-6">
                <Brain className="w-4 h-4 text-blue-300 mr-2" />
                <span className="text-blue-300 text-sm font-medium">Powered by Claude AI</span>
              </div>
              <h1 className="text-6xl font-bold text-white mb-6">
                Analyze Your
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
                  Work-Life Balance
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Connect your Google Calendar and get AI-powered insights about your time allocation, 
                stress patterns, and personalized recommendations for a healthier lifestyle.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button
                onClick={() => setCurrentView('auth')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Connect Google Calendar
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold px-8 py-4 rounded-xl transition-all">
                View Demo
              </button>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
                <div className="bg-gradient-to-r from-green-400 to-blue-400 w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Time Analysis</h3>
                <p className="text-gray-300">Understand how you spend your time across work, sleep, fitness, and personal activities.</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
                <div className="bg-gradient-to-r from-purple-400 to-pink-400 w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">AI Insights</h3>
                <p className="text-gray-300">Get personalized recommendations from Claude AI based on your unique schedule patterns.</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
                <div className="bg-gradient-to-r from-orange-400 to-red-400 w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Privacy First</h3>
                <p className="text-gray-300">Your calendar data is analyzed securely and never stored permanently on our servers.</p>
              </div>
            </div>

            {/* Social Proof */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <div className="flex items-center justify-center gap-8 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">10K+</div>
                  <div className="text-gray-300 text-sm">Analyses completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">4.9★</div>
                  <div className="text-gray-300 text-sm">User rating</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">87%</div>
                  <div className="text-gray-300 text-sm">Report improvements</div>
                </div>
              </div>
              <p className="text-gray-300 text-center italic">
                "LifeBalance AI helped me realize I was working too late and skipping meals. 
                The insights were spot-on and actionable." - Sarah K., Product Manager
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Auth/Connect Page
  if (currentView === 'auth') {
    // If user is authenticated, show analysis button
    if (userEmail) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Connected Successfully!</h2>
              <p className="text-gray-600 mb-2">
                Welcome, {userEmail}
              </p>
              <p className="text-sm text-gray-500">
                Your Google Calendar is now connected and ready for analysis.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <button
              onClick={startAnalysis}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-3 mb-4"
            >
              <Brain className="w-5 h-5" />
              Start AI Analysis
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="text-center">
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
              >
                Use different account
              </button>
            </div>
          </div>
        </div>
      );
    }

    // If not authenticated, show connect button
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Connect Your Calendar</h2>
            <p className="text-gray-600">
              We'll analyze your Google Calendar to provide personalized work-life balance insights.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-700">Secure OAuth 2.0 authentication</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-700">Read-only access to calendar events</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-700">Data processed securely, not stored</span>
            </div>
          </div>

          <button
            onClick={handleGoogleConnect}
            disabled={isConnecting}
            className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-3 mb-4 disabled:opacity-50"
          >
            {isConnecting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <div className="text-center">
            <button
              onClick={() => setCurrentView('landing')}
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              ← Back to home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Analysis Progress Page
  if (currentView === 'analyzing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
          <div className="text-center">
            <div className="bg-gradient-to-r from-purple-500 to-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <Brain className="w-10 h-10 text-white" />
              <div className="absolute inset-0 rounded-full border-4 border-purple-200 animate-pulse"></div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Analyzing Your Calendar</h2>
            <p className="text-gray-600 mb-8">
              Claude AI is reviewing your schedule patterns and generating personalized insights...
            </p>

            <div className="mb-8">
              <div className="bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${analysisProgress}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-600">{analysisProgress}% complete</div>
            </div>

            <div className="space-y-3 text-left">
              <div className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                analysisProgress >= 20 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  analysisProgress >= 20 ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                <span className="text-sm">Connecting to Google Calendar</span>
                {analysisProgress >= 20 && <CheckCircle className="w-4 h-4 ml-auto" />}
              </div>
              
              <div className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                analysisProgress >= 40 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  analysisProgress >= 40 ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                <span className="text-sm">Fetching calendar events</span>
                {analysisProgress >= 40 && <CheckCircle className="w-4 h-4 ml-auto" />}
              </div>
              
              <div className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                analysisProgress >= 60 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  analysisProgress >= 60 ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                <span className="text-sm">Analyzing with Claude AI</span>
                {analysisProgress >= 60 && <CheckCircle className="w-4 h-4 ml-auto" />}
              </div>
              
              <div className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                analysisProgress >= 80 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  analysisProgress >= 80 ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                <span className="text-sm">Generating insights</span>
                {analysisProgress >= 80 && <CheckCircle className="w-4 h-4 ml-auto" />}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results Page
  if (currentView === 'results' && analysisResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">LifeBalance AI</h1>
                  <p className="text-sm text-gray-600">{userEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReanalyze}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Re-analyze
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Results Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Your Work-Life Balance Report</h2>
            <p className="text-gray-600">Generated by Claude AI • Based on your recent calendar data</p>
          </div>

          {/* Score Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Balance Score</h3>
                <BarChart3 className="w-6 h-6" />
              </div>
              <div className="text-4xl font-bold mb-2">{analysisResults.balanceScore}/100</div>
              <p className="text-green-100">Good work-life balance</p>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Sleep Quality</h3>
                <Clock className="w-6 h-6" />
              </div>
              <div className="text-4xl font-bold mb-2">{analysisResults.sleepQuality}</div>
              <p className="text-blue-100">Consistent schedule</p>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Work/Life Ratio</h3>
                <Users className="w-6 h-6" />
              </div>
              <div className="text-4xl font-bold mb-2">{analysisResults.workLifeRatio}</div>
              <p className="text-purple-100">Well balanced</p>
            </div>
          </div>

          {/* Key Insight */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-3 rounded-lg flex-shrink-0">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Key Insight</h3>
                <p className="text-gray-600 text-lg">{analysisResults.topInsight}</p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Personalized Recommendations</h3>
            <div className="space-y-4">
              {analysisResults?.recommendations?.map((rec, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-gray-700">{rec}</p>
                </div>
              )) || <p className="text-gray-500">No recommendations available.</p>}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 text-center">
            <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Ready to improve your work-life balance?</h3>
              <p className="text-purple-100 mb-6">
                Get weekly analysis updates and track your progress over time.
              </p>
              <button className="bg-white text-purple-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-all">
                Set Up Weekly Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default WorkLifeBalanceApp;