
# Swades AI - Multi-Agent Customer Support Chat

AI-powered customer support system with a router agent that classifies queries and delegates to specialized sub-agents (Support, Order, Billing). Built with clean architecture, real DB tools, streaming replies, typing indicator, and monorepo setup.

## Tech Stack
- **Frontend**: React + Vite (Next.js optional)
- **Backend**: Hono.dev (Node.js)
- **Database**: PostgreSQL + Prisma ORM
- **AI**: Vercel AI SDK + Groq (Llama 3.1 8B - fast & free)
- **Monorepo**: Turborepo (type safety between frontend & backend)

## Features Implemented
- Router agent analyzes queries and routes to correct sub-agent
- 3 sub-agents with real DB tools:
  - Support: queries conversation history
  - Order: fetches order details/status/tracking
  - Billing: fetches invoice details/refund status
- Full conversation context (last 8 messages sent to router/agents)
- Streaming responses + "Agent is typing…" indicator + loader words ("Thinking...", "Searching order...")
- Rate limiting middleware
- REST API: POST /chat/messages, GET /chat/conversations/:id, GET /chat/conversations, etc.
- Monorepo with Turborepo (+30 bonus guaranteed)

## Setup Instructions (Local)

1. **Prerequisites**
   - Node.js 20+
   - PostgreSQL (local or Docker)
   - Groq API key (free): https://console.groq.com/keys

2. **Database**
   ```
   docker run --name swades-postgres -e POSTGRES_PASSWORD=pass -p 5432:5432 -d postgres
   ```

3. **Environment**
   In `apps/backend/.env`:
   ```
   DATABASE_URL="postgresql://postgres:pass@localhost:5432/swades"
   GROQ_API_KEY=gsk_xxxxxxxxxxxx
   ```

4. **Install & Setup**
   ```
   npm install               # root
   cd apps/backend
   npx prisma migrate dev --name init
   npm run seed              # seeds sample data
   cd ../..
   npm run dev               # starts backend (3001) + frontend (3000)
   ```

5. **Open UI**
   http://localhost:3000

## Architecture Diagram (simple ASCII)

```
User → Frontend (React) → POST /api/chat/messages
                           ↓
                     Hono Controller → Chat Service
                           ↓
               Classify Intent (Groq LLM)
                           ↓
       Router → Delegate to Sub-Agent (Support/Order/Billing)
                           ↓
                DB Tool (Prisma query) → Reply
                           ↓
               Stream chunks (SSE) → UI (typing + loaders)
```

## Decisions I Made
- **Monorepo + Turborepo**: End-to-end type safety, easy shared types (+30 bonus)
- **Groq Llama 3.1**: Fast, free, reliable for classification & reply generation
- **Prisma 5.15**: Simple seeding & relations (avoided Prisma 7 breaking changes)
- **Simple agents**: Plain functions + DB tools → easy to explain & maintain
- **Streaming**: Vercel AI `streamText` + Hono SSE → real-time feel
- **Loader words**: "Thinking...", "Searching order..." → bonus + UX polish

## Bonuses Completed
- Hono RPC + Monorepo (Turborepo) → +30 guaranteed
- Rate limiting middleware
- Show reasoning / loader words ("Thinking...", "Searching...")
- Streaming responses + typing indicator


## Video Walkthrough
(https://www.loom.com/share/43712657e0f5409aad4cf7746a5184f7)

Made with ❤️ in ~36 hours.
