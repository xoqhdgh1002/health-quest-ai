import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';

// GET - Get all books for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const db = await getDb();

    const userBooks = db.books
      .filter(book => book.userId === userId)
      .map(book => ({
        id: book.id,
        title: book.title,
        author: book.author,
        uploadedAt: book.uploadedAt,
        contentLength: book.content.length
      }))
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    return NextResponse.json(userBooks);
  } catch (error) {
    console.error('Error getting books:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a book
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    const userId = searchParams.get('userId');

    if (!bookId || !userId) {
      return NextResponse.json({ error: 'bookId and userId are required' }, { status: 400 });
    }

    const db = await getDb();

    const bookIndex = db.books.findIndex(b => b.id === bookId && b.userId === userId);
    if (bookIndex === -1) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    db.books.splice(bookIndex, 1);
    await saveDb(db);

    return NextResponse.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
