import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_PATH, 'db.json');

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

export interface Quest {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: 'diet' | 'exercise' | 'sleep' | 'other';
  xpReward: number;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface Streak {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastQuestDate?: string;
}

export interface XPHistory {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  questId?: string;
  createdAt: string;
}

export interface Level {
  id: string;
  userId: string;
  level: number;
  totalXP: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  requirement: string;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: string;
}

export interface Book {
  id: string;
  userId: string;
  title: string;
  author?: string;
  content: string;
  uploadedAt: string;
}

export interface Database {
  users: User[];
  quests: Quest[];
  streaks: Streak[];
  xpHistory: XPHistory[];
  levels: Level[];
  badges: Badge[];
  userBadges: UserBadge[];
  books: Book[];
}

const defaultDb: Database = {
  users: [],
  quests: [],
  streaks: [],
  xpHistory: [],
  levels: [],
  books: [],
  badges: [
    {
      id: 'badge-1',
      name: '3일 연속 달성',
      description: '3일 연속으로 퀘스트를 완료했습니다!',
      requirement: JSON.stringify({ type: 'streak', value: 3 })
    },
    {
      id: 'badge-2',
      name: '7일 연속 달성',
      description: '일주일 연속으로 퀘스트를 완료했습니다!',
      requirement: JSON.stringify({ type: 'streak', value: 7 })
    },
    {
      id: 'badge-3',
      name: '레벨 5 달성',
      description: '레벨 5에 도달했습니다!',
      requirement: JSON.stringify({ type: 'level', value: 5 })
    },
    {
      id: 'badge-4',
      name: '레벨 10 달성',
      description: '레벨 10에 도달했습니다!',
      requirement: JSON.stringify({ type: 'level', value: 10 })
    },
    {
      id: 'badge-5',
      name: '퀘스트 마스터',
      description: '총 20개의 퀘스트를 완료했습니다!',
      requirement: JSON.stringify({ type: 'totalQuests', value: 20 })
    }
  ],
  userBadges: []
};

async function ensureDbExists() {
  try {
    await fs.mkdir(DB_PATH, { recursive: true });
    try {
      await fs.access(DB_FILE);
    } catch {
      await fs.writeFile(DB_FILE, JSON.stringify(defaultDb, null, 2));
    }
  } catch (error) {
    console.error('Error ensuring DB exists:', error);
  }
}

export async function getDb(): Promise<Database> {
  await ensureDbExists();
  try {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return defaultDb;
  }
}

export async function saveDb(db: Database): Promise<void> {
  await ensureDbExists();
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
