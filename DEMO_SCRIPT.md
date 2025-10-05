# 🎬 Demo Video Script (3+ minutes)

## Opening (30 seconds) - Problem Statement
**Scene: Show multiple browser tabs (MDN, caniuse.com, blog posts)**

"Hi! I'm demonstrating our Baseline Tooling project for the Chrome hackathon. 

**Show frustration workflow**: As a web developer, I constantly ask: 'Is this CSS feature safe to use?' I find myself jumping between MDN, caniuse.com, and various blogs just to make a simple decision. This uncertainty slows down every project.

**Transition**: What if your development tools could give you instant, authoritative answers? That's exactly what we built."

## Demo Setup (20 seconds) - Show the Solution
**Scene: Open the hosted demo**

"Our solution integrates Baseline data directly into developer workflows. Let me show you our interactive demo at [your-github-pages-url]."

**Show the interface**: "Here's our live demo with a real code editor and live Baseline analysis."

## Core Demo (90 seconds) - Interactive Demo
**Scene: Interactive web interface**

### Part 1: Basic Analysis (30 seconds)
"Let's start with some CSS code..."

**Type in the editor:**
```css
.modern-card {
  word-break: auto-phrase;  /* This will trigger a warning */
  display: grid;            /* This is Baseline */
  gap: 1rem;               /* This is Baseline */
}
```

**Show the results**: "Watch the live analysis - it immediately flags `word-break: auto-phrase` as not Baseline, sourced from our curated exceptions database."

### Part 2: Show Data Sources (30 seconds)
**Click the "Data Sources" tab**

"Our system uses multiple data sources in priority order:
- Curated exceptions for known edge cases
- Local web-features package data  
- Cached Web Platform Dashboard API results
- Smart heuristics for common properties"

**Show each source status**: "All data loads offline-first, making it perfect for CI environments."

### Part 3: Workflow Integration (30 seconds)
**Click "CI Workflow" tab**

"Here's how it works in practice:
1. Developer writes CSS using modern features
2. Our ESLint plugin checks against Baseline data
3. CI blocks deployment of non-Baseline code

This prevents production issues before they happen."

## Real Integration (60 seconds) - Show Actual Tools
**Scene: Switch to VS Code and terminal**

### ESLint Integration (30 seconds)
**Open VS Code with the project**

"Now let's see the real ESLint integration..."

**Run in terminal:**
```powershell
npx eslint example/styles.js -c .eslintrc-baseline.cjs -f stylish
```

**Show the warning**: "Perfect! It catches the same `word-break: auto-phrase` issue with the exact reason from our exceptions database."

### CI Integration (30 seconds)
**Show .github/workflows/lint.yml**

"Our GitHub Actions workflow prefetches the Web Platform Dashboard cache and runs the same checks..."

**Show the workflow file**: "It creates deterministic, network-free validation that any team can rely on."

## Innovation Highlight (30 seconds)
**Scene: Back to demo interface**

"What makes this innovative?

1. **Value-level checking** - We don't just check if 'word-break' exists, we validate specific values like 'auto-phrase'
2. **Multi-source intelligence** - Combines curated data, official APIs, and smart fallbacks
3. **Developer workflow integration** - Works with tools you already use: ESLint, VS Code, GitHub Actions"

## Impact & Usefulness (20 seconds)
**Scene: Show the features showcase section**

"This solves real developer pain:
- No more research loops for feature adoption
- Catch issues in development, not production  
- Team-wide consistency through automated policy
- Works offline and scales to any team size"

## Closing (20 seconds)
**Scene: Show repository and submission**

"The complete project is open source at github.com/KillMonga130/BaseLine-Chrome-hackathon with MIT license.

Thank you for watching - let's make web development faster and more confident with Baseline tooling!"

---

## 🎯 Key Points to Emphasize
- **Real-time analysis** in the web demo
- **Multi-source data** strategy (exceptions → web-features → webstatus → heuristics)  
- **Value-level precision** (not just feature-level)
- **Developer workflow integration** (ESLint, VS Code, CI)
- **Offline-safe operation** for CI environments
- **Open source** and ready to use

## 🎬 Recording Tips
- **Screen resolution**: 1920x1080 or 1280x720
- **Audio**: Clear microphone, no background noise
- **Pace**: Speak clearly, pause between sections
- **Mouse**: Use large cursor, highlight important elements
- **Browser**: Clean browser with no personal bookmarks/extensions visible
- **Transitions**: Smooth transitions between scenes

## 📱 Demo URL for Recording
https://killmonga130.github.io/BaseLine-Chrome-hackathon/

## ⏱️ Timing Breakdown
- Opening: 0:00-0:30
- Demo Setup: 0:30-0:50  
- Interactive Demo: 0:50-2:20
- Real Integration: 2:20-3:20
- Innovation: 3:20-3:50
- Impact: 3:50-4:10
- Closing: 4:10-4:30

**Total: ~4:30 minutes** (exceeds 3-minute requirement)