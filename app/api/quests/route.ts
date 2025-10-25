import { NextResponse } from 'next/server';
import { getDb, saveDb, generateId } from '@/lib/db';

// GET - Get quests for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const date = searchParams.get('date'); // YYYY-MM-DD format

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const db = await getDb();

    let quests = db.quests.filter(q => q.userId === userId);

    // Filter by date if provided
    if (date) {
      quests = quests.filter(q => {
        const questDate = new Date(q.createdAt).toISOString().split('T')[0];
        return questDate === date;
      });
    }

    // Sort by creation date (newest first)
    quests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(quests);
  } catch (error) {
    console.error('Error getting quests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new quest
export async function POST(request: Request) {
  try {
    const { userId, title, description, category, xpReward } = await request.json();

    if (!userId || !title || !description || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDb();

    // Check if user exists
    const user = db.users.find(u => u.id === userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const newQuest = {
      id: generateId(),
      userId,
      title,
      description,
      category,
      xpReward: xpReward || 50,
      completed: false,
      createdAt: new Date().toISOString()
    };

    db.quests.push(newQuest);
    await saveDb(db);

    return NextResponse.json(newQuest, { status: 201 });
  } catch (error) {
    console.error('Error creating quest:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
