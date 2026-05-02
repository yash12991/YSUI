## Groq API Integration Setup

### What's New?
Your AI UI Generator now supports **Groq API** for faster, more cost-effective AI inference!

- **Groq**: Ultra-fast inference (~10x faster than competitors)
- **Gemini**: Advanced reasoning and creativity
- **Switch between them easily** via environment variables

### 📋 Setup Steps

#### 1. Get a Groq API Key
1. Go to [https://console.groq.com](https://console.groq.com)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new key and **copy it**

#### 2. Update Your `.env.local` File
```bash
cp .env.local.example .env.local
```

Then edit `.env.local`:
```env
# Google Gemini API Key (Optional)
GEMINI_API_KEY=your_gemini_api_key_here

# Groq API Key (Required)
GROQ_API_KEY=your_groq_api_key_here

# Set which provider to use (default: 'groq')
AI_PROVIDER=groq
```

#### 3. Install Dependencies
```bash
npm install
```

This will install the `groq-sdk` package automatically.

### 🚀 Running the App

```bash
npm run dev
```

The app will use **Groq by default** for faster responses!

### 🔄 Switching Between Providers

Simply change the `AI_PROVIDER` variable in `.env.local`:

```env
# Use Groq (fastest, recommended for most tasks)
AI_PROVIDER=groq

# Use Gemini (better for complex reasoning)
AI_PROVIDER=gemini
```

No code changes needed — just restart the dev server.

### 📊 Provider Comparison

| Feature | Groq | Gemini |
|---------|------|--------|
| Speed | ⚡ Ultra-fast (10x faster) | Fast |
| Cost | 💰 Free tier available | Generous free tier |
| Model | Mixtral 8x7b | Gemini 2.5 Flash |
| Best For | UI generation, fast iterations | Complex reasoning, edge cases |

### 🛠️ Technical Details

**Files Added:**
- `src/lib/agents/groqClient.ts` — Groq client setup
- `src/lib/agents/aiProvider.ts` — Unified AI provider (switches between Groq/Gemini)

**Files Modified:**
- `package.json` — Added `groq-sdk` dependency
- `.env.local.example` — Added Groq configuration
- All agent files — Updated to use unified `callAI()` instead of `callGemini()`

### ⚙️ Architecture

```
┌─────────────────────────────────────────┐
│       Agent (Planner, Generator, etc)   │
└──────────────────┬──────────────────────┘
                   │
                   ▼
          ┌────────────────┐
          │  callAI()      │  ← Unified API
          │ (aiProvider)   │
          └────────┬───────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
   ┌─────────────┐     ┌──────────────┐
   │ Groq Client │     │ Gemini Client│
   │ (Fast ⚡)   │     │ (Advanced 🧠)│
   └─────────────┘     └──────────────┘
```

### 🐛 Troubleshooting

**Error: "GROQ_API_KEY environment variable is not set"**
- Make sure you've created `.env.local` and added your Groq API key

**Error: "callAI is not defined"**
- Restart the dev server after installing dependencies

**API rate limits?**
- Groq offers generous free tier
- Check [https://console.groq.com](https://console.groq.com) for your usage

### 💡 Tips

1. **Use Groq for development** — it's faster and free
2. **Use Gemini for complex UIs** — if Groq struggles, switch to Gemini
3. **Monitor your API usage** — both providers offer free tiers
4. **Restart the dev server** — after changing `AI_PROVIDER`

---

Happy UI generating! 🎨
