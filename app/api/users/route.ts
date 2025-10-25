import { NextResponse } from 'next/server';
import { getDb, saveDb, generateId } from '@/lib/db';

// POST - Create a new user
export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const db = await getDb();

    // Check if user already exists
    const existingUser = db.users.find(u => u.email === email);
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Create new user
    const newUser = {
      id: generateId(),
      email,
      name,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);

    // Initialize streak and level for new user
    db.streaks.push({
      id: generateId(),
      userId: newUser.id,
      currentStreak: 0,
      longestStreak: 0
    });

    db.levels.push({
      id: generateId(),
      userId: newUser.id,
      level: 1,
      totalXP: 0
    });

    await saveDb(db);

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Get user by email (query param)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const userId = searchParams.get('userId');

    const db = await getDb();

    if (email) {
      const user = db.users.find(u => u.email === email);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json(user);
    }

    if (userId) {
      const user = db.users.find(u => u.id === userId);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json(user);
    }

    return NextResponse.json({ error: 'Email or userId parameter is required' }, { status: 400 });
  } catch (error) {
    console.error('Error getting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
