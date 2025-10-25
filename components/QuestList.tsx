'use client';

import { useEffect, useState } from 'react';
import { Quest } from '@/lib/db';

interface QuestListProps {
  userId: string;
}

export default function QuestList({ userId }: QuestListProps) {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [completingQuest, setCompletingQuest] = useState<string | null>(null);

  const fetchQuests = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(`/api/quests?userId=${userId}&date=${today}`);
      if (res.ok) {
        const data = await res.json();
        setQuests(data);
      }
    } catch (error) {
      console.error('Failed to fetch quests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuests();
  }, [userId]);

  const generateQuests = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-quests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (res.ok) {
        const data = await res.json();
        setQuests(data.quests);
      }
    } catch (error) {
      console.error('Failed to generate quests:', error);
    } finally {
      setGenerating(false);
    }
  };

  const completeQuest = async (questId: string) => {
    setCompletingQuest(questId);
    try {
      const res = await fetch('/api/quests/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId, userId })
      });

      if (res.ok) {
        const result = await res.json();

        // Show completion message
        let message = `퀘스트 완료! +${result.xpGained}XP\n`;

        if (result.leveledUp) {
          message += `레벨업! 레벨 ${result.level}이 되었습니다!\n`;
        }

        if (result.streak > 1) {
          message += `${result.streak}일 연속 달성!\n`;
        }

        if (result.newBadges && result.newBadges.length > 0) {
          message += `새로운 배지 획득: ${result.newBadges.map((b: any) => b.badgeInfo.name).join(', ')}`;
        }

        alert(message);

        // Refresh quests
        await fetchQuests();

        // Trigger stats refresh
        window.dispatchEvent(new CustomEvent('statsUpdate'));
      }
    } catch (error) {
      console.error('Failed to complete quest:', error);
      alert('퀘스트 완료에 실패했습니다.');
    } finally {
      setCompletingQuest(null);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'diet':
        return 'bg-green-100 text-green-800';
      case 'exercise':
        return 'bg-blue-100 text-blue-800';
      case 'sleep':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'diet':
        return '식단';
      case 'exercise':
        return '운동';
      case 'sleep':
        return '수면';
      default:
        return '기타';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          오늘의 건강 퀘스트
        </h2>
        {quests.length === 0 && (
          <button
            onClick={generateQuests}
            disabled={generating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {generating ? '생성 중...' : '퀘스트 생성'}
          </button>
        )}
      </div>

      {quests.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">오늘의 퀘스트가 없습니다.</p>
          <p className="text-sm">AI가 맞춤형 퀘스트를 생성해드립니다!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {quests.map((quest) => (
            <div
              key={quest.id}
              className={`border-2 rounded-lg p-4 transition ${
                quest.completed
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(quest.category)}`}>
                      {getCategoryLabel(quest.category)}
                    </span>
                    <span className="text-sm font-semibold text-yellow-600">
                      +{quest.xpReward}XP
                    </span>
                  </div>
                  <h3 className={`text-lg font-semibold mb-1 ${quest.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                    {quest.title}
                  </h3>
                  <p className={`text-sm ${quest.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                    {quest.description}
                  </p>
                </div>
                <div className="ml-4">
                  {quest.completed ? (
                    <div className="text-green-600 font-semibold">
                      완료!
                    </div>
                  ) : (
                    <button
                      onClick={() => completeQuest(quest.id)}
                      disabled={completingQuest === quest.id}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                    >
                      {completingQuest === quest.id ? '처리 중...' : '완료'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="mt-6 text-center">
            <button
              onClick={generateQuests}
              disabled={generating}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:bg-gray-100"
            >
              {generating ? '생성 중...' : '새로운 퀘스트 생성'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
