import { NextResponse } from 'next/server';
import { getDb, saveDb, generateId } from '@/lib/db';

// Calculate XP needed for each level
function getXPForLevel(level: number): number {
  return level * 100; // Simple formula: level 2 = 200 XP, level 3 = 300 XP, etc.
}

// Check and award badges
async function checkAndAwardBadges(userId: string, db: any) {
  const newBadges: any[] = [];

  // Get user's current data
  const userLevel = db.levels.find((l: any) => l.userId === userId);
  const userStreak = db.streaks.find((s: any) => s.userId === userId);
  const completedQuests = db.quests.filter((q: any) => q.userId === userId && q.completed).length;
  const currentBadges = db.userBadges.filter((ub: any) => ub.userId === userId);

  for (const badge of db.badges) {
    // Check if user already has this badge
    const alreadyHas = currentBadges.some((ub: any) => ub.badgeId === badge.id);
    if (alreadyHas) continue;

    const requirement = JSON.parse(badge.requirement);

    let shouldAward = false;

    switch (requirement.type) {
      case 'streak':
        if (userStreak && userStreak.currentStreak >= requirement.value) {
          shouldAward = true;
        }
        break;
      case 'level':
        if (userLevel && userLevel.level >= requirement.value) {
          shouldAward = true;
        }
        break;
      case 'totalQuests':
        if (completedQuests >= requirement.value) {
          shouldAward = true;
        }
        break;
    }

    if (shouldAward) {
      const newBadge = {
        id: generateId(),
        userId,
        badgeId: badge.id,
        earnedAt: new Date().toISOString()
      };
      db.userBadges.push(newBadge);
      newBadges.push({ ...newBadge, badgeInfo: badge });
    }
  }

  return newBadges;
}

export async function POST(request: Request) {
  try {
    const { questId, userId } = await request.json();

    if (!questId || !userId) {
      return NextResponse.json({ error: 'questId and userId are required' }, { status: 400 });
    }

    const db = await getDb();

    // Find the quest
    const quest = db.quests.find(q => q.id === questId && q.userId === userId);
    if (!quest) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 });
    }

    if (quest.completed) {
      return NextResponse.json({ error: 'Quest already completed' }, { status: 400 });
    }

    // Mark quest as completed
    quest.completed = true;
    quest.completedAt = new Date().toISOString();

    // Add XP
    const xpHistory = {
      id: generateId(),
      userId,
      amount: quest.xpReward,
      reason: `Completed quest: ${quest.title}`,
      questId: quest.id,
      createdAt: new Date().toISOString()
    };
    db.xpHistory.push(xpHistory);

    // Update level
    let level = db.levels.find(l => l.userId === userId);
    if (!level) {
      level = {
        id: generateId(),
        userId,
        level: 1,
        totalXP: 0
      };
      db.levels.push(level);
    }

    level.totalXP += quest.xpReward;

    // Check for level up
    let leveledUp = false;
    let newLevel = level.level;
    while (level.totalXP >= getXPForLevel(newLevel + 1)) {
      newLevel++;
      leveledUp = true;
    }
    level.level = newLevel;

    // Update streak
    let streak = db.streaks.find(s => s.userId === userId);
    if (!streak) {
      streak = {
        id: generateId(),
        userId,
        currentStreak: 0,
        longestStreak: 0
      };
      db.streaks.push(streak);
    }

    const today = new Date().toISOString().split('T')[0];
    const lastQuestDate = streak.lastQuestDate ? new Date(streak.lastQuestDate).toISOString().split('T')[0] : null;

    if (!lastQuestDate || lastQuestDate !== today) {
      // Check if yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastQuestDate === yesterdayStr) {
        // Continue streak
        streak.currentStreak += 1;
      } else {
        // Reset streak
        streak.currentStreak = 1;
      }

      streak.lastQuestDate = new Date().toISOString();

      if (streak.currentStreak > streak.longestStreak) {
        streak.longestStreak = streak.currentStreak;
      }
    }

    // Check and award badges
    const newBadges = await checkAndAwardBadges(userId, db);

    await saveDb(db);

    return NextResponse.json({
      quest,
      xpGained: quest.xpReward,
      level: level.level,
      totalXP: level.totalXP,
      leveledUp,
      streak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      newBadges
    });
  } catch (error) {
    console.error('Error completing quest:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
