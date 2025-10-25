# 건강 퀘스트 AI

건강/웰니스 도서를 기반으로 한 게이미피케이션 건강 관리 앱입니다.

## 주요 기능

### Phase 1: 일일 건강 퀘스트 시스템
- **AI 기반 퀘스트 생성**: OpenAI를 활용한 맞춤형 일일 건강 퀘스트 자동 생성
- **퀘스트 카테고리**: 식단(diet), 운동(exercise), 수면(sleep), 기타(other)
- **XP 시스템**: 퀘스트 완료 시 경험치(XP) 획득
- **연속 달성(Streak)**: 매일 퀘스트를 완료하여 연속 기록 달성

### Phase 2: 레벨 & 배지 시스템
- **레벨 시스템**: XP를 쌓아 레벨업
- **배지 획득**: 특정 조건 달성 시 배지 획득
  - 3일 연속 달성
  - 7일 연속 달성
  - 레벨 5/10 달성
  - 퀘스트 마스터 (20개 완료)

### Phase 3: 책 내용 Q&A
- **AI 챗봇**: 건강/웰니스 도서 내용 기반 질문 답변
- **포함 도서**:
  - 최강의 식사 (The Bulletproof Diet)
  - 수면 혁명 (Sleep Revolution)
  - 당신도 장수할 수 있다 (Lifespan)
  - 운동의 과학

## 기술 스택

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: JSON 파일 기반 저장소
- **AI**: OpenAI GPT-4o-mini (Vercel AI SDK)

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일에 OpenAI API 키를 설정하세요:

```bash
OPENAI_API_KEY=your-openai-api-key-here
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어주세요.

## 사용 방법

1. **로그인**: 이메일로 간편 로그인 (자동 회원가입)
2. **퀘스트 생성**: "퀘스트 생성" 버튼으로 오늘의 건강 퀘스트 생성
3. **퀘스트 완료**: 퀘스트를 완료하면 "완료" 버튼 클릭
4. **XP & 레벨업**: 퀘스트 완료로 XP를 획득하고 레벨업
5. **연속 달성**: 매일 퀘스트를 완료하여 연속 기록 달성
6. **배지 획득**: 특정 조건 달성 시 자동으로 배지 획득
7. **Q&A**: "책 내용 Q&A" 버튼으로 건강 도서 관련 질문

## 프로젝트 구조

```
health-quest-ai/
├── app/
│   ├── api/
│   │   ├── users/         # 사용자 API
│   │   ├── quests/        # 퀘스트 API
│   │   ├── stats/         # 통계 API
│   │   └── ai/
│   │       ├── generate-quests/  # AI 퀘스트 생성
│   │       └── chat/             # AI 챗봇
│   ├── chat/              # Q&A 페이지
│   └── page.tsx           # 메인 페이지
├── components/
│   ├── LoginForm.tsx      # 로그인 폼
│   ├── QuestList.tsx      # 퀘스트 목록
│   ├── StatsPanel.tsx     # 통계 패널
│   └── ChatInterface.tsx  # 챗봇 인터페이스
├── lib/
│   └── db.ts              # 데이터베이스 유틸
└── data/
    └── db.json            # JSON 데이터베이스
```

## API 엔드포인트

### 사용자
- `POST /api/users` - 사용자 생성
- `GET /api/users?email={email}` - 사용자 조회

### 퀘스트
- `GET /api/quests?userId={userId}&date={date}` - 퀘스트 목록 조회
- `POST /api/quests` - 퀘스트 생성
- `POST /api/quests/complete` - 퀘스트 완료

### 통계
- `GET /api/stats?userId={userId}` - 사용자 통계 조회

### AI
- `POST /api/ai/generate-quests` - AI 퀘스트 생성
- `POST /api/ai/chat` - AI 챗봇 (스트리밍)

## 배포

Vercel에 배포하는 것을 권장합니다:

```bash
npm run build
```

## 라이선스

MIT
