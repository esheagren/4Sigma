import React, { useState, useEffect } from 'react';
import { LineChart, Calendar, Award, History } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { GameResult } from '../types';

const ProfileDashboard: React.FC = () => {
  const [results, setResults] = useState<GameResult[]>([]);
  const [stats, setStats] = useState({
    totalGames: 0,
    averageAccuracy: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalPoints: 0
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // In a real app, we would check authentication status
    const checkAuth = () => {
      // Mock check - this would be replaced with actual auth check
      const mockLoggedIn = localStorage.getItem('mockLoggedIn') === 'true';
      setIsLoggedIn(mockLoggedIn);
      
      if (mockLoggedIn) {
        loadUserData();
      }
    };
    
    checkAuth();
  }, []);

  const loadUserData = () => {
    // Mock data loading - in a real app, this would fetch from a backend
    const savedResults = localStorage.getItem('gameResults');
    if (savedResults) {
      const parsedResults = JSON.parse(savedResults) as GameResult[];
      setResults(parsedResults);
      
      // Calculate stats
      if (parsedResults.length > 0) {
        const totalGames = parsedResults.length;
        const totalCorrect = parsedResults.reduce((sum, game) => sum + game.correctAnswers, 0);
        const totalQuestions = parsedResults.reduce((sum, game) => sum + game.totalQuestions, 0);
        const averageAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
        const totalPoints = parsedResults.reduce((sum, game) => sum + game.totalPoints, 0);
        
        // Calculate streak
        let currentStreak = 0;
        let bestStreak = 0;
        const sortedResults = [...parsedResults].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        // This is a simplified streak calculation
        for (const result of sortedResults) {
          if (result.correctAnswers > 0) {
            currentStreak++;
            bestStreak = Math.max(bestStreak, currentStreak);
          } else {
            break;
          }
        }
        
        setStats({
          totalGames,
          averageAccuracy,
          currentStreak,
          bestStreak,
          totalPoints
        });
      }
    }
  };

  const handleMockLogin = () => {
    localStorage.setItem('mockLoggedIn', 'true');
    setIsLoggedIn(true);
    
    // Create some mock data
    const mockResults: GameResult[] = [
      {
        date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        totalPoints: 245,
        correctAnswers: 2,
        totalQuestions: 3,
        questionResults: []
      },
      {
        date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        totalPoints: 180,
        correctAnswers: 3,
        totalQuestions: 3,
        questionResults: []
      },
      {
        date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        totalPoints: 120,
        correctAnswers: 1,
        totalQuestions: 3,
        questionResults: []
      }
    ];
    
    localStorage.setItem('gameResults', JSON.stringify(mockResults));
    loadUserData();
  };

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h1 className="text-3xl font-bold mb-6">Profile Dashboard</h1>
        <div className="bg-white dark:bg-neutral-800 p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-xl font-semibold mb-4">Sign in to view your profile</h2>
          <p className="text-neutral-600 dark:text-neutral-300 mb-6">
            Track your progress, view statistics, and compare your performance with others.
          </p>
          <div className="space-y-4">
            <button 
              onClick={handleMockLogin}
              className="w-full px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors flex items-center justify-center gap-2"
            >
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
                value="68%" 
                change="+5%" 
                isPositive={true} 
              />
              <PerformanceMetric 
                title="Avg. Interval Width" 
                value="43.2" 
                change="-2.8" 
                isPositive={true} 
              />
              <PerformanceMetric 
                title="Points per Game" 
                value="183" 
                change="+12" 
                isPositive={true} 
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="history" className="animate-fadeIn">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Games
              </h2>
            </div>
            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {results.length > 0 ? (
                results.map((result, index) => (
                  <div key={index} className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-750 transition-colors">
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
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-neutral-600 dark:text-neutral-400">
                    No game history available yet. Play your first game to see results here!
                  </p>
                </div>
              )}
            </div>
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

export default ProfileDashboard;