# Cursor AI Assistant Configuration for WarpX Frontend

> 이 문서는 Cursor AI와의 협업을 위한 프로젝트 가이드입니다.
> Spec Kit 기반 문서는 [.specify/](./.specify/) 디렉토리를 참고하세요.

## 프로젝트 개요

**WarpX Frontend**는 **warp(x)** 프로젝트의 프론트엔드 애플리케이션입니다. warp(x)는 Privacy-preserving Hybrid Orderbook DEX로, 전통적인 오더북의 효율성과 AMM(자동화 시장 조성자)의 유연성을 결합한 차세대 분산 거래소입니다.

### 핵심 기능
- **Hybrid Orderbook**: AMM과 Orderbook을 결합한 최적 실행 시스템
- **Privacy-preserving Transactions**: Zcash shielded pool + RISC0-verifier (계획)
- **Real-time Trading**: WebSocket 기반 실시간 주문서 및 가격 업데이트
- **Pool Management**: AMM 풀 생성, 유동성 추가/제거, LP 토큰 관리

### 기술 스택
- **프레임워크**: Next.js 15 (App Router) with React 19
- **언어**: TypeScript 5.4.5 (strict mode)
- **스타일링**: Tailwind CSS, shadcn/ui
- **블록체인**: Polkadot.js API, 커스텀 Substrate 런타임 (warp(x) node)
- **상태 관리**: Zustand (글로벌 상태), React Query (서버 상태)
- **모노레포**: Yarn Workspaces (`packages/frontend`, `packages/sdk`)

## 프로젝트 구조

```
warpx-frontend/
├── packages/
│   ├── frontend/          # Next.js 애플리케이션
│   │   ├── src/
│   │   │   ├── app/       # Next.js App Router
│   │   │   ├── components/ # 재사용 가능한 컴포넌트
│   │   │   ├── hooks/     # 커스텀 React 훅
│   │   │   ├── providers/ # Context Providers
│   │   │   ├── services/  # API 클라이언트 및 서비스
│   │   │   └── store/     # Zustand 스토어
│   │   └── public/        # 정적 자산
│   └── sdk/               # Polkadot 타입 생성 및 API 래퍼
│       └── src/interfaces/ # 생성된 타입 정의
```

## 개발 환경 설정

### 필수 요구사항
- Node.js (버전 확인 필요)
- Yarn
- 로컬 Substrate 노드 (RPC 포트: 9988)

### 초기 설정

1. **의존성 설치**
   ```bash
   yarn install
   ```

2. **SDK 타입 생성** (로컬 노드 실행 후)
   ```bash
   # 노드에서 메타데이터 추출
   curl -H "Content-Type: application/json" \
        -d '{"id":"1", "jsonrpc":"2.0", "method": "state_getMetadata", "params":[]}' \
        http://localhost:9988 > packages/sdk/warpx.json
   
   # 타입 생성
   yarn workspace @warpx/sdk codegen
   # 또는 루트에서
   yarn codegen
   ```

3. **개발 서버 실행**
   ```bash
   yarn workspace @warpx/frontend dev
   # 또는
   cd packages/frontend && yarn dev
   ```

## 주요 스크립트

- `yarn format` - Prettier로 코드 포맷팅
- `yarn workspace @warpx/frontend dev` - 개발 서버 시작
- `yarn workspace @warpx/frontend build` - 프로덕션 빌드
- `yarn workspace @warpx/sdk codegen` - Polkadot 타입 생성

## 코드 스타일 및 컨벤션

### TypeScript
- **strict 모드 활성화**: `tsconfig.json`에서 `strict: true`
- **경로 별칭**: `@/*`는 `src/`를 가리킴
- **SDK 타입**: `@warpx/sdk/*`로 접근

### 컴포넌트 구조
- **App Router 사용**: `src/app/` 디렉토리 구조
- **서버/클라이언트 컴포넌트**: 필요시 `'use client'` 지시어 사용
- **컴포넌트 위치**:
  - 페이지별 컴포넌트: `app/[feature]/components/`
  - 공통 컴포넌트: `components/`
  - UI 컴포넌트: `components/ui/` (shadcn/ui)

### 스타일링
- **Tailwind CSS**: 유틸리티 클래스 사용
- **shadcn/ui**: `components/ui/`에 설치된 컴포넌트 사용
- **CSS 변수**: `globals.css`에서 테마 색상 정의
- **Emotion**: `@emotion/react` 사용 (컴파일러 설정됨)

### 파일 네이밍
- 컴포넌트: PascalCase (예: `TradeInput.tsx`)
- 훅: camelCase with `use` prefix (예: `useTradeOperations.ts`)
- 유틸리티: camelCase (예: `utils.ts`)
- 타입: PascalCase (예: `types.ts`)

## 주요 의존성 및 패턴

### 블록체인 통합
- **Polkadot API**: `@polkadot/api`, `@polkadot/extension-dapp`
- **API 인스턴스**: `services/client/warpx.ts`에서 생성 및 관리
- **Wallet 연결**: `hooks/usePolkadotConnect.ts`, `providers/WalletProcider.tsx`
- **트랜잭션**: `hooks/useExtrinsic.ts` 사용

### 상태 관리
- **Zustand**: 글로벌 상태 (`store/`)
  - `wallet.ts`: 지갑 및 API 연결 상태
  - `app.ts`: 앱 전역 상태
- **React Query**: 서버 상태 및 캐싱 (`@tanstack/react-query`)
  - `services/features/*/queries.ts`에서 쿼리 정의

### 주요 기능 모듈
- **거래**: `app/features/trade/`, `app/pools/[pair]/components/trade/`
- **풀 관리**: `app/pools/[pair]/components/pools/`
- **주문서**: `app/pools/[pair]/components/order/`
- **자산**: `services/features/assets/`

## 개발 가이드라인

### 새 기능 추가 시
1. 기능별로 `app/features/` 또는 페이지별 `components/`에 구성
2. 커스텀 훅은 `hooks/` 또는 `app/features/[feature]/`에 배치
3. API 쿼리는 `services/features/[feature]/queries.ts`에 정의
4. 타입은 해당 모듈의 `types.ts`에 정의

### 컴포넌트 작성 시
- Props 타입 명시적 정의
- 에러 바운더리 고려 (필요시)
- 로딩 상태 처리
- 접근성 고려 (ARIA 속성 등)

### 트랜잭션 처리
- `useExtrinsic` 훅 사용
- 토스트 알림: `components/toast/useTxToast.ts`
- 에러 핸들링 및 사용자 피드백 제공

### 테스트
- Jest 설정됨 (`@testing-library/react`)
- 테스트 파일: `__test/` 디렉토리 또는 `*.test.tsx`

## 브랜치 및 커밋 전략

### 브랜치 네이밍
- `feature/[기능명]` - 새 기능 개발
- `fix/[버그명]` - 버그 수정
- `refactor/[리팩토링명]` - 리팩토링

### 커밋 메시지
- 명확하고 간결한 설명
- 변경 사항의 이유 포함 (필요시)

## 문제 해결

### 일반적인 이슈

1. **타입 에러 (SDK 관련)**
   - `yarn workspace @warpx/sdk codegen` 실행
   - 노드가 실행 중이고 RPC 포트가 올바른지 확인

2. **빌드 에러**
   - `yarn install` 재실행
   - `.next` 폴더 삭제 후 재빌드

3. **지갑 연결 문제**
   - Polkadot.js Extension 설치 확인
   - 브라우저 콘솔에서 에러 확인

4. **WebSocket 연결 실패**
   - 노드 RPC 엔드포인트 확인
   - `services/config/polkadot.ts` 설정 확인

## Cursor AI 사용 팁

### 코드 생성 시 고려사항
- 프로젝트의 기존 패턴과 일관성 유지
- TypeScript 타입 명시적 사용
- 에러 핸들링 포함
- 접근성 고려

### 자동화 가능한 작업
- 컴포넌트 생성 시 shadcn/ui 패턴 따르기
- 훅 생성 시 기존 훅 패턴 참고
- API 쿼리 생성 시 React Query 패턴 사용
- 타입 정의 시 SDK 타입 활용

### 주의사항
- SDK 타입은 자동 생성되므로 수동 수정 금지
- `packages/sdk/src/interfaces/` 파일 직접 편집 지양
- 모노레포 구조 유지 (`packages/` 디렉토리 구조)
- Next.js App Router 규칙 준수

## 참고 자료

### Spec Kit 문서
- [Constitution](./.specify/memory/constitution.md) - 프로젝트 원칙 및 개발 철학
- [Project Specification](./.specify/memory/project-spec.md) - 프로젝트 상세 명세

### 프로젝트 문서
- [claude.md](./claude.md) - Claude AI 협업 가이드
- [README.md](./README.md) - 프로젝트 개요 및 실행 방법

### 외부 문서
- [Next.js 문서](https://nextjs.org/docs)
- [Polkadot.js API](https://polkadot.js.org/docs/api/)
- [shadcn/ui](https://ui.shadcn.com/)
- [React Query](https://tanstack.com/query/latest)
- [Zustand](https://zustand-demo.pmnd.rs/)

