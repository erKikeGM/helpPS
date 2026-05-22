# HelpPS — Safety Mind Relationship Support Platform

HelpPS is a safety-first, agentic relationship support prototype. It gives adults a calm chat interface where they can describe relational distress, receive grounded support, and be routed away from ordinary AI conversation when safety, coercion, self-harm, child risk, or crisis signals appear.

The product is guided by the Safety Mind Framework in `BRD.md`: relief first, safety before reframing, no clinical claims, no surveillance, no AI companion behavior, and no engagement-driven dependency loops.

## What It Does

- Provides a minimal, human-feeling support chat.
- Runs a local safety and routing precheck before provider calls.
- Supports OpenAI, Groq, and Gemini through admin-configured API keys.
- Uses only providers with saved API keys; unkeyed providers are not used by the runtime.
- Falls back to the next keyed provider if the configured provider fails.
- Keeps crisis/refusal guardrails local so unsafe requests do not become normal model prompts.
- Includes a Burnout Load Audit for cumulative stressors.
- Includes an Admin Console for agent/model configuration.
- Shows audit traces for model handoffs and safety decisions.
- Includes light and dark mode.

## What It Is Not

HelpPS is not therapy, diagnosis, legal advice, crisis response, a marriage-saving service, surveillance tooling, or an AI companion. It should never be used to calm someone into tolerating danger.

## Core Safety Principles

- Safety screening happens before model response generation.
- Safety signals override reflection and reframing.
- Partner data is never exposed.
- Couple features remain gated in this Phase 1 prototype.
- The one-side-of-the-story principle is enforced.
- Requests for surveillance, hacking, secret monitoring, or evidence packages are refused.
- Crisis and coercion signals route toward human support and protective planning.

## Agentic Architecture

The prototype models the following roles:

- Safety Classifier
- Safety Mind Classifier
- Protective Router
- One-Side-of-Story Layer
- Reflection & Relief Coach
- Safety Mind Recovery Coach
- Burnout Load Audit Agent
- Approved Content Delivery Agent
- Safety Planner & Resource Navigator
- Crisis Handoff Logic
- Privacy, Consent & Residency Validator
- Phase 2 Couple Mediation Agent, gated by default

Provider selection is configured in the Admin Console. A role can be assigned to OpenAI, Groq, or Gemini, but the runtime will only call a provider if an API key is saved locally.

## Tech Stack

- React 19
- TypeScript
- Vite
- Lucide React icons
- Plain CSS with a custom responsive design system

## Getting Started

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:5173/
```

## API Keys

Open the Admin Console and add keys for the providers you want to use:

- OpenAI
- Groq
- Gemini

For this prototype, keys are stored in browser local storage. Production should move provider calls behind a server-side gateway with consent checks, audit logging, rate limits, secret management, and regional processing controls.

## Scripts

```bash
npm run dev      # Start local dev server
npm run build    # Typecheck and build
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Project Structure

```text
BRD.md              Business requirements and safety methodology
src/App.tsx         Main UI and state orchestration
src/engine.ts       Local safety classification, routing, traces, and load scoring
src/llm.ts          Provider-gated OpenAI/Groq/Gemini runtime calls
src/data.ts         Agent roles, provider catalog, resources, and audit seed data
src/types.ts        Shared TypeScript types
src/styles.css      Light/dark responsive UI system
```

## Current Phase

This implementation is a Phase 1 individual-mode prototype. Couple features are intentionally gated until safety review, red-team testing, and phase-gate evidence exist.

## Verification

Current checks:

```bash
npm run lint
npm run build
```

Both should pass before pushing changes.
