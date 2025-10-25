'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import QuestList from '@/components/QuestList';
import StatsPanel from '@/components/StatsPanel';
import LoginForm from '@/components/LoginForm';

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const savedUserId = localStorage.getItem('userId');
    if (savedUserId) {
      setUserId(savedUserId);
    }
    setLoading(false);
  }, []);

  const handleLogin = (id: string) => {
    setUserId(id);
    localStorage.setItem('userId', id);
  };

  const handleLogout = () => {
    setUserId(null);
    localStorage.removeItem('userId');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  if (!userId) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-4xl font-bold text-gray-800">
            건강 퀘스트 AI
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/books')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              책 관리
            </button>
            <button
              onClick={() => router.push('/chat')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              책 내용 Q&A
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              로그아웃
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <QuestList userId={userId} />
          </div>
          <div>
            <StatsPanel userId={userId} />
          </div>
        </div>
      </div>
    </div>
  );
}
