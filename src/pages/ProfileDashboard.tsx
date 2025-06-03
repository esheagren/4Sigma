import React, { useState, useEffect } from 'react';
import { LineChart, Calendar, Award, History } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { GameResult } from '../types';
import { useAuth } from '../context/AuthContext';

const ProfileDashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [results, setResults] = useState<GameResult[]>([]);
  const [stats, setStats] = useState({
    totalGames: 0,
    averageAccuracy: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalPoints: 0
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData();
    }
  }, [isAuthenticated, user]);

  const loadUserData = async () => {
    try {
      // Fetch user stats from the API
      const response = await fetch(`/api/scores/stats/${user?.id}`);
      if (response.ok) {
        const userStats = await response.json();
        
        // Transform API data to match our stats structure
        setStats({
          totalGames: userStats.totalAttempts || 0,
          averageAccuracy: userStats.averageScore || 0,
          currentStreak: 0, // You might want to add this to your API
          bestStreak: 0, // You might want to add this to your API
          totalPoints: Math.round(userStats.averageScore * userStats.totalAttempts) || 0
        });

        // Transform recent scores to game results format
        if (userStats.recentScores) {
          const gameResults: GameResult[] = userStats.recentScores.map((score: any) => ({
            date: score.date,
            totalPoints: Math.round(score.score),
            correctAnswers: score.score > 50 ? 1 : 0, // Simple heuristic
            totalQuestions: 1,
            questionResults: []
          }));
          setResults(gameResults);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Fallback to mock data for development
      loadMockData();
    }
  };

  const loadMockData = () => {
    // Fallback mock data for development
    const mockResults: GameResult[] = [
      {
        date: new Date(Date.now() - 86400000).toISOString(),
        totalPoints: 245,
        correctAnswers: 2,
        totalQuestions: 3,
        questionResults: []
      },
      {
        date: new Date(Date.now() - 172800000).toISOString(),
        totalPoints: 180,
        correctAnswers: 3,
        totalQuestions: 3,
        questionResults: []
      },
      {
        date: new Date(Date.now() - 259200000).toISOString(),
        totalPoints: 120,
        correctAnswers: 1,
        totalQuestions: 3,
        questionResults: []
      }
    ];
    
    setResults(mockResults);
    
    // Calculate stats from mock data
    const totalGames = mockResults.length;
    const totalCorrect = mockResults.reduce((sum, game) => sum + game.correctAnswers, 0);
    const totalQuestions = mockResults.reduce((sum, game) => sum + game.totalQuestions, 0);
    const averageAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
    const totalPoints = mockResults.reduce((sum, game) => sum + game.totalPoints, 0);
    
    setStats({
      totalGames,
      averageAccuracy,
      currentStreak: 2,
      bestStreak: 3,
      totalPoints
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h1 className="text-3xl font-bold mb-6">Profile Dashboard</h1>
        <div className="bg-white dark:bg-neutral-800 p-8 rounded-lg shadow-md max-w-md w-full">
          <p className="text-neutral-600 dark:text-neutral-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Show sign-in prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h1 className="text-3xl font-bold mb-6">Profile Dashboard</h1>
        <div className="bg-white dark:bg-neutral-800 p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-xl font-semibold mb-4">Sign in to view your profile</h2>
          <p className="text-neutral-600 dark:text-neutral-300 mb-6">
            Track your progress, view statistics, and compare your performance with others.
          </p>
          <div className="space-y-4">
            <button className="w-full px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors flex items-center justify-center gap-2">
              <span>Sign in with GitHub</span>
            </button>
            <button className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors flex items-center justify-center gap-2">
              <span>Sign in with Google</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
      <p className="text-neutral-600 dark:text-neutral-300 mb-2">
        Welcome back, {user?.displayName || user?.username}!
      </p>
      <p className="text-neutral-600 dark:text-neutral-300 mb-8">
        Track your progress and view your statistics
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Accuracy" 
          value={`${stats.averageAccuracy.toFixed(1)}%`} 
          icon={<Award className="h-5 w-5 text-green-600" />} 
        />
        <StatCard 
          title="Current Streak" 
          value={stats.currentStreak.toString()} 
          icon={<Calendar className="h-5 w-5 text-orange-600" />} 
        />
        <StatCard 
          title="Best Streak" 
          value={stats.bestStreak.toString()} 
          icon={<Award className="h-5 w-5 text-purple-600" />} 
        />
        <StatCard 
          title="Total Points" 
          value={stats.totalPoints.toString()} 
          icon={<History className="h-5 w-5 text-blue-600" />} 
        />
      </div>
      
      <Tabs defaultValue="performance">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-6">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="history">Game History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance" className="animate-fadeIn">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Performance Trends
            </h2>
            <div className="h-64 flex items-center justify-center border border-neutral-200 dark:border-neutral-700 rounded-md">
              <p className="text-neutral-500 dark:text-neutral-400">
                Performance chart will appear here
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <PerformanceMetric 
                title="Question Accuracy" 
                value={`${stats.averageAccuracy.toFixed(0)}%`}
                change="+5%" 
                isPositive={true} 
              />
              <PerformanceMetric 
                title="Avg. Score" 
                value={stats.averageAccuracy.toFixed(1)}
                change="-2.8" 
                isPositive={true} 
              />
              <PerformanceMetric 
                title="Total Attempts" 
                value={stats.totalGames.toString()}
                change="+12" 
                isPositive={true} 
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="history" className="animate-fadeIn">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Games
            </h2>
            {results.length > 0 ? (
              <div className="space-y-3">
                {results.map((result, index) => (
                  <GameHistoryItem key={index} result={result} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                  No games played yet
                </p>
                <p className="text-sm text-neutral-400 dark:text-neutral-500">
                  Start playing to see your game history here
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{title}</h3>
        {icon}
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

interface PerformanceMetricProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
}

const PerformanceMetric: React.FC<PerformanceMetricProps> = ({ title, value, change, isPositive }) => {
  return (
    <div className="p-4 bg-neutral-50 dark:bg-neutral-750 rounded-md">
      <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">{title}</h4>
      <p className="text-xl font-bold">{value}</p>
      <p className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {change} {isPositive ? '▲' : '▼'}
      </p>
    </div>
  );
};

interface GameHistoryItemProps {
  result: GameResult;
}

const GameHistoryItem: React.FC<GameHistoryItemProps> = ({ result }) => {
  return (
    <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-750 transition-colors">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium">
            {new Date(result.date).toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Score: {result.correctAnswers}/{result.totalQuestions} correct
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-xl text-primary-600 dark:text-primary-400">
            {result.totalPoints}
          </p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">points</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileDashboard;