import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const db = await getDb();

    // Get user
    const user = db.users.find(u => u.id === userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get level
    const level = db.levels.find(l => l.userId === userId);

    // Get streak
    const streak = db.streaks.find(s => s.userId === userId);

    // Get badges
    const userBadges = db.userBadges.filter(ub => ub.userId === userId);
    const badges = userBadges.map(ub => {
      const badge = db.badges.find(b => b.id === ub.badgeId);
      return {
        ...ub,
        badgeInfo: badge
      };
    });

    // Get quest statistics
    const allQuests = db.quests.filter(q => q.userId === userId);
    const completedQuests = allQuests.filter(q => q.completed);
    const todayQuests = allQuests.filter(q => {
      const questDate = new Date(q.createdAt).toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      return questDate === today;
    });

    return NextResponse.json({
      user,
      level: {
        level: level?.level || 1,
        totalXP: level?.totalXP || 0,
        nextLevelXP: (level?.level || 1) * 100 + 100
      },
      streak: {
        currentStreak: streak?.currentStreak || 0,
        longestStreak: streak?.longestStreak || 0,
        lastQuestDate: streak?.lastQuestDate
      },
      badges,
      questStats: {
        total: allQuests.length,
        completed: completedQuests.length,
        todayTotal: todayQuests.length,
        todayCompleted: todayQuests.filter(q => q.completed).length
      }
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
