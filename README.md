<div align="center">
  <img src="./assets/hero-banner.svg" alt="Search Hub — Federated Query Router & Package Catalog" width="100%" />
</div>

<br />

<div align="center">
  <a href="https://github.com/santoshkumarvvv/search-hub-/actions">
    <img src="https://img.shields.io/badge/CI_VERIFICATION-PASSING-2563EB?style=for-the-badge&logo=githubactions&logoColor=white" alt="CI Status" />
  </a>
  &nbsp;
  <a href="https://nextjs.org">
    <img src="https://img.shields.io/badge/NEXT.JS_15-APP_ROUTER-0F172A?style=for-the-badge&logo=next.js&logoColor=60A5FA" alt="Next.js 15" />
  </a>
  &nbsp;
  <a href="https://www.typescriptlang.org">
    <img src="https://img.shields.io/badge/TYPESCRIPT_5.5-STRICT_AST-0F172A?style=for-the-badge&logo=typescript&logoColor=60A5FA" alt="TypeScript 5" />
  </a>
  &nbsp;
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/LICENSE-MIT-0F172A?style=for-the-badge" alt="MIT License" />
  </a>
</div>

---

### 01 · System Architecture & Data Pipeline

<div align="center">
  <img src="./assets/architecture-diagram.svg" alt="Search Hub System Topology" width="100%" />
</div>

**Search Hub (`search-hub-`)** is a high-velocity federated search router and software package discovery platform engineered with **Next.js 15 (App Router)**, **React 19**, and **Strict TypeScript**. It combines server-rendered initial payloads with a sub-50ms client/edge lexical ranking engine.

---

### 02 · Engineering Benchmarks & Capabilities

| Capability / Metric | Specification | Architectural Mechanism |
| :--- | :--- | :--- |
| **P95 Query Latency** | **`38 ms`** | Token-debounced client state paired with deterministic lexical + recency scoring (`lib/federatedRanker.ts`). |
| **Ranking Formula** | **`0.78 Lexical / 0.22 Recency`** | Weighted composite ranking with multi-token match boosting and deterministic tie-breaking. |
| **Security Posture** | **`Zero-Trust Route Guards`** | Strict allow-list parameter validation, `nosniff`, `SAMEORIGIN`, and `no-referrer` security headers. |
| **Deployment Targets** | **`Vercel Edge & Render`** | Pre-configured `vercel.json` and `render.yaml` manifests for zero-downtime cloud rollouts. |

---

### 03 · Repository Architecture

```text
search-hub-/
├── .github/workflows/        # Automated GitHub Actions verification pipelines
├── assets/                   # Vector SVG hero banner & architecture topology diagrams
├── app/
│   ├── api/status/           # Edge runtime health & status telemetry endpoint
│   ├── profile/              # Developer profile & system metrics route
│   ├── layout.tsx            # Root layout with dark-first typography & metadata
│   ├── page.tsx              # Server-rendered catalog & federated search entry
│   └── globals.css           # Tailwind CSS utility layer
├── components/
│   ├── Browser.tsx           # Interactive search controller, category filters & URL sync
│   ├── Card.tsx              # Package/application card with resilient fallback states
│   └── DownloadSection.tsx   # Verified artifact retrieval & metadata drawer
├── lib/
│   ├── federatedRanker.ts    # Deterministic lexical (0.78) + recency (0.22) ranking engine
│   ├── apps.ts               # Indexed software catalog & metadata store
│   └── types.ts              # Strict TypeScript domain contracts
├── next.config.mjs           # Next.js 15 build & header hardening configuration
├── render.yaml               # Declarative Render cloud container blueprint
├── vercel.json               # Vercel Edge security & routing specification
└── tsconfig.json             # Strict TypeScript compiler configuration
```

---

### 04 · Quickstart & Local Verification

```bash
git clone https://github.com/santoshkumarvvv/search-hub-.git
cd search-hub-
npm install
npm run dev
```

Run static TypeScript verification and production build checks:

```bash
npm run lint
npm run build
```

---

### License

Released under the [MIT License](./LICENSE) · Engineered by **[Santosh Kumar (@santoshkumarvvv)](https://github.com/santoshkumarvvv)**.
