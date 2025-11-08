# Claude AI Assistant Configuration for WarpX Frontend

> 이 문서는 Claude AI와의 협업을 위한 프로젝트 컨텍스트 및 가이드라인을 제공합니다.
> Spec Kit 기반 문서는 [.specify/](./.specify/) 디렉토리를 참고하세요.
> 공통 정보는 [cursor.md](./cursor.md)를 참고하세요.

## 프로젝트 컨텍스트

**WarpX Frontend**는 **warp(x)** 프로젝트의 프론트엔드 애플리케이션입니다. warp(x)는 Privacy-preserving Hybrid Orderbook DEX로, 전통적인 오더북의 효율성과 AMM의 유연성을 결합한 차세대 분산 거래소입니다.

### 프로젝트 비전
warp(x)는 프라이버시 보존, 효율성, 확장성을 단일 플랫폼에서 제공하는 혁신적인 분산 거래 기술을 제공합니다. Zcash shielded pool과 RISC0-verifier 기술을 통합하여 완전히 검증 가능한 프라이빗 트랜잭션을 가능하게 합니다.

### 핵심 기술 스택
- **Next.js 15** (App Router, React 19)
- **TypeScript 5.4.5** (strict mode)
- **Tailwind CSS** + **shadcn/ui**
- **Polkadot.js API** (커스텀 Substrate 런타임)
- **Zustand** (상태 관리) + **React Query** (서버 상태)
- **Yarn Workspaces** (모노레포)

## 협업 가이드라인

### 응답 스타일

1. **명확성과 구체성**
   - 코드 예시는 프로젝트의 실제 구조와 패턴을 따름
   - 파일 경로는 프로젝트 루트 기준 상대 경로 사용
   - 타입 정의는 명시적으로 제공

2. **프로젝트 컨벤션 준수**
   - App Router 구조 유지
   - 기존 컴포넌트/훅 패턴 일관성 유지
   - TypeScript strict mode 준수

3. **모노레포 구조 인식**
   - `packages/frontend/`와 `packages/sdk/` 구분
   - 워크스페이스 스크립트 사용 (`yarn workspace @warpx/...`)

### 코드 제안 시 고려사항

#### 컴포넌트 작성
- **서버/클라이언트 구분**: 필요시 `'use client'` 명시
- **에러 바운더리**: 적절한 에러 처리 포함
- **로딩 상태**: React Query의 `isLoading`, `isError` 활용
- **접근성**: ARIA 속성, 키보드 네비게이션 고려

#### 훅 작성
- **커스텀 훅**: `use` prefix 사용
- **의존성 배열**: React Hook 규칙 준수
- **에러 핸들링**: try-catch 및 사용자 피드백 제공

#### API 통합
- **React Query 패턴**: `useQuery`, `useMutation` 사용
- **타입 안전성**: SDK 생성 타입 활용 (`@warpx/sdk/*`)
- **에러 처리**: 네트워크 에러, 트랜잭션 실패 시나리오 고려

#### 스타일링
- **Tailwind 유틸리티**: 인라인 클래스 사용
- **shadcn/ui 컴포넌트**: `components/ui/`의 컴포넌트 재사용
- **반응형 디자인**: 모바일/데스크톱 고려

### 아키텍처 패턴

#### 상태 관리 전략
- **Zustand**: 글로벌 앱 상태 (`store/`)
- **React Query**: 서버 상태 및 캐싱
- **로컬 상태**: `useState`, `useReducer` (간단한 경우)

#### 데이터 페칭
- **쿼리 정의**: `services/features/[feature]/queries.ts`
- **캐싱 전략**: React Query 기본 설정 활용
- **실시간 업데이트**: WebSocket 구독 (필요시)

#### 트랜잭션 처리
- **훅 사용**: `hooks/useExtrinsic.ts`
- **피드백**: `components/toast/useTxToast.ts`
- **상태 관리**: pending, success, error 상태 처리

### 검증 절차

코드 제안 시 다음을 확인:

1. **타입 안전성**
   - TypeScript 컴파일 에러 없음
   - SDK 타입 올바르게 사용
   - Props/State 타입 명시

2. **프로젝트 구조 준수**
   - 파일 위치가 적절한 디렉토리에 배치
   - 네이밍 컨벤션 준수
   - import 경로 올바름 (`@/*` 별칭 사용)

3. **에러 핸들링**
   - 네트워크 에러 처리
   - 사용자 친화적 에러 메시지
   - 로딩 상태 표시

4. **성능 고려**
   - 불필요한 리렌더링 방지
   - React Query 캐싱 활용
   - 코드 스플리팅 (필요시)

### 제약 조건 및 주의사항

#### 절대 하지 말아야 할 것
- `packages/sdk/src/interfaces/` 파일 직접 수정 (자동 생성)
- 프로젝트 루트 구조 변경 (`packages/` 모노레포 구조 유지)
- Next.js App Router 규칙 위반
- TypeScript strict mode 비활성화

#### 주의해야 할 것
- SDK 타입 생성 필요 시 `yarn workspace @warpx/sdk codegen` 실행 안내
- 모노레포 의존성: `@warpx/sdk`는 로컬 워크스페이스
- 환경 변수: `.env.local` 사용 (Next.js 표준)

### 일반적인 작업 패턴

#### 새 기능 추가
1. 기능 디렉토리 생성 (`app/features/[feature]/` 또는 페이지별)
2. 타입 정의 (`types.ts`)
3. 쿼리/뮤테이션 정의 (`queries.ts`)
4. 커스텀 훅 작성 (`use[Feature].ts`)
5. 컴포넌트 작성
6. 페이지/라우트 연결

#### 버그 수정
1. 문제 재현 및 원인 파악
2. 관련 파일 식별
3. 최소한의 변경으로 수정
4. 에지 케이스 고려
5. 테스트 (가능한 경우)

#### 리팩토링
1. 기존 패턴 유지
2. 점진적 개선
3. 타입 안전성 보장
4. 성능 영향 최소화

### 질문 및 요청 처리

#### 명확한 요청
- 구체적인 파일 경로 제공
- 기대하는 동작 설명
- 관련 컨텍스트 포함

#### 모호한 요청
- 프로젝트 구조 기반으로 최선의 추론
- 여러 옵션 제시 (필요시)
- 추가 정보 요청 (불명확한 경우)

### 참고 자료

Spec Kit 문서:
- [Constitution](./.specify/memory/constitution.md) - 프로젝트 원칙 및 개발 철학
- [Project Specification](./.specify/memory/project-spec.md) - 프로젝트 상세 명세

프로젝트 문서:
- [cursor.md](./cursor.md) - 공통 프로젝트 정보
- [README.md](./README.md) - 프로젝트 개요 및 실행 방법

외부 문서:
- [Next.js App Router](https://nextjs.org/docs/app)
- [Polkadot.js API](https://polkadot.js.org/docs/api/)
- [React Query](https://tanstack.com/query/latest/docs/react/overview)
- [Zustand](https://github.com/pmndrs/zustand)

## 작업 예시

### 컴포넌트 생성 요청 시
```typescript
// 올바른 패턴
'use client'

import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { useApi } from '@/hooks/useApi'

export function MyComponent() {
  const { api } = useApi()
  // ...
}
```

### 훅 생성 요청 시
```typescript
// 올바른 패턴
import { useQuery } from '@tanstack/react-query'
import { useApi } from '@/hooks/useApi'

export function useMyFeature() {
  const { api } = useApi()
  // ...
}
```

### API 쿼리 작성 시
```typescript
// 올바른 패턴
import { useQuery } from '@tanstack/react-query'
import type { ApiPromise } from '@polkadot/api'

export function useMyQuery(api: ApiPromise | undefined) {
  return useQuery({
    queryKey: ['myQuery'],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized')
      // ...
    },
    enabled: !!api,
  })
}
```

---

이 문서는 프로젝트 진행에 따라 업데이트됩니다. 변경 사항이 있으면 팀과 공유해주세요.

