# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository nature

This is a **pre-implementation design + planning workspace** for a university study-room seat-booking system (复旦大学自习室预约系统), produced for a DevOps course practical project. It is **not a built/runnable application**: there is no `package.json`, no backend, no test runner, and no build system. Treat the contents as three things:

1. **Requirement & planning docs** at the root (Chinese).
2. **A static HTML/JSX design mockup** under `自习室预约/`.
3. **A long Story/Test checklist** that drives downstream implementation in GitHub Projects, Issues, and Actions.

When asked to "add a feature" or "fix a bug," first confirm with the user whether they want changes to the **design mockup**, to the **planning docs**, or to start scaffolding the actual app — these are different tasks.

## Previewing the design mockup

The mockup is loaded by `自习室预约/Fudan Study System.html`, which pulls React 18, ReactDOM, and `@babel/standalone` from unpkg, then `<script type="text/babel" src="...jsx">`-loads each panel.

- **Must serve over HTTP**, not `file://`. `design-canvas.jsx` calls `fetch('./.design-canvas.state.json')` for persisted artboard state; `file://` will silently break it.
- From inside `自习室预约/`: `python3 -m http.server 8000`, then open `http://localhost:8000/Fudan Study System.html`.
- Editing artboard order/labels persists via a host bridge (`window.omelette`/`postMessage` to parent). Outside that host the canvas still renders, but edits don't save.

## JSX architecture (no bundler)

All `.jsx` files in `自习室预约/` are transpiled in-browser by Babel-standalone. Consequences worth knowing before editing:

- **Load order in `Fudan Study System.html` is significant**: `design-canvas.jsx` → `fudan-tokens.jsx` → `student-web-a.jsx` → `student-web-b.jsx` → `admin-web.jsx` → `mobile-ui.jsx`. Each script's top-level `const`s become globals shared with later scripts (the comment in `fudan-tokens.jsx` calls this "exported to window for cross-script sharing"). Don't reorder without checking dependencies.
- **`fudan-tokens.jsx` is the shared design-system file**: exports `F` (color/spacing/shadow tokens — teal/gold Fudan palette) and `PATHS` (SVG icon path strings) consumed by every other panel. Add new colors/icons here, not inline.
- **Three UI surfaces** are mocked, each as full-screen artboards inside the `DesignCanvas` figma-style wrapper:
  - Student Web (PC) — split across `student-web-a.jsx` (login, home, room list, seat selector) and `student-web-b.jsx` (booking confirm, my bookings, check-in, AI assistant, notify center, violation record).
  - Admin Web (PC) — `admin-web.jsx` (dashboard, room mgmt, floor-plan editor, booking records, role mgmt, data reports).
  - Mobile (mini-program style, 390×844) — `mobile-ui.jsx`.
- The top-level `App` in the HTML wires a `TweaksPanel` that toggles admin/mobile sections and brand colors via `postMessage` — only visible when the host activates edit mode.

## Domain rules baked into the design

These rules come from `实践项目要求(周一班).md` and recur throughout the mockup; preserve them when changing screens or writing requirements:

- Bookings are on whole-hour boundaries, max **4 hours per booking** (configurable system parameter).
- Default room hours **07:00–22:00**; some rooms may run overnight.
- Reminder cadence: 15 min before start, 10 min after start if not checked in, **auto-cancel + violation record at +15 min**.
- Check-in via a daily **dynamic per-classroom code** (web) or **QR code** (WeChat/mobile).
- Admin side requires **RBAC** with role/permission/user-role assignment and menu-level filtering.
- Department-restricted rooms (院系自习室) are only bookable by students in that department.
- Seats near power outlets (fixed or movable rail) carry a special marker and are filterable in search.
- Student side must offer a **natural-language assistant** (keyword-based or LLM-backed) for queries like "今晚还有空座吗？", "靠窗的座位", "我今天定了哪里".

## Source-of-truth documents

When writing code, tests, or planning artifacts, consult these in order:

- `实践项目要求(周一班).md` — authoritative requirement statement, evaluation criteria, original course platform expectations, phase milestones (5周/12-13周/期末). Execution docs map those workflow expectations to GitHub.
- `devops.md` — concrete DevOps targets the project will be graded on: Dockerfile + docker-compose for local; auto-deploy to test on green build; manual approval for prod; **>70% test coverage gate**; unit / API / optional UI tests.
- `自习座位预约系统_Story测试描述清单.md` — ~118 user stories grouped into Epics **E0–E5+** (项目治理, RBAC, 资源管理, 规则引擎, 学生端, 签到/提醒/违约, …). Each Story carries a `- [ ]` checkbox and operation+assert-style test cases that double as manual steps and API/E2E automation seeds. This is the file to update when adding/closing stories.

## Conventions to keep

- All user-facing text and most identifiers in design files, requirement docs, and the story list are **simplified Chinese** — keep new content in the same language unless asked otherwise.
- The story checklist uses tags like `优先级:P0` and `迭代:I0` and a four-level Epic/Feature/Story/Task hierarchy. Mirror these when adding entries so GitHub Projects/Issues import stays consistent.
- The mockup uses a **teal-green + warm-gold** Fudan-leaning palette (`F.navy`, `F.gold`); the HTML's `TWEAK_DEFAULTS` overrides default to a different blue (`#003087`) only because the tweaks panel runs separately. Don't "fix" this drift — the panel is intentionally an override layer.
