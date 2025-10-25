'use client';

import { useEffect, useState } from 'react';

interface Book {
  id: string;
  title: string;
  author?: string;
  uploadedAt: string;
  contentLength: number;
}

interface BookListProps {
  userId: string;
}

export default function BookList({ userId }: BookListProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchBooks = async () => {
    try {
      const res = await fetch(`/api/books?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setBooks(data);
      }
    } catch (error) {
      console.error('Failed to fetch books:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();

    // Listen for book uploads
    const handleBookUploaded = () => {
      fetchBooks();
    };

    window.addEventListener('bookUploaded', handleBookUploaded);

    return () => {
      window.removeEventListener('bookUploaded', handleBookUploaded);
    };
  }, [userId]);

  const handleDelete = async (bookId: string) => {
    if (!confirm('정말로 이 책을 삭제하시겠습니까?')) {
      return;
    }

    setDeleting(bookId);

    try {
      const res = await fetch(`/api/books?bookId=${bookId}&userId=${userId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setBooks(books.filter(b => b.id !== bookId));
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('삭제에 실패했습니다.');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatSize = (bytes: number) => {
    return (bytes / 1024).toFixed(0) + ' KB';
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
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        업로드된 책 ({books.length})
      </h2>

      {books.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">아직 업로드된 책이 없습니다.</p>
          <p className="text-sm">왼쪽에서 PDF 파일을 업로드해주세요.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {books.map((book) => (
            <div
              key={book.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {book.title}
                  </h3>
                  {book.author && (
                    <p className="text-sm text-gray-600 mb-2">
                      저자: {book.author}
                    </p>
                  )}
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>{formatDate(book.uploadedAt)}</span>
                    <span>{formatSize(book.contentLength)}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(book.id)}
                  disabled={deleting === book.id}
                  className="ml-4 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed text-sm"
                >
                  {deleting === book.id ? '삭제 중...' : '삭제'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
