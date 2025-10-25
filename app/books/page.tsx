'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BookUpload from '@/components/BookUpload';
import BookList from '@/components/BookList';

export default function BooksPage() {
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
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              내 책 관리
            </h1>
            <p className="text-gray-600">
              PDF 파일을 업로드하면 AI가 책 내용을 학습합니다
            </p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            홈으로 돌아가기
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BookUpload userId={userId} />
          <BookList userId={userId} />
        </div>
      </div>
    </div>
  );
}
