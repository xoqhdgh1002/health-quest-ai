import { NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { getDb, saveDb, generateId } from '@/lib/db';

interface GeneratedQuest {
  title: string;
  description: string;
  category: 'diet' | 'exercise' | 'sleep' | 'other';
  xpReward: number;
}

export async function POST(request: Request) {
  try {
    const { userId, preferences } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const db = await getDb();

    // Check if user exists
    const user = db.users.find(u => u.id === userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if quests already generated for today
    const today = new Date().toISOString().split('T')[0];
    const todayQuests = db.quests.filter(q => {
      const questDate = new Date(q.createdAt).toISOString().split('T')[0];
      return q.userId === userId && questDate === today;
    });

    if (todayQuests.length > 0) {
      return NextResponse.json({
        message: 'Quests already generated for today',
        quests: todayQuests
      });
    }

    // Generate quests using AI
    const prompt = `당신은 건강 웰니스 코치입니다. 사용자를 위한 오늘의 건강 퀘스트 3개를 생성해주세요.

퀘스트 카테고리: diet (식단), exercise (운동), sleep (수면), other (기타)

${preferences ? `사용자 선호사항: ${preferences}` : ''}

각 퀘스트는 다음 형식의 JSON 배열로 반환해주세요:
[
  {
    "title": "퀘스트 제목 (간단명료하게)",
    "description": "퀘스트 상세 설명 (달성 방법 포함)",
    "category": "diet | exercise | sleep | other",
    "xpReward": 50-100 사이의 숫자
  }
]

퀘스트 예시:
- 완전무결 아침 식사하기: 방탄 커피와 단백질 중심의 아침 식사를 준비하세요 (diet, 50xp)
- 30분 산책하기: 점심 후 30분 동안 가벼운 산책을 하세요 (exercise, 60xp)
- 수면 루틴 만들기: 잠들기 1시간 전 블루라이트 차단하고 독서하기 (sleep, 70xp)

실용적이고 달성 가능한 퀘스트 3개를 생성해주세요. JSON 배열만 반환하세요.`;

    try {
      const { text } = await generateText({
        model: openai('gpt-4o-mini'),
        prompt,
      });

      // Parse the generated text
      let questsData: GeneratedQuest[];
      try {
        // Extract JSON from the response (in case there's extra text)
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          questsData = JSON.parse(jsonMatch[0]);
        } else {
          questsData = JSON.parse(text);
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', text);
        // Fallback to default quests
        questsData = [
          {
            title: "건강한 아침 식사하기",
            description: "단백질과 채소가 포함된 균형잡힌 아침 식사를 하세요",
            category: "diet",
            xpReward: 50
          },
          {
            title: "30분 걷기",
            description: "오늘 30분 이상 걷기 운동을 하세요",
            category: "exercise",
            xpReward: 60
          },
          {
            title: "밤 10시 전에 잠자리에 들기",
            description: "충분한 수면을 위해 밤 10시 전에 잠자리에 드세요",
            category: "sleep",
            xpReward: 70
          }
        ];
      }

      // Create quests in database
      const createdQuests = questsData.map(questData => ({
        id: generateId(),
        userId,
        title: questData.title,
        description: questData.description,
        category: questData.category,
        xpReward: questData.xpReward,
        completed: false,
        createdAt: new Date().toISOString()
      }));

      db.quests.push(...createdQuests);
      await saveDb(db);

      return NextResponse.json({
        message: 'Quests generated successfully',
        quests: createdQuests
      }, { status: 201 });

    } catch (aiError) {
      console.error('AI generation error:', aiError);

      // Fallback: Create default quests
      const defaultQuests = [
        {
          id: generateId(),
          userId,
          title: "건강한 식사하기",
          description: "오늘 하루 건강한 식단을 유지하세요",
          category: "diet" as const,
          xpReward: 50,
          completed: false,
          createdAt: new Date().toISOString()
        },
        {
          id: generateId(),
          userId,
          title: "운동하기",
          description: "오늘 30분 이상 운동을 하세요",
          category: "exercise" as const,
          xpReward: 60,
          completed: false,
          createdAt: new Date().toISOString()
        },
        {
          id: generateId(),
          userId,
          title: "충분히 자기",
          description: "오늘 밤 7-8시간 수면을 취하세요",
          category: "sleep" as const,
          xpReward: 70,
          completed: false,
          createdAt: new Date().toISOString()
        }
      ];

      db.quests.push(...defaultQuests);
      await saveDb(db);

      return NextResponse.json({
        message: 'Quests generated successfully (fallback)',
        quests: defaultQuests
      }, { status: 201 });
    }

  } catch (error) {
    console.error('Error generating quests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
