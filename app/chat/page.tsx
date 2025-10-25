'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatInterface from '@/components/ChatInterface';

export default function ChatPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    if (!savedUserId) {
      router.push('/');
      return;
    }
    setUserId(savedUserId);
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  if (!userId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              건강 도서 Q&A
            </h1>
            <p className="text-gray-600">
              건강/웰니스 도서 내용에 대해 무엇이든 물어보세요!
            </p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            퀘스트로 돌아가기
          </button>
        </header>

        <ChatInterface userId={userId} />
      </div>
    </div>
  );
}
