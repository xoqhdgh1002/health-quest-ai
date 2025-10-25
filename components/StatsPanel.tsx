'use client';

import { useEffect, useState } from 'react';

interface StatsData {
  user: {
    email: string;
    name?: string;
  };
  level: {
    level: number;
    totalXP: number;
    nextLevelXP: number;
  };
  streak: {
    currentStreak: number;
    longestStreak: number;
  };
  badges: Array<{
    badgeInfo: {
      name: string;
      description: string;
    };
    earnedAt: string;
  }>;
  questStats: {
    total: number;
    completed: number;
    todayTotal: number;
    todayCompleted: number;
  };
}

interface StatsPanelProps {
  userId: string;
}

export default function StatsPanel({ userId }: StatsPanelProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/stats?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Listen for stats updates
    const handleStatsUpdate = () => {
      fetchStats();
    };

    window.addEventListener('statsUpdate', handleStatsUpdate);

    return () => {
      window.removeEventListener('statsUpdate', handleStatsUpdate);
    };
  }, [userId]);

  if (loading || !stats) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  const xpProgress = ((stats.level.totalXP % 100) / 100) * 100;

  return (
    <div className="space-y-6">
      {/* User Info */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">
          {stats.user.name || '사용자'}님
        </h3>
        <p className="text-sm text-gray-600">{stats.user.email}</p>
      </div>

      {/* Level */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">레벨</h3>
        <div className="text-center mb-4">
          <div className="text-4xl font-bold text-blue-600">
            레벨 {stats.level.level}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {stats.level.totalXP} / {stats.level.nextLevelXP} XP
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
      </div>

      {/* Streak */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">연속 달성</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {stats.streak.currentStreak}일
            </div>
            <div className="text-xs text-gray-600 mt-1">현재 연속</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {stats.streak.longestStreak}일
            </div>
            <div className="text-xs text-gray-600 mt-1">최고 기록</div>
          </div>
        </div>
      </div>

      {/* Quest Stats */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">퀘스트 통계</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">오늘 완료</span>
            <span className="font-semibold text-gray-800">
              {stats.questStats.todayCompleted} / {stats.questStats.todayTotal}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">총 완료</span>
            <span className="font-semibold text-gray-800">
              {stats.questStats.completed} / {stats.questStats.total}
            </span>
          </div>
        </div>
      </div>

      {/* Badges */}
      {stats.badges.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            획득한 배지 ({stats.badges.length})
          </h3>
          <div className="space-y-2">
            {stats.badges.map((badge, index) => (
              <div
                key={index}
                className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <div className="font-semibold text-yellow-800 text-sm">
                  {badge.badgeInfo.name}
                </div>
                <div className="text-xs text-yellow-600 mt-1">
                  {badge.badgeInfo.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
