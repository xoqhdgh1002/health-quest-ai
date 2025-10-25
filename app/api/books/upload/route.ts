import { NextResponse } from 'next/server';
import { getDb, saveDb, generateId } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const title = formData.get('title') as string;
    const author = formData.get('author') as string | null;

    if (!file || !userId || !title) {
      return NextResponse.json({ error: 'File, userId, and title are required' }, { status: 400 });
    }

    // Check file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse PDF using pdf-parse
    let pdfText = '';
    try {
      // Dynamic import to avoid build issues
      const pdfParse = await import('pdf-parse');
      const data = await pdfParse.default(buffer);
      pdfText = data.text;
    } catch (pdfError) {
      console.error('PDF parsing error:', pdfError);
      return NextResponse.json({ error: 'Failed to parse PDF file' }, { status: 400 });
    }

    if (!pdfText || pdfText.trim().length === 0) {
      return NextResponse.json({ error: 'No text content found in PDF' }, { status: 400 });
    }

    // Limit text length to prevent database bloat (max 500KB)
    const maxTextLength = 500000;
    if (pdfText.length > maxTextLength) {
      pdfText = pdfText.substring(0, maxTextLength);
    }

    const db = await getDb();

    // Check if user exists
    const user = db.users.find(u => u.id === userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create book record
    const newBook = {
      id: generateId(),
      userId,
      title,
      author: author || undefined,
      content: pdfText,
      uploadedAt: new Date().toISOString()
    };

    db.books.push(newBook);
    await saveDb(db);

    return NextResponse.json({
      message: 'Book uploaded successfully',
      book: {
        id: newBook.id,
        title: newBook.title,
        author: newBook.author,
        uploadedAt: newBook.uploadedAt,
        contentLength: pdfText.length
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error uploading book:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
