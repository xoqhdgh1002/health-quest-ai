import { NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const runtime = 'edge';

const HEALTH_BOOKS_CONTEXT = `
당신은 건강/웰니스 전문가이자 도서 가이드입니다. 다음 건강 도서들의 내용을 기반으로 사용자의 질문에 답변합니다:

**주요 도서:**

1. **최강의 식사 (The Bulletproof Diet)** - 데이브 아스프리
   - 핵심 개념: 방탄 커피, 완전무결 식단, 인슐린 저항성 개선
   - 주요 원칙: 좋은 지방 섭취, 간헐적 단식, 독소 제거
   - 추천 식품: MCT 오일, 그래스페드 버터, 유기농 채소, 양질의 단백질
   - 피해야 할 식품: 가공식품, 정제 탄수화물, 독소가 많은 음식

2. **수면 혁명 (Sleep Revolution)** - 아리아나 허핑턴
   - 핵심 개념: 수면의 중요성, 수면 부족의 위험성
   - 주요 원칙: 7-8시간 수면, 수면 루틴 만들기, 블루라이트 차단
   - 실천 방법: 일정한 수면 시간, 침실 환경 최적화, 취침 전 디지털 디톡스

3. **당신도 장수할 수 있다 (Lifespan)** - 데이비드 싱클레어
   - 핵심 개념: 노화는 질병이다, 노화 방지 방법
   - 주요 원칙: 칼로리 제한, 운동, 적절한 스트레스
   - 실천 방법: 간헐적 단식, HIIT 운동, 저온 노출, NAD+ 증가

4. **운동의 과학**
   - 핵심 개념: 효과적인 운동 방법
   - 주요 원칙: 근력 운동, 유산소 운동, 유연성 운동의 균형
   - 실천 방법: 주 3-5회 운동, 점진적 과부하, 충분한 휴식

**답변 지침:**
1. 전문적이고 신뢰할 수 있는 정보 제공
2. 책의 구체적인 내용과 실용적인 조언 제공
3. 필요시 책 제목과 저자 언급
4. 실천 가능한 구체적인 방법 제시
5. 간결하고 이해하기 쉬운 답변
6. 의학적 조언이 필요한 경우 전문의 상담 권장
`;

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    // Add system context
    const messagesWithContext = [
      { role: 'system', content: HEALTH_BOOKS_CONTEXT },
      ...messages
    ];

    const result = await streamText({
      model: openai('gpt-4o-mini'),
      messages: messagesWithContext,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
